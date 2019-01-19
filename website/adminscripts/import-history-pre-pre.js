const fs=require("fs-extra");
const xmldom=require("xmldom"); //https://www.npmjs.com/package/xmldom
const domParser=new xmldom.DOMParser();
const sqlite3 = require('sqlite3').verbose(); //https://www.npmjs.com/package/sqlite3
const dbpath="/home/mbm/terminologue/data/termbases/bnt.sqlite";
var db=new sqlite3.Database(dbpath, sqlite3.OPEN_READWRITE);

var changeTypes={};
var term2entry={};
var changeID=0;
readChangeTypes(function(){
  readTerm2Entry(function(){
    readChanges(function(){
      console.log("last changeID: "+changeID);
    });
  });
});

function readChangeTypes(callnext){
  var dir="/media/mbm/Windows/MBM/Fiontar/Export2Terminologue/data-out/focal.oldHistoryType/";
  var filenames=fs.readdirSync(dir);
  filenames.map((filename, filenameIndex) => {
    var id=filename.replace(/\.xml$/, "");
    var xml=fs.readFileSync(dir+filename, "utf8");
    var doc=domParser.parseFromString(xml, 'text/xml');
    var title=doc.documentElement.getAttribute("title");
    changeTypes[id]=title;
  });
  callnext();
};

function readTerm2Entry(callnext){
  db.all("select entry_id, term_id from entry_term", {}, function(err, rows){
    rows.map(row => {
      var termID=row["term_id"].toString();
      var entryID=row["entry_id"].toString();
      if(!term2entry[termID]) term2entry[termID]=[];
      term2entry[termID].push(entryID);
    });
    callnext();
  });
}

function readChanges(callnext){
  var dir="/media/mbm/Windows/MBM/Fiontar/Export2Terminologue/data-out/focal.oldHistory/";
  var filenames=fs.readdirSync(dir); //.slice(0, 10);
  var todo=0;
  var done=0;
  filenames.map((filename, filenameIndex) => {
    var id=filename.replace(/\.xml$/, "");
    console.log(`starting to process oldHistory ID ${id}`);
    var xml=fs.readFileSync(dir+filename, "utf8");
    var doc=domParser.parseFromString(xml, 'text/xml');

    var entryIDs=[];
    var conceptID=doc.documentElement.getAttribute("conceptID"); if(conceptID) entryIDs=[conceptID];
    var termID=doc.documentElement.getAttribute("termID"); if(termID) entryIDs=term2entry[termID];

    var hi={
      when: "",
      email: "",
      historiography: {diff: []},
    };

    if(entryIDs && entryIDs.length>0) entryIDs.map(entry_id => {
      var changes=doc.documentElement.getElementsByTagName("change");
      for(var i=0; i<changes.length; i++) { var change=changes[i];
        var when=change.getAttribute("dateTime");
        var email=change.getAttribute("userName");
        if(email!=hi.email || when.split("T")[0]!=hi.when.split("T")[0]){
          //save old:
          if(hi.email!=""){
            changeID++;
            fs.appendFileSync("/home/mbm/terminologue/temp/history-pre-pre.txt", line([
              changeID,
              entry_id,
              "update",
              hi.when,
              hi.email,
              "",
              JSON.stringify(hi.historiography)
            ]));
          }
          //start new:
          hi={
            when: when,
            email: email,
            historiography: {diff: []},
          };
          hi.historiography.diff.push({
            desc: changeTypes[change.getAttribute("type")],
            oldVal: change.getAttribute("oldValue"),
            newVal: change.getAttribute("newValue"),
          });
        } else {
          //add to current:
          hi.historiography.diff.push({
            desc: changeTypes[change.getAttribute("type")],
            oldVal: change.getAttribute("oldValue"),
            newVal: change.getAttribute("newValue"),
          });
        }
      }
      //save old:
      if(hi.email!=""){
        changeID++;
        fs.appendFileSync("/home/mbm/terminologue/temp/history-pre-pre.txt", line([
          changeID,
          entry_id,
          "update",
          hi.when,
          hi.email,
          "",
          JSON.stringify(hi.historiography)
        ]));
      }
    });
  });
  callnext();
}

function line(arr){
  var ret="";
  arr.map((s, i) => {
    if(i>0) ret+="\t";
    ret+=s.toString().replace(/[\t\n]/g, " ");
  });
  ret+="\n";
  return ret;
}
