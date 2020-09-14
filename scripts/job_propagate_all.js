/*
	When done, run this SQL script on the SQL Server:
	\gaois\Tearma\Database\indexall.sql
*/

const SqliteDatabase=require('better-sqlite3');
const termbaseID="covid-19";
const sqliteDB=new SqliteDatabase('../data/termbases/'+termbaseID+'.sqlite', { fileMustExist: true });

const sql=require("mssql");
const sqlConnectionString="Server=vm-fion-db-l01\\;Database=fion_gaois_terms;Uid=fiontechsql;Pwd=wdpNOfwe2341NOFIE$weq;";
var pool=new sql.ConnectionPool(sqlConnectionString);
console.log(`connecting to SQL Server...`);
pool.connect(function(err){
	if(err) console.log(err);
	console.log(`   done`);
	doEntries();
});

function doEntries(){
	var entries=[];
	sqliteDB.prepare(`select * from entries`).all().map(row => { entries.push({id: row.id, json: row.json}); });
	const transaction = new sql.Transaction(/* [pool] */);
	go();
	function go(){
		var entry=entries.pop();
		if(entry){
			console.log(`propagating entry ${entry.id}`);
			var request=new sql.Request(pool);
			request.input("entryID", sql.Int, entry.id);
			request.input("json", sql.NVarChar, entry.json);
			//request.input("skipIndexing", sql.Bit, 1);
			request.input("collection", sql.NVarChar, termbaseID);
			request.execute("propag_saveEntry", function(err){
				if(err) console.log(err);
				console.log(`   done`);
				console.log(`   ${entries.length} entries left to go`);
				go();
			});

		} else {
			console.log(`all entries propagated`);
			doMetadata();
		}
	}
}

function doMetadata(){
	var metadata=[];
	sqliteDB.prepare(`select * from metadata`).all().map(row => { metadata.push({id: row.id, type: row.type, json: row.json}); });
	go();
	function go(){
		var metadatum=metadata.pop();
		if(metadatum){
			console.log(`propagating metadatum ${metadatum.id}`);
			var request=new sql.Request(pool);
			request.input("id", sql.Int, metadatum.id);
			request.input("type", sql.VarChar, metadatum.type);
			request.input("json", sql.NVarChar, metadatum.json);
			request.input("collection", sql.NVarChar, termbaseID);
			request.execute("propag_saveMetadatum", function(err){
				if(err) console.log(err);
				console.log(`   done`);
				go();
			});
		} else {
			console.log(`all metadata propagated`);
		}
	}
}
