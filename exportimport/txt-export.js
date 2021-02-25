const SQLITEFILE="../data/termbases/rialacha.sqlite";
const TXTFILE="_entries.txt";
const LIMIT=10000;

var spec={

  //deighilteoir idir na colúin:
  separator: "\t", separatorEscape: "[TAB]",

  //má bhíonn breis is luach amháin in aon chill amháin, nascfar leis seo iad:
  joiner: " | ", joinerEscape: " [LINE] ",

  //má tá briseadh líne taobh istigh de rud ar bith:
  linebreakEscape: "[LINEBREAK]",

  //má tá "(" nó ")" taobh istigh de théarma:
  openBracketEscape: "[OPENBRACKET]",
  closeBracketEscape: "[CLOSEBRACKET]",

  //má tá "," taobh istigh de mheiteashonraí téarma:
  commaEscape: "[COMMA]",

  //na colúin:
  columns: [
    {
      title: "ID",
      what: "id",
    },
    {
      title: "Réimse",
      what: "domains",
      lang: "en",
    },
    {
      title: "Téarma Béarla",
      what: "terms",
      lang: "en",
      includeAnnotations: true,
      includeInflectedForms: true,
      includeAcceptability: true,
      includeClarification: true,
    },
    {
      title: "Intreoir Béarla",
      what: "intro",
      lang: "en",
    },
    {
      title: "Téarma Gaeilge",
      what: "terms",
      lang: "ga",
      includeAnnotations: true,
      includeInflectedForms: true,
      includeAcceptability: true,
      includeClarification: true,
    },
    {
      title: "Téarma Gaeilge",
      what: "intro",
      lang: "ga",
    },
    {
      title: "Sainmhíniú Béarla",
      what: "definitions",
      lang: "en",
    },
    {
      title: "Sainmhíniú Gaeilge",
      what: "definitions",
      lang: "ga",
    },
    {
      title: "Sampla Béarla",
      what: "examples",
      lang: "en",
    },
    {
      title: "Sampla Gaeilge",
      what: "examples",
      lang: "ga",
    },
    {
      title: "Nóta Gaeilge de chineál 913502",
      what: "notes",
      type: "913502",
      lang: "ga",
    },
  ],
};

const sqlite=require('better-sqlite3');
const db=new sqlite(SQLITEFILE, {fileMustExist: true});

const fs=require("fs");
const entry2txt=require("../shared/entry-to-txt.js");
entry2txt.setSpec(spec);

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
entry2txt.setTermbaseLang(termbaseLang);
entry2txt.setMetadata(metadata);

//------
//Export the termbase's entries into a TXT file:
//------

fs.writeFileSync(TXTFILE, ``, "utf8");
var sqlSelectEntries=db.prepare(`select * from entries limit ${LIMIT}`);
console.log("getting list of entries...");
sqlSelectEntries.all().map((row, iRow) => {
  console.log(`exporting entry number ${iRow}, ID ${row.id}...`);
  var entry=JSON.parse(row.json);
  entry.id=row.id;
  var txt=entry2txt.doEntry(entry);
  fs.appendFileSync(TXTFILE, txt+"\n", "utf8");
});
console.log("finished");
