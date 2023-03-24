var entryIDs = [];

var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream('./21.09.08_entrylist.txt')
    });
lineReader.on('line', function (line) {
    var entryID = line.split("\t")[0];
    entryIDs.push(parseInt(entryID));
});
lineReader.on("close", function () {
    onebyone();
});

function onebyone() {
    const HISTORIOGRAPHY = `{"diff":[{"desc":"nóta eolais curtha leis an iontráil"}]}`;
    const Database = require('better-sqlite3');
    //const db = new Database('./21.09.08_eurovoc/triail/triail.sqlite', {
	const db = new Database('./21.09.08_eurovoc/eurovoc/eurovoc.sqlite', {
            fileMustExist: true
        });
    const selEntry = db.prepare(`select * from entries where id=?`);
    const updEntry = db.prepare(`update entries set json=? where id=?`);
    const insEntryNote = db.prepare(`insert into entry_note(entry_id, type, lang, text) values(?, ?, ?, ?)`);
    const insHistory = db.prepare(`insert into history(entry_id, action, 'when', email, json, historiography) values(?, 'update', ?, 'brian.oraghallaigh@dcu.ie', ?, ?)`);
    entryIDs.map(entryID => {
        var rowEntry = selEntry.get(entryID);
        if (rowEntry) {
            var entry = JSON.parse(rowEntry.json);
            if (!entry.notes) {
                entry.notes = [];
            }
            var note = {
                "type": "45",
                "texts": {
                    "en": "",
                    "ga": "Imithe ar Ais-seoladh 003"
                },
                "sources": [],
                "nonessential": "0"
            }
            entry.notes.push(note);
            var json = JSON.stringify(entry);
            var updEntryInfo = updEntry.run(json, entryID);
            var insHistoryInfo = insHistory.run(entryID, (new Date()).toISOString(), json, HISTORIOGRAPHY);
            var insEntryNoteInfo = insEntryNote.run(entryID, "45", "ga", "Imithe ar Ais-seoladh 003");
            console.log(entryID + " processed");
        }
    });
    db.close();
}
