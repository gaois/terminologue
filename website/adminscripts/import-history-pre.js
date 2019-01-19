const fs=require("fs-extra");
const xmldom=require("xmldom"); //https://www.npmjs.com/package/xmldom
const domParser=new xmldom.DOMParser();
const sqlite3 = require('sqlite3').verbose(); //https://www.npmjs.com/package/sqlite3
const dbpath="/home/mbm/terminologue/data/termbases/bnt.sqlite";
var db=new sqlite3.Database(dbpath, sqlite3.OPEN_READWRITE);

var term2entry={};
var changeID=1000000;
readTerm2Entry(function(){
  readChanges(function(){
  });
});

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
  var lineReader=require('readline').createInterface({
    input: require('fs').createReadStream('/media/mbm/Windows/MBM/Fiontar/Export2Terminologue/data-in/history.txt')
  });
  lineReader.on('line', function(line) {
    line=line.split("\t");
    if(line.length==7){
      var entryIDs=[];
      if(line[2]=="focal.concept") entryIDs=[line[1]];
      if(line[2]=="focal.tern") entryIDs=term2entry[line[1]];
      if(entryIDs && entryIDs.length>0) entryIDs.map(entry_id => {
        var when=line[3].replace(" ", "T");
        //var email=line[4];
        var email="";
        if(line[6]!="NULL"){
          var doc=domParser.parseFromString(line[6], 'text/xml');
          var _action=doc.documentElement.getAttribute("action");
          var action="";
          if(_action=="changed") action="update";
          if(_action=="deleted") action="delete";
          if(_action=="created") action="create";
          if(action!=""){
            var historiography={diff: []};
            var els=doc.documentElement.getElementsByTagName("element");
            for(var i=0; i<els.length; i++) { var el=els[i];
              if(el.getAttribute("action")!="unchanged" && el.getAttribute("name")!="note"){
                var obj={
                  desc: el.getAttribute("action")+" "+el.getAttribute("name"),
                  oldVal: "",
                  newVal: "",
                };
                var ats=el.getElementsByTagName("attribute");
                for(var ii=0; ii<ats.length; ii++) { var at=ats[ii];
                  if(at.getAttribute("oldValue") && !at.getAttribute("oldValue").match(/^[0-9]*$/)) {
                    if(obj.oldVal!="") obj.oldVal+" ";
                    obj.oldVal+=at.getAttribute("oldValue");
                  }
                  if(at.getAttribute("newValue") && !at.getAttribute("newValue").match(/^[0-9]*$/)) {
                    if(obj.newVal!="") obj.newVal+" ";
                    obj.newVal+=at.getAttribute("newValue");
                  }
                }
                historiography.diff.push(obj);
              }
            }
            changeID++;
            console.log(changeID);
            fs.appendFileSync("/home/mbm/terminologue/temp/history-pre.txt", makeLine([
              changeID,
              entry_id,
              action,
              when,
              email,
              "",
              JSON.stringify(historiography)
            ]));
          }
        }
      });
    }
  });
  callnext();
}

function makeLine(arr){
  var ret="";
  arr.map((s, i) => {
    if(i>0) ret+="\t";
    ret+=s.toString().replace(/[\t\n]/g, " ");
  });
  ret+="\n";
  return ret;
}
