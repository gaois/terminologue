const sqlite=require("better-sqlite3");
const DOMParser=require("xmldom").DOMParser;
const fs=require("fs");
const readline=require("readline");
const saver=require("./saver.js");
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
var output=null;
var configs={};

function openDB(input){
  db=null;
  if(!input){
    messageToUI({message: "error", done: done, error: "Could not open the termbase."});
  } else {
    try{
      if(input) {
        db=new sqlite(input, {fileMustExist: true});
        //Read the termbase configs:
        var sqlSelectConfigs=db.prepare("select * from configs");
        sqlSelectConfigs.all().map(row => {
          configs[row.id]=JSON.parse(row.json);
        });
      }
    } catch(err){
      messageToUI({message: "error", done: done, error: "Could not open the termbase."});
    }
  }
  return db;
}
function openTBX(input){
  var lineReader=null;
  if(!input || !fs.existsSync(input)){
    messageToUI({message: "error", done: done, error: "Could not open the TBX file."});
  } else {
    lineReader=readline.createInterface({input: fs.createReadStream(input)});
    lineReader.on("line", function(line){
      doLine(line);
    });
    lineReader.on("close", function(line){
      if(!aborted) messageToUI({message: "finished", done: done});
    });
  }
  return lineReader;
}

var lineReader=null;
function begin(input, output){
  this.output=output;
  messageToUI({message: "started", done: done});
  var db=openDB(output);
  if(db){
    lineReader=openTBX(input);
  }
}

const START="<termEntry";
const END="</termEntry>";
var buffer="";
var abortDone=false;
function doLine(line){
  if(aborted){
    if(!abortDone) messageToUI({message: "aborted", done: done});
    lineReader.close();
    abortDone=true;
  } else {
    abortDone=false;
    for(var i=0; i<line.length; i++){
      if(line.substr(i, START.length)==START){
        i+=START.length-1;
        buffer=START;
      } else if(line.substr(i, END.length)==END) {
        i+=END.length-1;
        buffer+=END;
        doEntry(buffer);
        done++;
        messageToUI({message: "progressing", done: done});
        buffer="";
      } else {
        if(buffer!="") buffer+=line[i];
      }
    }
    buffer+="\n";
  }
}

const ENTRY={
  "cStatus": "0",
  "pStatus": "1",
  "dStatus": "1",
  "dateStamp": "",
  "tod": "",
  "domains": [],
  "desigs": [],
  "intros": {},
  "definitions": [],
  "examples": [],
  "notes": [],
  "collections": [],
  "extranets": [],
  "xrefs": []
};
const DESIG={
  "term": {
    "id": "",
    "lang": "",
    "wording": "",
    "annots": [],
    "inflects": []
  },
  "accept": null,
  "clarif": "",
  "sources": [],
  "nonessential": "0"
};

function closest(el, tagName){
  while(el.parentNode && el.parentNode.tagName!=tagName) el=el.parentNode;
  return el.parentNode;
}

function doEntry(xml){
  var doc=new DOMParser().parseFromString(xml, "text/xml");
  var entry=JSON.parse(JSON.stringify(ENTRY));
  //Do desigs:
  var terms=doc.documentElement.getElementsByTagName("term");
  for(var iTerms=0; iTerms<terms.length; iTerms++) {
    var elTerm=terms[iTerms];
    var elLangSet=closest(elTerm, "langSet");
    var langCode=elLangSet.getAttribute("xml:lang");
    //console.log(langCode, elTerm.textContent);
    var desig=JSON.parse(JSON.stringify(DESIG));
    desig.term.lang=langCode;
    desig.term.wording=elTerm.textContent;
    entry.desigs.push(desig);
  }
  saver.saveEntry(db, configs, entry);
}
