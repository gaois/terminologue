const TBXFILE="./_microsoft-irish.tbx";
const SQLITEFILE="../data/termbases/test.sqlite";
const LIMIT=100;
//----------

const fs=require("fs");
const tbx2entry=require("../shared/tbx-to-entry.js");
const saver=require("./saver.js");

const START="<termEntry";
const END="</termEntry>";
var buffer="";

var configs={};
var db=saver.openDB(SQLITEFILE, configs);

const NRL=require('n-readlines');
const liner=new NRL(TBXFILE);
var entryCount=0;
while(textchunk=liner.next()) {
  if(entryCount<=LIMIT){
    textchunk=textchunk.toString();
    for(var i=0; i<textchunk.length; i++){
      if(textchunk.substr(i, START.length)==START){
        i+=START.length-1;
        buffer=START;
      } else if(textchunk.substr(i, END.length)==END) {
        i+=END.length-1;
        buffer+=END;
        entryCount++;
        if(entryCount<=LIMIT){
          console.log(`importing entry number ${entryCount}...`);
          var entry=tbx2entry(buffer);
          // console.log(JSON.stringify(entry, null, "  "));
          saver.saveEntry(db, configs, entry);
          buffer="";
        }
      } else {
        if(buffer!="") buffer+=textchunk[i];
      }
    }
  }
}
console.log("finished");
