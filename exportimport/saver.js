const sqlite=require("better-sqlite3");

function openDB(input, configs, metadata){
  var db=new sqlite(input, {fileMustExist: true});
  //Read the termbase configs:
  var sqlSelectConfigs=db.prepare("select * from configs");
  sqlSelectConfigs.all().map(row => {
    configs[row.id]=JSON.parse(row.json);
  });
  //Read the termbase metadata:
  var sqlSelectMetadata=db.prepare("select * from metadata");
  sqlSelectMetadata.all().map(row => {
    metadata.push({
      id: row.id,
      type: row.type,
      sortkey: row.sortkey,
      parent_id: row.parent_id,
      json: JSON.parse(row.json),
    });
  });
  return db;
}

function saveEntry(db, configs, metadata, entry){
  //translate metadata in the entry:
  entry=addMetadata(db, metadata, entry);
  //insert the entry:
  var insEntry=db.prepare("insert into entries(json, cStatus, pStatus, dStatus, dateStamp, tod) values(?, ?, ?, ?, ?, ?)");
  var insEntryInfo=insEntry.run(JSON.stringify(entry), entry.cStatus, entry.pStatus, entry.dStatus, entry.dateStamp, entry.tod);
  var entryID=insEntryInfo.lastInsertRowid;
  //for each desig:
  entry.desigs.map(desig => {
    addLanguage(db, configs, desig.term.lang);
    addTerm(db, configs, entryID, desig);
  });
  //insert sortkeys:
  configs.lingo.languages.map(lang => {
    if(lang.role=="major"){
      var str="";
      entry.desigs.map(desig => { if(desig.term.lang==lang.abbr) str+=desig.term.wording; });
      var abc=configs.abc[lang.abbr] || defaultAbc;
      var sortkey=toSortkey(str, abc);
      var insSortkey=db.prepare("insert into entry_sortkey(entry_id, lang, key) values(?, ?, ?)");
      insSortkey.run(entryID, lang.abbr, sortkey);
    }
  });
  //index domains:
  entry.domains.map(domainID => {
    var ins=db.prepare("insert into entry_domain(entry_id, domain) values(?, ?)");
    var insInfo=ins.run(entryID, domainID);
  });
  //index collections:
  entry.collections.map(collectionID => {
    var ins=db.prepare("insert into entry_collection(entry_id, collection) values(?, ?)");
    var insInfo=ins.run(entryID, collectionID);
  });
  //index definitions:
  entry.definitions.map(def => {
    for(var langCode in def.texts){
      var ins=db.prepare("insert into entry_def(entry_id, text) values(?, ?)");
      var insInfo=ins.run(entryID, def.texts[langCode]);
    }
  });
  //index examples:
  entry.examples.map(ex => {
    for(var langCode in ex.texts){
      ex.texts[langCode].map(text => {
        var ins=db.prepare("insert into entry_xmpl(entry_id, text) values(?, ?)");
        var insInfo=ins.run(entryID, text);
      });
    }
  });
  //resave the entry:
  var updEntry=db.prepare('update entries set json=? where id=?');
  updEntry.run(JSON.stringify(entry), entryID);
}

