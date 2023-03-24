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
    const Database = require('better-sqlite3');
	//const db = new Database('./21.07.12_eurovoc/triail/triail.sqlite', {
    const db = new Database('./21.07.12_eurovoc/eurovoc/eurovoc.sqlite', {
            fileMustExist: true
        });
    const selEntry = db.prepare(`select * from entries where id=?`);
    const updEntryTermIndex = db.prepare(`update entry_term set accept=46 where term_id=? and accept=2`);
    entryIDs.map(entryID => {
        var rowEntry = selEntry.get(entryID);
        if (rowEntry) {
            var entry = JSON.parse(rowEntry.json);
            var termID = 0
			entry.desigs.map(obj => {
                if (obj.term.lang=="ga" && obj.accept=="46"){
                    termID = obj.term.id;
                }
            });
            var updEntryTermIndexInfo = updEntryTermIndex.run(termID);
            console.log(entryID + " [" + termID + "]" + " processed");
        }
    });
    db.close();
}
