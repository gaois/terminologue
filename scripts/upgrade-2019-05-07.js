//A script to migrate all SQLite databases when the database schema has changed.

const path=require("path");
const fs=require("fs");
const Database = require('better-sqlite3');

migrateDBs(path.join(__dirname, "../website/termbaseTemplates/"));
//migrateDBs(path.join(__dirname, "../data/termbases/"));

function migrateDBs(dirPath){
  var filenames=fs.readdirSync(dirPath).filter(filename => /\.sqlite$/.test(filename));
  var count=filenames.length;
  console.log(`${count} databases to do`);
  filenames.map(filename => {
    console.log(`beginning ${filename}`);
    var filepath=path.join(dirPath, filename);
    const db = new Database(filepath, { fileMustExist: true });

    //create entry_note table:
    db.prepare(`CREATE TABLE IF NOT EXISTS entry_note (
      entry_id INTEGER   REFERENCES entries (id) ON DELETE CASCADE,
      type     INTEGER,
      lang     CHAR (10),
      text     TEXT
    )`).run();

    //create indexes in entry_note table:
    db.prepare(`CREATE INDEX IF NOT EXISTS ix_entry_note_entry_id ON entry_note (
        entry_id
    )`).run();
    db.prepare(`CREATE INDEX IF NOT EXISTS ix_entry_note_type ON entry_note (
        type
    )`).run();
    db.prepare(`insert into metadata(type, json, sortkey) values(
		'noteType',
		'{"title": {"en": "internal remark"}, "level": "0"}',
		'_00039_00060_00088_00021_00077_00060_00000_00053_00077_00021_00059_00000_00077_00050'
	)`).run();

    db.close();
    console.log(` - done ${filename}, ${--count} databases remaining`);
  });
}
