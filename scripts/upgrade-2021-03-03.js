//A script to migrate all SQLite databases when the database schema has changed.

const path=require("path");
const fs=require("fs");
const Database=require('better-sqlite3');

//migrateDBs(path.join(__dirname, "../website/termbaseTemplates/"));
migrateDBs(path.join(__dirname, "../data/termbases/"));

function migrateDBs(dirPath){
    var filenames=fs.readdirSync(dirPath).filter(filename => /\.sqlite$/.test(filename));
    var count=filenames.length;
    console.log(`${count} databases to do`);
    filenames.map(filename => {
      console.log(`beginning ${filename}`);
      var filepath=path.join(dirPath, filename);

      try {
        const db = new Database(filepath, { fileMustExist: true });
    
        db.prepare(`CREATE INDEX IF NOT EXISTS ix_words_term_id_word ON words (term_id, word);`).run();
        db.close();

        console.log(` - done ${filename}, ${--count} databases remaining`);
      } catch (err) {
        console.log(` - cound not open ${filename} or index already exists, ${--count} databases remaining`);
      }
    });
  }