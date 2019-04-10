/*
Dumps a list of terms and their pos labels into a text file.
*/
const WRITE_TO="./grammardump.txt";

const fs=require("fs");
const sqlite3 = require('sqlite3');
var db=new sqlite3.Database("../../data/termbases/bnt.sqlite", sqlite3.OPEN_READONLY);

loadMetadata();

const posLabels={}; //id --> {abbr: "...", ...}
function loadMetadata(){
  db.all(`select * from metadata where type='posLabel'`, {}, function(err, rows){
    rows.map(row => {
      posLabels[row.id]=JSON.parse(row.json);
    });
    readTerms();
  });
}

function readTerms(){
  db.all(`select * from terms where lang='ga'`, {}, function(err, rows){
    fs.writeFileSync(WRITE_TO, "");
    rows.map(row => {
      var term=JSON.parse(row.json);
      term.annots.map(annot => {
        if(annot.label.type=="posLabel"){
          var posLabel=posLabels[annot.label.value];
          fs.appendFileSync(WRITE_TO, `${term.wording}\t${posLabel.abbr}\n`);
        }
      });
    });
  });
}
