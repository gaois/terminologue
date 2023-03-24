var entryIDs = [];

var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream('./21.06.30_entrylist.txt')
    });
lineReader.on('line', function (line) {
    var entryID = line.split("\t")[0];
    entryIDs.push(parseInt(entryID));
});
lineReader.on("close", function () {
    onebyone();
});

function onebyone() {
    const HISTORIOGRAPHY = `{"diff":[{"desc":"lipéad inghlacthachta athraithe"}]}`;
    const Database = require('better-sqlite3');
    const db = new Database('./21.06.30_eurovoc/eurovoc/eurovoc.sqlite', {
            fileMustExist: true
        });
    const selEntry = db.prepare(`select * from entries where id=?`);
    const updEntry = db.prepare(`update entries set json=? where id=?`);
    const insHistory = db.prepare(`insert into history(entry_id, action, 'when', email, json, historiography) values(?, 'update', ?, 'brian.oraghallaigh@dcu.ie', ?, ?)`);
    entryIDs.map(entryID => {
        var rowEntry = selEntry.get(entryID);
        if (rowEntry) {
            var entry = JSON.parse(rowEntry.json);
            entry.desigs.map(obj => {
                if (obj.term.lang=="ga" && obj.accept=="2"){
                    obj.accept="46";
                }
            });
            var json = JSON.stringify(entry);
            var updEntryInfo = updEntry.run(json, entryID);
            var insHistoryInfo = insHistory.run(entryID, (new Date()).toISOString(), json, HISTORIOGRAPHY);
            console.log(entryID + " processed");
        }
    });
    db.close();
}
