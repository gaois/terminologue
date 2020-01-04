//A script to migrate all SQLite databases when the database schema has changed.

const path=require("path");
const fs=require("fs");
const Database = require('better-sqlite3');

//migrateDBs(path.join(__dirname, "../website/termbaseTemplates/"));
migrateDBs(path.join(__dirname, "../data/termbases/"));

function migrateDBs(dirPath){
  var filenames=fs.readdirSync(dirPath).filter(filename => /\.sqlite$/.test(filename));
  var count=filenames.length;
  console.log(`${count} databases to do`);
  filenames.map(filename => {
    console.log(`beginning ${filename}`);
    var filepath=path.join(dirPath, filename);
    const db=new Database(filepath, { fileMustExist: true });
    db.transaction(function(){

      //add parent_id column to metadata table:
      db.prepare(`alter table metadata add column "parent_id" INTEGER`).run();

      //for each domain, get its subdomains and insert them as separate domains, and remember their new IDs:
      var idMap={}; //domain ID => local ID => new ID
      db.prepare(`select * from metadata where type='domain'`).all().map(row => {
        var domain=JSON.parse(row.json);
        var lidMap={}; idMap[row.id]=lidMap;
        if(domain.subdomains){
          processSubdomains(db, row.id, domain.subdomains, lidMap);
          delete domain.subdomains;
          db.prepare(`update metadata set json=? where id=?`).run(JSON.stringify(domain), row.id);
        }
      });

      //for each entry, change its old super + sub ID assignment to new domain ID assignment:
      db.prepare(`DROP TABLE entry_domain`).run();
      db.prepare(`CREATE TABLE entry_domain ("entry_id" INTEGER REFERENCES entries (id) ON DELETE CASCADE, "domain" INTEGER)`).run();
      db.prepare(`select * from entries`).all().map(row => {
        var entry=JSON.parse(row.json);
        if(entry.domains){
          var newie=[];
          entry.domains.map(oldie => {
            var newID=oldie.superdomain;
            if(idMap[newID] && idMap[newID][oldie.subdomain]) newID=idMap[newID][oldie.subdomain].toString();
            newie.push(newID);
            db.prepare(`insert into entry_domain(entry_id, domain) values(?, ?)`).run(row.id, newID);
          });
          entry.domains=newie;
          db.prepare(`update entries set json=? where id=?`).run(JSON.stringify(entry), row.id);
        }
      });

      //remove the `subdomainChange` trigger:
      var row=db.prepare(`select * from configs where id='triggers'`).get();
      var triggers=JSON.parse(row.json);
      delete triggers.subdomainChange;
      var row=db.prepare(`update configs set json=? where id='triggers'`).run(JSON.stringify(triggers));

    })();
    db.close();
    console.log(` - done ${filename}, ${--count} databases remaining`);
  });
}

function processSubdomains(db, parentID, subdomains, lidMap){
  subdomains.map(subdomain => {
    //save the subdomain:
    var subdomainCopy=JSON.parse(JSON.stringify(subdomain));
    var lid=subdomainCopy.lid;
    delete subdomainCopy.lid;
    delete subdomainCopy.subdomains;
    subdomainCopy.parentID=parentID.toString();
    var sortkey=getSortkey(subdomainCopy);
    var info=db.prepare(`insert into metadata(type, json, parent_id, sortkey) values(?, ?, ?, ?)`).run(
      "domain",
      JSON.stringify(subdomainCopy),
      parentID,
      sortkey
    );
    var savedAsID=info.lastInsertRowid;
    lidMap[lid]=savedAsID;
    if(subdomain.subdomains) processSubdomains(db, savedAsID, subdomain.subdomains, lidMap);
  });
}

function getSortkey(metadatum){
  var str="";
  if(metadatum.abbr) str+=metadatum.abbr;
  if(metadatum.title && typeof(metadatum.title)=="string") str+=metadatum.title;
  if(metadatum.title && typeof(metadatum.title)=="object") {
    for(var langCode in metadatum.title) str+=metadatum.title[langCode];
  }
  var abc=[
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
  var sortkey=toSortkey(str, abc)
  return sortkey;
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
}
