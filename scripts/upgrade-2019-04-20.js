//A script to migrate all SQLite databases when the database schema has changed.

const path=require("path");
const fs=require("fs");
const Database = require('better-sqlite3');

//migrateDBs(path.join(__dirname, "../website/termbaseTemplates/"));
migrateDBs(path.join(__dirname, "../data/termbases/"));

function migrateDBs(dirPath){
  var filenames=fs.readdirSync(dirPath).filter(filename => /\.sqlite$/.test(filename));
  var count=filenames.length;
  console.log(`${count} databases to do`);
  filenames.map(filename => {
    console.log(`beginning ${filename}`);
    var filepath=path.join(dirPath, filename);
    const db = new Database(filepath, { fileMustExist: true });

    //add dStatus column and index:
    try {
      db.prepare(`alter table entries add column "dStatus" TEXT default '1'`).run();
    } catch(ex) {}
    db.prepare(`CREATE INDEX IF NOT EXISTS ix_entries_dStatus ON entries (dStatus)`).run();

    db.close();
    console.log(` - done ${filename}, ${--count} databases remaining`);
  });
}
