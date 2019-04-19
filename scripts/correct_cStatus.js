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
  const selEntry = db.prepare('select * from entries where id=? and cStatus=1');
  const updEntry = db.prepare('update entries set json=?, cStatus=0 where id=?');
  entryIDs.map(entryID => {
    var rowEntry=selEntry.get(entryID);
    if(!rowEntry){
      console.log(`${entryID}: no need to do`);
    } else {
      var entry=JSON.parse(rowEntry.json);
      entry.cStatus="0";
      var json=JSON.stringify(entry);
      var info=updEntry.run(json, entryID);
      console.log(`${entryID}: done, rows changed: ${info.changes}`);
    }
  });
  db.close();
}
