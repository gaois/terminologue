//set extranets=["4626859"] for each entry in _entrylist.txt

const BNT_EXTRANET_ID="4626859"; // An t-eislíon in BNT (Terminologue) air ar cheart na hiontrálacha a chur.

var entryIDs=[];

var lineReader=require('readline').createInterface({
  input: require('fs').createReadStream('./_entrylist.txt')
});
lineReader.on('line', function(line) {
  var entryID=line.split("\t")[0];
  entryIDs.push(parseInt(entryID));
});
lineReader.on("close", function(){
  onebyone();
});

function onebyone(){
  const Database = require('better-sqlite3');
  const db = new Database('../data/termbases/bnt.sqlite', { fileMustExist: true });
  const selEntry = db.prepare('select * from entries where id=?');
  const updEntry = db.prepare('update entries set json=? where id=?');
  const idxExtranet = db.prepare('insert into entry_extranet(entry_id, extranet) values (?, ?)');
  entryIDs.map(entryID => {
    var rowEntry=selEntry.get(entryID);
    if(!rowEntry){
      console.log(`${entryID}: no need to do`);
    } else {
      var entry=JSON.parse(rowEntry.json);
      //entry.extranets=[BNT_EXTRANET_ID];
      if(!entry.extranets) entry.extranets=[];
      entry.extranets.push(BNT_EXTRANET_ID);
      var json=JSON.stringify(entry);
      var info=updEntry.run(json, entryID);
      var out=idxExtranet.run(entryID, BNT_EXTRANET_ID);
      console.log(`${entryID}: done, rows changed: ${info.changes}`);
    }
  });
  db.close();
}
