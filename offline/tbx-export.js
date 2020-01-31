const sqlite=require("better-sqlite3");
const xmlformatter=require("xml-formatter");
const fs=require("fs");
const INTERVAL=0; //miliseconds
var done=0;
var aborted=false;
var messageToUI=null;
module.exports={
  start: function(input, output, messageCB){done=0; aborted=false; messageToUI=messageCB; begin(input, output);},
  abort: function(){aborted=true;}
};

//------

var db=null;
var lingo=null;
var ident=null;
var output=null;
var entryIDs=[];

function clean4xml(s){
  s=s.replace(/\&/g, "&amp;");
  s=s.replace(/\"/g, "&quot;");
  s=s.replace(/\'/g, "&apos;");
  s=s.replace(/\</g, "&lt;");
  s=s.replace(/\>/g, "&gt;");
  return s;
}
function openDB(input){
  db=null;
  if(!input){
    messageToUI({message: "error", done: done, error: "No input file given."});
  } else if(!fs.existsSync(input)){
    messageToUI({message: "error", done: done, error: "The input file does not exist."});
  } else {
    try{
      db=new sqlite(input, {fileMustExist: true});
      db.prepare("select * from configs limit 1").run();
    } catch(err){
      messageToUI({message: "error", done: done, error: "Could not open the input file."});
      db=null;
    }
  }
  return db;
}

function begin(input, output){
  this.output=output;
  messageToUI({message: "started", done: done});
  var db=openDB(input);
  if(db && !output) messageToUI({message: "error", done: done, error: "No output file given."});
  if(db && output){
    //Read the termbase configs:
    var sqlSelectConfigs=db.prepare("select * from configs where id in ('lingo', 'ident')");
    sqlSelectConfigs.all().map(row => {
      if(row.id=="lingo") lingo=JSON.parse(row.json);
      if(row.id=="ident") ident=JSON.parse(row.json);
    });
    var termbaseLang=""; lingo.languages.map(l => {if(!termbaseLang) termbaseLang=l.abbr});
    //Start writing the TBX file:
    fs.writeFileSync(this.output, `<?xml version="1.0" encoding="UTF-8"?>
<martif type="TBX" xml:lang="${termbaseLang}">
  <martifHeader>
    <fileDesc>
      <titleStmt>
        <title>${clean4xml(ident.title[termbaseLang] || ident.title.$)}</title>
      </titleStmt>
      <sourceDesc>
        <p>${clean4xml(ident.blurb[termbaseLang] || ident.blurb.$)}</p>
      </sourceDesc>
    </fileDesc>
  </martifHeader>
  <text>
    <body>
`, "utf8");
    //Start going entry-by-entry:
    var sqlSelectEntries=db.prepare("select id from entries");
    entryIDs=[];
    sqlSelectEntries.all().map(row => { entryIDs.push(row.id); });
    setTimeout(next, INTERVAL);
  }
}

function next(){
  if(aborted){
    db.close();
    messageToUI({message: "aborted", done: done});
  } else {
    var entryID=entryIDs.pop();
    if(!entryID){
      setTimeout(finish, INTERVAL);
    } else {
      console.log(entryID);
      var sqlSelectEntry=db.prepare("select * from entries where id=?");
      var row=sqlSelectEntry.get(entryID);
      var entry=JSON.parse(row.json);
      entry.id=row.id;
      var xml=doEntry(entry);
      xml=xmlformatter(xml, {collapseContent: true});
      xml=xml.replace(/\n/g, "\n      ");
      fs.appendFileSync(this.output, "\n      "+xml+"\n", "utf8");
      done++;
      messageToUI({message: "progressing", done: done});
      setTimeout(next, INTERVAL);
    }
  }
}

function finish(){
  fs.appendFileSync(this.output, `
    </body>
  </text>
</martif>
  `, "utf8");
  db.close();
  messageToUI({message: "finished", done: done});
}

//--------------

function doEntry(entry){
  var ret=`<termEntry id="eid-${entry.id}">`;
  lingo.languages.map(lang => {
    ret+=doLangset(entry, lang.abbr);
  });
  ret+=`</termEntry>`;
  return ret;
}

function doLangset(entry, langCode){
  var empty=true;
  var ret=`<langSet xml:lang="${langCode}">`;
  entry.desigs.map(desig => {
    if(desig.term.lang==langCode){
      ret+=doDesig(desig);
      empty=false;
    }
  });
  ret+=`</langSet>`;
  if(!empty) return ret;
  return "";
}

function doDesig(desig){
  var ret=`<ntig>`;
    ret+=`<termGrp>`;
      ret+=`<term id="tid-${desig.term.id}">${clean4xml(desig.term.wording)}</term>`;
    ret+=`</termGrp>`;
  ret+=`</ntig>`;
  return ret;
}
