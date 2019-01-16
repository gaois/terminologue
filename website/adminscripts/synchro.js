const sqlite3 = require('sqlite3');
var db=new sqlite3.Database("C:\\MBM\\gaois\\terminologue\\data\\termbases\\bnt.sqlite", sqlite3.OPEN_READONLY);

const sql=require("mssql");
var sqlConfig="Server=localhost\\SQLEXPRESS;Database=tearma;User Id=sa;Password=triPEStri";
sql.connect(sqlConfig, function(err){
	if(err) console.log(err);
	doLingo(function(){
		doMetadata(function(){
			doEntries(function(){
				sql.close();
				console.log("done.");
			})
		})
	});
});

function doLingo(callnext){
	console.log("doing lingo...");
	db.get("select * from configs where id='lingo'", {}, function(err, row){
		if(err) console.log(err);
		var request=new sql.Request();
		request.input("json", sql.NVarChar, row["json"]);
		request.query("update configs set json=@json where id='lingo'", function(err, result){
			if(err) console.log(err);
			callnext();
		});
	});
};

function doMetadata(callnext){
	console.log("doing metadata...");
	var rows=[];
	var request=new sql.Request();
	request.query('truncate table metadata', function(err, result){
		if(err) console.log(err);
		db.all("select * from metadata", {}, function(err, _rows){
			if(err) console.log(err);
			rows=_rows;
			go();
		});
	});
	function go(){
		var row=rows.pop();
		if(row){
			var request=new sql.Request();
			request.input("id", sql.Int, row["id"]);
			request.input("type", sql.VarChar, row["type"]);
			request.input("json", sql.NVarChar, row["json"]);
			request.query("insert into metadata(id, type, json) values(@id, @type, @json)", function(err, result){
				if(err) console.log(err);
				go();
			});
		} else {
			callnext();
		}
	}
}

function doEntries(callnext){
	console.log("doing entries...");
	var rows=[];
	var request=new sql.Request();
	request.query('truncate table entries', function(err, result){
		if(err) console.log(err);
		db.all("select * from entries", {}, function(err, _rows){
			if(err) console.log(err);
			rows=_rows;
			go();
		});
	});
	function go(){
		var row=rows.pop();
		if(row){
			console.log(row["id"]);
			var request=new sql.Request();
			request.input("id", sql.Int, row["id"]);
			request.input("json", sql.NVarChar, row["json"]);
			request.input("cStatus", sql.Int, row["cStatus"]);
			request.input("pStatus", sql.Int, row["pStatus"]);
			request.input("dateStamp", sql.Date, row["dateStamp"]);
			request.query("insert into entries(id, json, cStatus, pStatus, dateStamp) values(@id, @json, @cStatus, @pStatus, @dateStamp)", function(err, result){
				if(err) console.log(err);
				go();
			});
		} else {
			callnext();
		}
	}
}

function x_doEntries(callnext){
	console.log("doing metadata...");
	var request=new sql.Request();
	request.query('truncate table entries', function(err, result){
		if(err) console.log(err);
		db.each("select * from entries limit 10", {}, function(err, row){
			console.log(row["id"]);
			var request=new sql.Request();
			request.input("id", sql.Int, row["id"]);
			request.input("json", sql.NVarChar, row["json"]);
			request.input("cStatus", sql.Int, row["cStatus"]);
			request.input("pStatus", sql.Int, row["pStatus"]);
			request.input("dateStamp", sql.Date, row["dateStamp"]);
			request.query("insert into entries(id, json, cStatus, pStatus, dateStamp) values(@id, @json, @cStatus, @pStatus, @dateStamp)", function(err, result){
				if(err) console.log(err);
			});
		}, function(err){
			console.log("entries done.");
			//callnext();
		});
	});
	
}





