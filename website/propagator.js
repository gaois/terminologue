const sql=require("mssql");

module.exports={
  msSqlConnectionStrings: {},
  withMsSqlConnectionStrings: function(msSqlConnectionStrings){
    module.exports.msSqlConnectionStrings=msSqlConnectionStrings;
    return module.exports;
  },

  saveEntry: function(termbaseID, entryID, entry){
    if(module.exports.msSqlConnectionStrings[termbaseID]){
      var pool=new sql.ConnectionPool(module.exports.msSqlConnectionStrings[termbaseID]);
      pool.connect(function(err){
		var request=new sql.Request(pool);
      	request.input("entryID", sql.Int, entryID);
      	request.input("json", sql.NVarChar, JSON.stringify(entry));
      	request.execute("propag_saveEntry", function(err){
			pool.close();
      	});
      });
    }
  },
  deleteEntry: function(termbaseID, entryID){
    if(module.exports.msSqlConnectionStrings[termbaseID]){
      var pool=new sql.ConnectionPool(module.exports.msSqlConnectionStrings[termbaseID]);
	  pool.connect(function(err){
        var request=new sql.Request(pool);
      	request.input("entryID", sql.Int, entryID);
      	request.execute("propag_deleteEntry", function(err){
      		pool.close();
      	});
      });
    }
  },

  saveMetadatum: function(termbaseID, id, type, obj){
    if(["acceptLabel", "domain", "inflectLabel", "posLabel"].indexOf(type)>-1){
      if(module.exports.msSqlConnectionStrings[termbaseID]){
        var json=obj; if(typeof(json)!="string") json=JSON.parse(json);
		var pool=new sql.ConnectionPool(module.exports.msSqlConnectionStrings[termbaseID]);
		pool.connect(function(err){
			var request=new sql.Request(pool);
        	request.input("id", sql.Int, id);
        	request.input("type", sql.VarChar, type);
        	request.input("json", sql.NVarChar, json);
        	request.execute("propag_saveMetadatum", function(err){
        		pool.close();
        	});
        });
      }
    }
  },
  deleteMetadatum: function(termbaseID, id){
    if(module.exports.msSqlConnectionStrings[termbaseID]){
      var pool=new sql.ConnectionPool(module.exports.msSqlConnectionStrings[termbaseID]);
	  pool.connect(function(err){	
        var request=new sql.Request(pool);
      	request.input("id", sql.Int, id);
      	request.execute("propag_deleteMetadatum", function(err){
      		pool.close();
      	});
      });
    }
  },

  saveConfig: function(termbaseID, id, obj){
    if(["lingo", "news"].indexOf(id)>-1){
      if(module.exports.msSqlConnectionStrings[termbaseID]){
        var json=obj; if(typeof(json)!="string") json=JSON.parse(json);
        var pool=new sql.ConnectionPool(module.exports.msSqlConnectionStrings[termbaseID]);
        pool.connect(function(err){
          var request=new sql.Request(pool);
        	request.input("id", sql.VarChar, id);
        	request.input("json", sql.NVarChar, json);
        	request.execute("propag_saveConfig", function(err){
        		pool.close();
        	});
        });
      }
    }
  },
};
