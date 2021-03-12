const SINCE="2019-03-09T09:50:00";
const EMAIL="valselob@gmail.com";

const SqliteDatabase=require('better-sqlite3');
const sqliteDB=new SqliteDatabase('../data/termbases/bnt.sqlite', { fileMustExist: true });
var histories=[];
console.log(`reading history items...`);
sqliteDB.prepare(`select * from history where [when]>=? and email=? order by [when] desc`).all(SINCE, EMAIL).map(row => {
  histories.push({entryID: row.entry_id, action: row.action, when: row.when});
});
console.log(`   done, we have ${histories.length} history items to propagate`);
const selEntry=sqliteDB.prepare(`select * from entries where id=?`);

const sql=require("mssql");
const sqlConnectionString="Server=SERVER_NAME;Database=DB_NAME;Uid=USER_ID;Pwd=USER_PASSWORD;";
var pool=new sql.ConnectionPool(sqlConnectionString);
console.log(`connecting to SQL Server...`);
pool.connect(function(err){
	if(err) console.log(err);
	console.log(`   done`);
	go();
});

function go(){
	var history=histories.pop();
	if(!history) {
		console.log(`closing connection to SQL Server`);
		pool.close();
		sqliteDB.close();
		return;
	} else {
		if(history.action=="delete"){
			console.log(`propagating deletion of entry ${history.entryID} on ${history.when}...`);
			var request=new sql.Request(pool);
			request.input("entryID", sql.Int, parseInt(history.entryID));
			request.execute("propag_deleteEntry", function(err){
				if(err) console.log(err);
				console.log(`   done, we have ${histories.length} history items left to propagate`);
				go();
			});
		} else {
			var rowEntry=selEntry.get(history.entryID);
			console.log(`propagating update or creation of entry ${history.entryID} on ${history.when}...`);
			if(!rowEntry){
				console.log(`   not done (entry doesn't exist any more), we have ${histories.length} history items left to propagate`);
				go();
			}else{
				var request=new sql.Request(pool);
				request.input("entryID", sql.Int, parseInt(history.entryID));
				request.input("json", sql.NVarChar, rowEntry.json);
				request.execute("propag_saveEntry", function(err){
					if(err) console.log(err);
					console.log(`   done, we have ${histories.length} history items left to propagate`);
					go();
				});
			}
		}
	}
}