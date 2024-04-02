//const SQLITEFILE="../data/termbases/rialacha.sqlite";
//const SQLITEFILE="bnt.sqlite";
const SQLITEFILE="C:/Users/oraghab/Documents/BOR/zzz/bnt/bnt-2024-04-01_1954.sqlite";
//const TBXFILE="_entries.tbx.xml";
const TBXFILE="C:/Users/oraghab/Documents/BOR/zzz/bnt/24.04.01-tearma.ie-concepts.tbx";
//const LIMIT=10000;
const LIMIT=200000;

//TBX extensible constraint specification (XCS)
//picklist values: ISO 12620

const sqlite=require('better-sqlite3');
const db=new sqlite(SQLITEFILE, {fileMustExist: true});

const fs=require("fs");
const xmlformatter=require("xml-formatter");
const entry2tbx=require("../shared/entry-to-tbx.js");

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
entry2tbx.setTermbaseLang(termbaseLang);
entry2tbx.setMetadata(metadata);

//------
//Export the termbase's entries into a TBX file:
//------

fs.writeFileSync(TBXFILE, `<?xml version="1.0" encoding="UTF-8"?>
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
var sqlSelectEntries=db.prepare(`select * from entries limit ${LIMIT}`);
//var sqlSelectEntries=db.prepare(`select * from entries where pStatus='1' limit ${LIMIT}`);
console.log("getting list of entries...");
sqlSelectEntries.all().map((row, iRow) => {
  console.log(`exporting entry number ${iRow}, ID ${row.id}...`);
  var entry=JSON.parse(row.json);
  entry.id=row.id;
  var xml=entry2tbx.doEntry(entry);
  xml=xmlformatter(xml, {collapseContent: true}).replace(/(^|\n)/g, function($1){ return $1+"      " });
  fs.appendFileSync(TBXFILE, "\n"+xml+"\n", "utf8");
});
fs.appendFileSync(TBXFILE, `
    </body>
  </text>
</martif>
`, "utf8");
console.log("finished");

//Utilities:
function clean4xml(s){
  s=s.replace(/\&/g, "&amp;");
  s=s.replace(/\"/g, "&quot;");
  s=s.replace(/\'/g, "&apos;");
  s=s.replace(/\</g, "&lt;");
  s=s.replace(/\>/g, "&gt;");
  return s;
}
