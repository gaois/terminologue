//const TXTFILE="/home/michmech/Downloads/Liosta DRI - cóip oibre.txt";
const TXTFILE="C:/Users/oraghab/Documents/BOR/zzz/dspace-ga/dspace_en_terms_ga_1_unix.txt";
//const SQLITEFILE="../data/termbases/drigaois.sqlite";
const SQLITEFILE="C:/Users/oraghab/Documents/BOR/zzz/dspace-ga/dspaceasgaeilge.sqlite";
const LIMIT=10000;
//const SPEC={
//  columns: [
//    {as: "term", lang: "en"},
//    {as: "note", type: 140, lang: "ga"},
//    {as: "definition", lang: "en"},
//    {as: "definition", continues: 2, lang: "ga"},
//    {as: "definitionSource", continues: 2, lang: "en"},
//    {as: "note", type: 140, lang: "ga"},
//  ],
//  collectionIDs: [141],
//  domainIDs: [35],
//};
const SPEC={
  columns: [
    {as: "note", type: 30, lang: "en"},
    {as: "term", lang: "en"},
    {as: "term", lang: "ga"},
  ],
  collectionIDs: [],
  domainIDs: [],
};

const txt2entry=require("../shared/txt-to-entry.js");
const saver=require("./saver.js");

var configs={};
var metadata=[];
var db=saver.openDB(SQLITEFILE, configs, metadata);

const NRL=require('n-readlines');
const liner=new NRL(TXTFILE);
let entryCount=0;
let line="";
while(line=liner.next()) {
  line=line.toString();
  if(entryCount<LIMIT && line.trim()!=""){
    entryCount++;
    console.log(`importing entry number ${entryCount}...`);
    var entry=txt2entry(SPEC, line.split("\t"));
    //console.log(JSON.stringify(entry, null, "  "));
    saver.saveEntry(db, configs, metadata, entry);
  }
}

db.close();
console.log("finished");
