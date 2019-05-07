const HISTORIOGRAPHY=`{"diff":[{"desc":"sainmínithe áirithe a athrú go nótaí eolais"}]}`;

const Database = require('better-sqlite3');
const db = new Database('../data/termbases/bnt.sqlite', { fileMustExist: true });

var entryIDs=[];
db.prepare(`select distinct e.id
from entries as e
inner join entry_extranet as ee on ee.entry_id=e.id
inner join entry_def as ed on ed.entry_id=e.id`).all().map(row => {
  entryIDs.push(row.id);
});

const selEntry = db.prepare(`select * from entries where id=?`);
const updEntry = db.prepare(`update entries set json=? where id=?`);
const insEntryNote = db.prepare(`insert into entry_note(entry_id, type, lang, text) values(?, ?, ?, ?)`);
const insHistory = db.prepare(`insert into history(entry_id, action, 'when', email, json, historiography) values(?, 'update', ?, 'valselob@gmail.com', ?, ?)`);
entryIDs.map(entryID => {
  var rowEntry=selEntry.get(entryID);
  if(rowEntry){
    var entry=JSON.parse(rowEntry.json);
    entry.notes=[];
    entry.definitions.map(obj => {
      delete obj.domains;
      obj.type="4626821"; //default note type
      for(var lang in obj.texts){
        obj.texts[lang]=obj.texts[lang].replace(/^Sa bhunachar: /, function(){obj.type="4626822"; return "";});
        obj.texts[lang]=obj.texts[lang].replace(/^Fuaimniú: /, function(){obj.type="4626822"; return "";});
      }
      entry.notes.push(obj);
    });
    entry.definitions=[];
    if(entry.notes.length==0){
      console.log(`entry ${entryID}: no changes needed`);
    } else {
      var json=JSON.stringify(entry);
      var updEntryInfo=updEntry.run(json, entryID);
      var insHistoryInfo=insHistory.run(entryID, (new Date()).toISOString(), json, HISTORIOGRAPHY);
      entry.notes.map(note => {
        for(var lang in note.texts){
          if(note.texts[lang]!="") {
            var insEntryNoteInfo=insEntryNote.run(entryID, note.type, lang, note.texts[lang]);
            console.log("   "+insEntryNoteInfo.changes);
          }
        }
      });
      console.log(`entry ${entryID}: created ${entry.notes.length} notes`);
    }
  }
});

db.close();
