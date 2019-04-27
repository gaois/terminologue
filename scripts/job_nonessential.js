const HISTORIOGRAPHY=`{"diff":[{"desc":"an lipéad neamhriachtanach a bhaint de gach téarma leis an inghlacthacht in úsáid/in use"}]}`;
const ACCEPT_ID=3116501;

const Database = require('better-sqlite3');
const db = new Database('../data/termbases/bnt.sqlite', { fileMustExist: true });

var entryIDs=[];
db.prepare(`select distinct et.entry_id from entry_term as et where et.accept=?`).all(ACCEPT_ID).map(row => {
  entryIDs.push(row.entry_id);
});

const selEntry = db.prepare(`select * from entries where id=?`);
const updEntry = db.prepare(`update entries set json=? where id=?`);
const insHistory = db.prepare(`insert into history(entry_id, action, 'when', email, json, historiography) values(?, 'update', ?, 'valselob@gmail.com', ?, ?)`);
entryIDs.map(entryID => {
  var rowEntry=selEntry.get(entryID);
  if(rowEntry){
    var entry=JSON.parse(rowEntry.json);
    var termIDs=[];
    entry.desigs.map(desig => {
      if(desig.accept==ACCEPT_ID && desig.nonessential!="0"){
        desig.nonessential="0";
        termIDs.push(desig.term.id);
      }
    });
    if(termIDs.length==0){
      console.log(`entry ${entryID}: no desigs changed`);
    } else {
      var json=JSON.stringify(entry);
      var updEntryInfo=updEntry.run(json, entryID);
      var insHistoryInfo=insHistory.run(entryID, (new Date()).toISOString(), json, HISTORIOGRAPHY);
      console.log(`entry ${entryID}: changed desigs of terms: ${termIDs}, rows changed: ${updEntryInfo.changes}+${insHistoryInfo.changes}`);
    }
  }
});

db.close();