function addMetadata(db, metadata, entry){
  //find one language for metadata labels:
  var lang="";
  entry.desigs.map(desig => {
    if(!lang) lang=desig.term.lang;
  });
  if(!lang) lang="xx";

  var entryString=JSON.stringify(entry);
  // console.log(entryString);

  //part-of-speech labels:
  entryString=entryString.replace(/\$POSLABEL\[([^\]]*)\]/g, function($0, val){
    //find out of the such a metadatum already exists:
    var metadatumID=0;
    metadata.map(metadatum => { if(metadatum.type=="posLabel" && metadatum.json.abbr==val) metadatumID=metadatum.id; });
    //if not, create it:
    if(!metadatumID){
      var metadatum={
        id: 0,
        type: "posLabel",
        sortkey: toSortkey(val, defaultAbc),
        parent_id: null,
        json: {abbr: val, title: {}, isfor: ["_all"]},
      };
      var insMetadatum=db.prepare("insert into metadata(type, sortkey, parent_id, json) values(?, ?, ?, ?)");
      var insMetadatumInfo=insMetadatum.run(metadatum.type, metadatum.sortkey, metadatum.parent_id, JSON.stringify(metadatum.json));
      var metadatumID=insMetadatumInfo.lastInsertRowid;
      metadatum.id=metadatumID;
      metadata.push(metadatum);
    }
    return metadatumID;
  });

  //inflect labels:
  entryString=entryString.replace(/\$INFLECTLABEL\[([^\]]*)\]/g, function($0, val){
    //find out of the such a metadatum already exists:
    var metadatumID=0;
    metadata.map(metadatum => { if(metadatum.type=="inflectLabel" && metadatum.json.abbr==val) metadatumID=metadatum.id; });
    //if not, create it:
    if(!metadatumID){
      var metadatum={
        id: 0,
        type: "inflectLabel",
        sortkey: toSortkey(val, defaultAbc),
        parent_id: null,
        json: {abbr: val, title: {}, isfor: ["_all"]},
      };
      var insMetadatum=db.prepare("insert into metadata(type, sortkey, parent_id, json) values(?, ?, ?, ?)");
      var insMetadatumInfo=insMetadatum.run(metadatum.type, metadatum.sortkey, metadatum.parent_id, JSON.stringify(metadatum.json));
      var metadatumID=insMetadatumInfo.lastInsertRowid;
      metadatum.id=metadatumID;
      metadata.push(metadatum);
    }
    return metadatumID;
  });

  //acceptability labels:
  entryString=entryString.replace(/\$ACCEPTLABEL\[([^\]]*)\]/g, function($0, val){
    //find out of the such a metadatum already exists:
    var metadatumID=0;
    metadata.map(metadatum => {
      var hasTheTitle=false; for(var key in metadatum.json.title) if(metadatum.json.title[key]==val) hasTheTitle=true;
      if(metadatum.type=="acceptLabel" && hasTheTitle) metadatumID=metadatum.id;
    });
    //if not, create it:
    if(!metadatumID){
      var title={}; title[lang]=val;
      var metadatum={
        id: 0,
        type: "acceptLabel",
        sortkey: toSortkey(val, defaultAbc),
        parent_id: null,
        json: {title: title, level: "0"},
      };
      var insMetadatum=db.prepare("insert into metadata(type, sortkey, parent_id, json) values(?, ?, ?, ?)");
      var insMetadatumInfo=insMetadatum.run(metadatum.type, metadatum.sortkey, metadatum.parent_id, JSON.stringify(metadatum.json));
      var metadatumID=insMetadatumInfo.lastInsertRowid;
      metadatum.id=metadatumID;
      metadata.push(metadatum);
    }
    return metadatumID;
  });

  //domains:
  entryString=entryString.replace(/\$DOMAIN\[([^\]]*)\]/g, function($0, val){
    //find out of the such a metadatum already exists:
    var metadatumID=0;
    metadata.map(metadatum => {
      var hasTheTitle=false; for(var key in metadatum.json.title) if(metadatum.json.title[key]==val) hasTheTitle=true;
      if(metadatum.type=="domain" && hasTheTitle) metadatumID=metadatum.id;
    });
    //if not, create it:
    if(!metadatumID){
      var title={}; title[lang]=val;
      var metadatum={
        id: 0,
        type: "domain",
        sortkey: toSortkey(val, defaultAbc),
        parent_id: null,
        json: {title: title, parentID: ""},
      };
      var insMetadatum=db.prepare("insert into metadata(type, sortkey, parent_id, json) values(?, ?, ?, ?)");
      var insMetadatumInfo=insMetadatum.run(metadatum.type, metadatum.sortkey, metadatum.parent_id, JSON.stringify(metadatum.json));
      var metadatumID=insMetadatumInfo.lastInsertRowid;
      metadatum.id=metadatumID;
      metadata.push(metadatum);
    }
    return metadatumID;
  });

  //sources:
  entryString=entryString.replace(/\$SOURCE\[([^\]]*)\]/g, function($0, val){
    //find out of the such a metadatum already exists:
    var metadatumID=0;
    metadata.map(metadatum => {
      var hasTheTitle=false; for(var key in metadatum.json.title) if(metadatum.json.title[key]==val) hasTheTitle=true;
      if(metadatum.type=="source" && hasTheTitle) metadatumID=metadatum.id;
    });
    //if not, create it:
    if(!metadatumID){
      var title={}; title[lang]=val;
      var metadatum={
        id: 0,
        type: "source",
        sortkey: toSortkey(val, defaultAbc),
        parent_id: null,
        json: {title: title, level: "0"},
      };
      var insMetadatum=db.prepare("insert into metadata(type, sortkey, parent_id, json) values(?, ?, ?, ?)");
      var insMetadatumInfo=insMetadatum.run(metadatum.type, metadatum.sortkey, metadatum.parent_id, JSON.stringify(metadatum.json));
      var metadatumID=insMetadatumInfo.lastInsertRowid;
      metadatum.id=metadatumID;
      metadata.push(metadatum);
    }
    return metadatumID;
  });

  //note types:
  entryString=entryString.replace(/\$NOTETYPE\[([^\]]*)\]/g, function($0, val){
    //find out of the such a metadatum already exists:
    var metadatumID=0;
    metadata.map(metadatum => {
      var hasTheTitle=false; for(var key in metadatum.json.title) if(metadatum.json.title[key]==val) hasTheTitle=true;
      if(metadatum.type=="noteType" && hasTheTitle) metadatumID=metadatum.id;
    });
    //if not, create it:
    if(!metadatumID){
      var title={}; title[lang]=val;
      var metadatum={
        id: 0,
        type: "noteType",
        sortkey: toSortkey(val, defaultAbc),
        parent_id: null,
        json: {title: title, level: "0"},
      };
      var insMetadatum=db.prepare("insert into metadata(type, sortkey, parent_id, json) values(?, ?, ?, ?)");
      var insMetadatumInfo=insMetadatum.run(metadatum.type, metadatum.sortkey, metadatum.parent_id, JSON.stringify(metadatum.json));
      var metadatumID=insMetadatumInfo.lastInsertRowid;
      metadatum.id=metadatumID;
      metadata.push(metadatum);
    }
    return metadatumID;
  });

  //collections:
  entryString=entryString.replace(/\$COLLECTION\[([^\]]*)\]/g, function($0, val){
    //find out of the such a metadatum already exists:
    var metadatumID=0;
    metadata.map(metadatum => {
      var hasTheTitle=false; for(var key in metadatum.json.title) if(metadatum.json.title[key]==val) hasTheTitle=true;
      if(metadatum.type=="collection" && hasTheTitle) metadatumID=metadatum.id;
    });
    //if not, create it:
    if(!metadatumID){
      var title={}; title[lang]=val;
      var metadatum={
        id: 0,
        type: "collection",
        sortkey: toSortkey(val, defaultAbc),
        parent_id: null,
        json: {title: title, level: "0"},
      };
      var insMetadatum=db.prepare("insert into metadata(type, sortkey, parent_id, json) values(?, ?, ?, ?)");
      var insMetadatumInfo=insMetadatum.run(metadatum.type, metadatum.sortkey, metadatum.parent_id, JSON.stringify(metadatum.json));
      var metadatumID=insMetadatumInfo.lastInsertRowid;
      metadatum.id=metadatumID;
      metadata.push(metadatum);
    }
    return metadatumID;
  });


  // console.log("------");
  // console.log(entryString);
  // console.log("======");
  return JSON.parse(entryString);
}
function addLanguage(db, configs, langCode){
  //does this language exist in the termbase?
  var alreadyHas=false;
  configs.lingo.languages.map(lang => {
    if(lang.abbr==langCode) alreadyHas=true;
  });
  //if not, create it:
  if(!alreadyHas){
    configs.lingo.languages.push({
      "role": "major",
      "abbr": langCode,
      "title": {$: langCode}
    });
    var updLingo=db.prepare("update configs set json=? where id=?");
    updLingo.run(JSON.stringify(configs.lingo), "lingo");
  }
}
function addTerm(db, configs, entryID, desig){
  //insert the term:
  var insTerm=db.prepare("insert into terms(json, lang, wording) values(?, ?, ?)");
  var insTermInfo=insTerm.run(JSON.stringify(desig.term), desig.term.lang, desig.term.wording);
  var termID=insTermInfo.lastInsertRowid;
  desig.term.id=termID.toString();
  //insert the entry-term connection:
  var insEntryTerm=db.prepare("insert into entry_term(entry_id, term_id, accept, clarif) values(?, ?, ?, ?)");
  insEntryTerm.run(entryID, termID, desig.accept, desig.clarif);
  //insert words:
  var insWord=db.prepare("insert into words(term_id, word, implicit) values(?, ?, ?)");
  wordSplit(desig.term.wording).map(word => { insWord.run(termID, word, 0); });
  //insert spelling:
  var spellindex=getSpellindex(desig.term.wording);
  var insSpelling=db.prepare("insert into spelling(term_id, wording, length, a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z) values(@termID, @wording, @length, @a,@b,@c,@d,@e,@f,@g,@h,@i,@j,@k,@l,@m,@n,@o,@p,@q,@r,@s,@t,@u,@v,@w,@x,@y,@z)");
  var parSpelling={termID: termID, wording: desig.term.wording, length: desig.term.wording.length};
  for(var key in spellindex) parSpelling[key]=spellindex[key];
  insSpelling.run(parSpelling);
}

