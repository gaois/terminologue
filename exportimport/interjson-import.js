const JSONFILE="drigaois.json";
const SQLITEFILE="../data/termbases/bnt.sqlite";

const fs=require("fs");
const saver=require("./saver.js");

var configs={};
var metadata=[];
var db=saver.openDB(SQLITEFILE, configs, metadata);

JSON.parse(fs.readFileSync(JSONFILE)).map((entry, entryCount) => {
  console.log(`importing entry number ${entryCount}...`);
  saver.saveEntry(db, configs, metadata, entry);
});

db.close();
console.log("finished");
