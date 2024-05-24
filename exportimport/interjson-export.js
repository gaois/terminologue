const SQLITEFILE="../data/termbases/inniu.sqlite";
const JSONFILE="/home/michmech/Documents/inniu.json";
const LIMIT=200000;

const sqlite=require('better-sqlite3');
const db=new sqlite(SQLITEFILE, {fileMustExist: true});

const fs=require("fs");
const entry2interjson=require("../shared/entry-to-interjson.js");

//Read the termbase configs and metadata:
var lingo=null;
var ident=null;
var metadata={};
var sqlSelectConfigs=db.prepare("select * from configs where id in ('lingo', 'ident')");
sqlSelectConfigs.all().map(row => {
  if(row.id=="lingo") lingo=JSON.parse(row.json);
  if(row.id=="ident") ident=JSON.parse(row.json);
});
var termbaseLang=""; lingo.languages.map(l => {if(!termbaseLang) termbaseLang=l.abbr});
var sqlSelectMetadata=db.prepare("select * from metadata");
sqlSelectMetadata.all().map(row => {
  metadata[row.id]={type: row.type, obj: JSON.parse(row.json)};
});
entry2interjson.setTermbaseLang(termbaseLang);
entry2interjson.setMetadata(metadata);

//------
//Export the termbase's entries into an "Interchangeable JSON" file:
//------

var arr=[];
var sqlSelectEntries=db.prepare(`select * from entries limit ${LIMIT}`);
console.log("getting list of entries...");
sqlSelectEntries.all().map((row, iRow) => {
  console.log(`exporting entry number ${iRow}, ID ${row.id}...`);
  var entry=JSON.parse(row.json);
  arr.push(entry2interjson.doEntry(entry));
});
fs.writeFileSync(JSONFILE, JSON.stringify(arr, null, "  "), "utf8");
console.log("finished");