function wordSplit(wording){
  var words=[]; wording.split(/[\s\.\,\(\)\[\]\{\}\'\-0-9]/).map(w => { if(w) words.push(w); });
  return words;
}
function getSpellindex(wording){
  var ret={a:0, b:0, c:0, d:0, e:0, f:0, g:0, h:0, i:0, j:0, k:0, l:0, m:0, n:0, o:0, p:0, q:0, r:0, s:0, t:0, u:0, v:0, w:0, x:0, y:0, z:0};
  var chars={
    a: "aáàâäăāãåąæ",
    b: "b",
    c: "cćċĉčç",
    d: "dďđ",
    e: "eéèėêëěēęæœ",
    f: "f",
    g: "gġĝğģ",
    h: "hĥħ",
    i: "iıíìİîïīį",
    j: "jĵ",
    k: "kĸķ",
    l: "lĺŀľļł",
    m: "m",
    n: "nńňñņ",
    o: "oóòôöōõőøœ",
    p: "p",
    q: "q",
    r: "rŕřŗ",
    s: "sśŝšşșß",
    t: "tťţț",
    u: "uúùûüŭūůųű",
    v: "v",
    w: "wẃẁŵẅ",
    x: "x",
    y: "yýỳŷÿ",
    z: "zźżž"
  };
  wording=wording.toLowerCase();
  for(var i=0; i<wording.length; i++){
    var c=wording[i];
    for(var key in chars){
      if(chars[key].indexOf(c)>-1) ret[key]++;
    }
  }
  return ret;
}
function toSortkey(s, abc){
  const keylength=5;
  var ret=s.replace(/\<[\<\>]+>/g, "").toLowerCase();
  //replace any numerals:
  var pat=new RegExp("[0-9]{1,"+keylength+"}", "g");
  ret=ret.replace(pat, function(x){while(x.length<keylength+1) x="0"+x; return x;});
  //prepare characters:
  var chars=[];
  var count=0;
  for(var pos=0; pos<abc.length; pos++){
    var key=(count++).toString(); while(key.length<keylength) key="0"+key; key="_"+key;
    for(var i=0; i<abc[pos].length; i++){
      if(i>0) count++;
      chars.push({char: abc[pos][i], key: key});
    }
  }
  chars.sort(function(a,b){ if(a.char.length>b.char.length) return -1; if(a.char.length<b.char.length) return 1; return 0; });
  //replace characters:
  for(var i=0; i<chars.length; i++){
    if(!/^[0-9]$/.test(chars[i].char)) { //skip chars that are actually numbers
      while(ret.indexOf(chars[i].char)>-1) ret=ret.replace(chars[i].char, chars[i].key);
    }
  }
  //remove any remaining characters that aren't a number or an underscore:
  ret=ret.replace(/[^0-9_]/g, "");
  return ret;
}
const defaultAbc=[
  ["a", "á", "à", "â", "ä", "ă", "ā", "ã", "å", "ą", "æ"],
  ["b"],
  ["c", "ć", "ċ", "ĉ", "č", "ç"],
  ["d", "ď", "đ"],
  ["e", "é", "è", "ė", "ê", "ë", "ě", "ē", "ę"],
  ["f"],
  ["g", "ġ", "ĝ", "ğ", "ģ"],
  ["h", "ĥ", "ħ"],
  ["i", "ı", "í", "ì", "i", "î", "ï", "ī", "į"],
  ["j", "ĵ"],
  ["k", "ĸ", "ķ"],
  ["l", "ĺ", "ŀ", "ľ", "ļ", "ł"],
  ["m"],
  ["n", "ń", "ň", "ñ", "ņ"],
  ["o", "ó", "ò", "ô", "ö", "ō", "õ", "ő", "ø", "œ"],
  ["p"],
  ["q"],
  ["r", "ŕ", "ř", "ŗ"],
  ["s", "ś", "ŝ", "š", "ş", "ș", "ß"],
  ["t", "ť", "ţ", "ț"],
  ["u", "ú", "ù", "û", "ü", "ŭ", "ū", "ů", "ų", "ű"],
  ["v"],
  ["w", "ẃ", "ẁ", "ŵ", "ẅ"],
  ["x"],
  ["y", "ý", "ỳ", "ŷ", "ÿ"],
  ["z", "ź", "ż", "ž"]
];

module.exports.openDB=openDB;
module.exports.saveEntry=saveEntry;
