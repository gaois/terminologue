const fs = require("fs");

const DOMParser = require("@xmldom/xmldom").DOMParser;
const domParser = new DOMParser();

const saver = require("../exportimport/saver.js");
const SQLITEFILE = "/home/michmech/gitstore/terminologue/data/termbases/blank.sqlite";

//languages:
var configs={};
var metadata=[];
var db=saver.openDB(SQLITEFILE, configs, metadata);
const lingo = {languages: []};
let en, fr, ar;
fs.readFileSync("/home/michmech/Documents/omar/langs.txt", "utf8").split("\n").map((line, entryCount) => {
  if(line.trim() != ""){
    const doc = domParser.parseFromString(line, "text/xml");
    const id = parseInt(doc.documentElement.getAttribute("langID"));
    const abbr = doc.documentElement.getAttribute("abbr");
    const title = doc.documentElement.getAttribute("title");
    const lang = {
      role: ["ar", "en", "fr"].indexOf(abbr) > -1 ? "major" : "minor",
      abbr: abbr,
      title: {en: title},
    };
    if(abbr == "en") en = lang;
    else if(abbr == "fr") fr = lang;
    else if(abbr == "ar") ar = lang;
    else lingo.languages.push(lang);
  }
});
lingo.languages.unshift(ar);
lingo.languages.unshift(fr);
lingo.languages.unshift(en);
var updLingo=db.prepare("update configs set json=? where id=?");
updLingo.run(JSON.stringify(lingo), "lingo");
db.close();

//domains:
var configs={};
var metadata=[];
var db=saver.openDB(SQLITEFILE, configs, metadata);
fs.readFileSync("/home/michmech/Documents/omar/domains.txt", "utf8").split("\n").map((line, entryCount) => {
  if(line.trim() != ""){
    const doc = domParser.parseFromString(line, "text/xml");
    const id = parseInt(doc.documentElement.getAttribute("domainID"));
    const abbr = doc.documentElement.getAttribute("abbr");
    const title = doc.documentElement.getAttribute("title").split("|").map(x => x.trim());
    const domain = {
      "parentID": "",
      "title": {
        "en": title[0],
        "fr": title[1],
        "ar": title[2],
      }
    };
    var insMetadatum=db.prepare("insert into metadata(id, type, sortkey, parent_id, json) values(?, ?, ?, ?, ?)");
    var insMetadatumInfo=insMetadatum.run(id, "domain", abbr, null, JSON.stringify(domain));
  }
});
db.close();

//entries:
var configs={};
var metadata=[];
var db=saver.openDB(SQLITEFILE, configs, metadata);
const ENTRY = {
  "cStatus": "1",
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
const DESIG = {
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
fs.readFileSync("/home/michmech/Documents/omar/concepts.txt", "utf8").split("\n").map((line, entryCount) => {
  if(line.trim() != ""){
    const doc = domParser.parseFromString(line, "text/xml");
    const entry=JSON.parse(JSON.stringify(ENTRY));

    const elTerms = doc.documentElement.getElementsByTagName("term");
    for (i=0; i<elTerms.length; i++) {
      const elTerm = elTerms[i];
      const elLang = elTerm.getElementsByTagName("lang")[0];
      const desig=JSON.parse(JSON.stringify(DESIG));
      desig.term.wording=elTerm.getAttribute("term");
      desig.clarif=elTerm.getAttribute("clarification");
      desig.term.lang=elLang.getAttribute("abbr");
      entry.desigs.push(desig);
    }
  
    const elDomains = doc.documentElement.getElementsByTagName("domain");
    for (i=0; i<elDomains.length; i++) {
      const elDomain = elDomains[i];
      const id = elDomain.getAttribute("domainID");
      entry.domains.push(id);
    }

    console.log(`importing entry number ${entryCount}...`);
    saver.saveEntry(db, configs, metadata, entry);
  }
});

db.close();
console.log("finished");
