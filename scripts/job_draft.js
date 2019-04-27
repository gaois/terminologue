const HISTORIOGRAPHY=`{"diff":[{"desc":"Stádas 'dréacht-iontráil' a lua le hiontrálacha atá sa bhailiúcháin 'Foclóir Gnó (dréacht)' amháin nó sa bhailiúchán 'Foclóir Eacnamaíocht Bhaile (dréacht)' amháin"}]}`;
const DOMAIN_ONE_ID=3116602;
const DOMAIN_TWO_ID=3116624;

const Database = require('better-sqlite3');
const db = new Database('../data/termbases/bnt.sqlite', { fileMustExist: true });

var entryIDs=[];
db.prepare(`select distinct e.id as entry_id
from entries as e
inner join entry_collection as ec on ec.entry_id=e.id
where (ec.collection=? or ec.collection=?)
and (select count(*) from entry_collection as ecAll where ecAll.entry_id=e.id)=1`).all(DOMAIN_ONE_ID, DOMAIN_TWO_ID).map(row => {
  entryIDs.push(row.entry_id);
});
console.log(entryIDs.length);

const selEntry = db.prepare(`select * from entries where id=?`);
const updEntry = db.prepare(`update entries set json=?, dStatus='0' where id=?`);
const insHistory = db.prepare(`insert into history(entry_id, action, 'when', email, json, historiography) values(?, 'update', ?, 'valselob@gmail.com', ?, ?)`);
entryIDs.map(entryID => {
  var rowEntry=selEntry.get(entryID);
  if(rowEntry){
    var entry=JSON.parse(rowEntry.json);
    if(entry.dStatus=="0"){
      console.log(`entry ${entryID}: no need to change anything`);
    } else {
      entry.dStatus="0";
      var json=JSON.stringify(entry);
      var updEntryInfo=updEntry.run(json, entryID);
      var insHistoryInfo=insHistory.run(entryID, (new Date()).toISOString(), json, HISTORIOGRAPHY);
      console.log(`entry ${entryID}: done, rows changed: ${updEntryInfo.changes}+${insHistoryInfo.changes}`);
    }
  }
});

db.close();
