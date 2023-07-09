var FROM="2023-06-01"; //on or after this date
var TILL="2023-07-01"; //before this date
const WRITE_TO="2023-07-01_entrylist.txt";

//------

const fs=require("fs");
const Database = require('better-sqlite3');
//const db = new Database('../data/termbases/bnt.sqlite', { fileMustExist: true });
const db = new Database('C:/Users/oraghab/Documents/FSGaois/Projects/bnt/bnt-2023-07-03_1227.sqlite', { fileMustExist: true });

fs.writeFileSync(WRITE_TO, "");
db.prepare(`select h.id, h.[when], h.email, h.entry_id, h.json as json_new, (
  select h2.json
  from history as h2
  where h2.entry_id=h.entry_id and h2.[when]<h.[when]
  order by h2.[when] desc
  limit 1
) as json_old
from history as h
where h.email like '%@dcu.ie'
and h.[when]>=? and h.[when]<? and h.action='update'`).all(FROM, TILL).map(row => {
  if(statusChange(row.json_old, row.json_new)){
    fs.appendFileSync(WRITE_TO, `${row.entry_id}\t${row.when.substring(0, 10)}\t${row.email}\tathrú go seiceáilte\n`);
  }
  if(importantChange(row.json_old, row.json_new)){
    fs.appendFileSync(WRITE_TO, `${row.entry_id}\t${row.when.substring(0, 10)}\t${row.email}\tathrú suntasach\n`);
  }
});

function statusChange(jsonOld, jsonNew){
  var entryOld=JSON.parse(jsonOld);
  var entryNew=JSON.parse(jsonNew);
  if(entryNew.cStatus=="1" && entryOld.cStatus=="0") return true;
  return false;
}

function importantChange(jsonOld, jsonNew){
  var entryOld=JSON.parse(jsonOld);
  var entryNew=JSON.parse(jsonNew);
  var stampOld=entryStamp(entryOld);
  var stampNew=entryStamp(entryNew);
  if(stampOld!=stampNew) return true;
  return false;
}

function entryStamp(entry){
  var ret="";
  entry.desigs.map(desig => {
    ret+=desig.term.wording.trim();
    desig.term.annots.map(annot => {
      ret+=annot.label.value.trim();
    });
    desig.term.inflects.map(inflect => {
      ret+=inflect.label.trim();
      ret+=inflect.text.trim();
    });
  });
  ["ga", "en"].map(lang => {
    ret+=(entry.intros[lang]||"").trim();
  });
  entry.examples.map(example => {
    ["ga", "en"].map(lang => {
      (example.texts[lang]||[]).map(text => {
        ret+=(text||"").trim();
      });
    });
  });
  entry.definitions.map(def => {
    ["ga", "en"].map(lang => {
      ret+=(def.texts[lang]||"").trim();
    });
  });
  return ret;
}
