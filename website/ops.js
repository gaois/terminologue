const path=require("path");
const fs=require("fs-extra");
const sqlite3 = require('sqlite3').verbose(); //https://www.npmjs.com/package/sqlite3
const sha1 = require('sha1'); //https://www.npmjs.com/package/sha1
const markdown = require("markdown").markdown; //https://www.npmjs.com/package/markdown

module.exports={
  siteconfig: {}, //populated by terminologue.js on startup

  login: function(email, password, callnext){
    if(module.exports.siteconfig.readonly){
      callnext(false, "", "");
    } else {
      var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE);
      var hash=sha1(password);
      db.get("select email from users where email=$email and passwordHash=$hash", {$email: email, $hash: hash}, function(err, row){
        if(!row){
          db.close();
          callnext(false, "", "");
        } else {
          email=row.email;
          var key=generateKey();
          var now=(new Date()).toISOString();
          db.run("update users set sessionKey=$key, sessionLast=$now where email=$email", {$key: key, $now: now, $email: email}, function(err, row){
            db.close();
            callnext(true, email, key);
          });
        }
      });
    }
  },
  logout: function(email, sessionkey, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE);
    db.run("update users set sessionKey=null where email=$email and sessionKey=$key", {$email: email, $key: sessionkey}, function(err, row){
      db.close();
      callnext();
    });
  },
  verifyLogin: function(email, sessionkey, callnext){
    var yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select email from users where email=$email and sessionKey=$key and sessionLast>=$yesterday", {$email: email, $key: sessionkey, $yesterday: yesterday}, function(err, row){
      if(!row || module.exports.siteconfig.readonly){
        db.close();
        callnext({loggedin: false, email: null});
      } else {
        email=row.email;
        var now=(new Date()).toISOString();
        db.run("update users set sessionLast=$now where email=$email", {$now: now, $email: email}, function(err, row){
          db.close();
          callnext({loggedin: true, email: email, isAdmin: (module.exports.siteconfig.admins.indexOf(email)>-1)});
        });
      }
    });
  },
  getTermbasesByUser: function(email, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE);
    var sql="select tb.id, tb.title from termbases as tb inner join user_termbase as utb on utb.termbase_id=tb.id where utb.user_email=$email order by tb.title"
    var termbases=[];
    db.all(sql, {$email: email}, function(err, rows){
      if(rows) for(var i=0; i<rows.length; i++) termbases.push({id: rows[i].id, title: rows[i].title});
      db.close();
      callnext(termbases);
    });
  },

  escalateConfigIdent: function(termbaseID, ident, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
    db.run("delete from termbases where id=$termbaseID", {$termbaseID: termbaseID}, function(err){
      db.run("insert into termbases(id, title) values ($termbaseID, $title)", {$termbaseID: termbaseID, $title: ident.title}, function(err){
        db.close();
        callnext();
      });
    });
  },
  escalateConfigUsers: function(termbaseID, users, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
    db.run("delete from user_termbase where termbase_id=$termbaseID", {$termbaseID: termbaseID}, function(err){
      for(var email in users){
        db.run("insert into user_termbase(termbase_id, user_email) values ($termbaseID, $email)", {$termbaseID: termbaseID, $email: email}, function(err){});
      }
      db.close();
      callnext();
    });
  },

  termbaseExists: function(termbaseID){
    return fs.existsSync(path.join(module.exports.siteconfig.dataDir, "termbases/"+termbaseID+".sqlite"));
  },
  getDB: function(termbaseID, readonly){
    var mode=(readonly ? sqlite3.OPEN_READONLY : sqlite3.OPEN_READWRITE);
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "termbases/"+termbaseID+".sqlite"), mode, function(err){});
    if(!readonly) db.run('PRAGMA journal_mode=WAL');
    db.run('PRAGMA foreign_keys=on');
    return db;
  },
  verifyLoginAndTermbaseAccess: function(email, sessionkey, termbaseDB, termbaseID, callnext){
    var yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select email from users where email=$email and sessionKey=$key and sessionLast>=$yesterday", {$email: email, $key: sessionkey, $yesterday: yesterday}, function(err, row){
      if(!row || module.exports.siteconfig.readonly){
        db.close();
        callnext({loggedin: false, email: null});
      } else {
        email=row.email;
        var now=(new Date()).toISOString();
        db.run("update users set sessionLast=$now where email=$email", {$now: now, $email: email}, function(err, row){
          db.close();
          module.exports.readTermbaseConfigs(termbaseDB, termbaseID, function(configs){
            if(!configs.users[email] && module.exports.siteconfig.admins.indexOf(email)==-1){
              callnext({loggedin: true, email: email, termbaseAccess: false, isAdmin: false});
            } else {
              var isAdmin=(module.exports.siteconfig.admins.indexOf(email)>-1);
              callnext({loggedin: true, email: email, termbaseAccess: true, isAdmin: isAdmin});
            }
          });
        });
      }
    });
  },
  readTermbaseConfigs: function(db, termbaseID, callnext){
    if(db.termbaseConfigs) callnext(db.termbaseConfigs); else {
      var configs={};
      configs.siteconfig=module.exports.siteconfig;
      db.all("select * from configs", {}, function(err, rows){
        if(!err) for(var i=0; i<rows.length; i++) configs[rows[i].id]=JSON.parse(rows[i].json);
        db.termbaseConfigs=configs;
        callnext(configs);
      });
    }
  },
  readTermbaseMetadata: function(db, termbaseID, callnext){
    var metadata={};
    db.all("select * from metadata", {}, function(err, rows){
      if(!err) for(var i=0; i<rows.length; i++) {
        var type=rows[i].type;
        if(!metadata[type]) metadata[type]=[];
        var json=JSON.parse(rows[i].json);
        json.id=rows[i].id;
        metadata[type].push(json);
      }
      callnext(metadata);
    });
  },

  entryList: function(db, termbaseID, facets, searchtext, modifier, howmany, callnext){
    var modifiers=modifier.split(" ");
    var sql1=`select * from entries order by id limit $howmany`;
    var params1={$howmany: howmany};
    var sql2=`select count(*) as total from entries`;
    var params2={};
    db.all(sql1, params1, function(err, rows){
      if(err || !rows) rows=[];
      var suggestions=null;
      var primeEntries=null;
      var entries=[];
      for(var i=0; i<rows.length; i++){
        var item={id: rows[i].id, title: rows[i].id, json: rows[i].json};
        entries.push(item);
      }
      if(modifiers.indexOf("smart")>-1 && searchtext!=""){
        suggestions=["jabbewocky", "dord", "gibberish", "coherence", "nonce word", "cypher", "the randomist"];;
        primeEntries=[];
        if(entries.length>0) primeEntries.push(entries.shift());
      }
      db.get(sql2, params2, function(err, row){
        var total=(!err && row) ? row.total : 0;
        module.exports.intractTermsOfEntries(db, termbaseID, entries.concat(primeEntries), function(){
          callnext(total, primeEntries, entries, suggestions);
        })
      });
    });
  },
  entryDelete: function(db, termbaseID, entryID, email, historiography, callnext){
    db.run("delete from entries where id=$id", {
      $id: entryID,
    }, function(err){
      //tell history that have been deleted:
      db.run("insert into history(entry_id, action, [when], email, json, historiography) values($entry_id, $action, $when, $email, $json, $historiography)", {
        $entry_id: entryID,
        $action: "delete",
        $when: (new Date()).toISOString(),
        $email: email,
        $json: null,
        $historiography: JSON.stringify(historiography),
      }, function(err){});
      callnext();
    });
  },
  entryHistory: function(db, termbaseID, entryID, callnext){
    db.all("select * from history where entry_id=$entryID order by [when] desc", {$entryID: entryID}, function(err, rows){
      var history=[];
      for(var i=0; i<rows.length; i++) {
        var row=rows[i];
        history.push({
          "entry_id": row.entry_id,
          "revision_id": row.id,
          "content": row.json,
          "action": row.action,
          "when": row.when,
          "email": row.email,
          "historiography": JSON.parse(row.historiography)
        });
      }
      callnext(history);
    });
  },
  entryRead: function(db, termbaseID, entryID, callnext){
    db.get("select * from entries where id=$id", {$id: entryID}, function(err, row){
      if(!row) {
        var entryID=0;
        var json="";
        var title="";
        callnext(entryID, json, title);
      } else {
        var entryID=row.id;
        var json=row.json;
        var title=row.id;
        module.exports.intractTermsOfEntry(db, termbaseID, entryID, JSON.parse(json), function(fatJson){
          callnext(entryID, JSON.stringify(fatJson), title);
        });
      }
    });
  },
  entrySave: function(db, termbaseID, entryID, json, email, historiography, callnext){
    //first of all, find out what we're supposed to do:
    if(!entryID) go("create"); //this is a new entry
    else db.get("select id, json from entries where id=$id", {$id: entryID}, function(err, row){
      if(!row) go("recreate"); //an entry with that ID does not exist: recreate it with that ID
      else go("change") //the entry has changed: update it
    });
    //now actually do it:
    function go(dowhat){
      var parsedJson=JSON.parse(json);
      module.exports.extractTerms(db, termbaseID, parsedJson, function(slimJson){
        var sql=""; var params={};
        if(dowhat=="create"){ sql="insert into entries(json) values($json)"; params={$json: JSON.stringify(slimJson)}; }
        if(dowhat=="recreate"){ sql="insert into entries(id, json) values($id, $json)"; params={$json: JSON.stringify(slimJson), $id: entryID}; }
        if(dowhat=="change"){ sql="update entries set json=$json where id=$id"; params={$json: JSON.stringify(slimJson), $id: entryID}; }
        //create or change me:
        db.run(sql, params, function(err){
          if(!entryID) entryID=this.lastID;
          //delete any pre-existing connections between this entry and any term:
          db.run("delete from entry_term where entry_id=$entry_id", {$entry_id: entryID}, function(err, row){
            //save connections between entry and terms:
            var termIDs=[]; slimJson.desigs.map(desig => { termIDs.push(desig.term) });
            module.exports.saveTermConnections(db, termbaseID, entryID, termIDs, function(){
              //delete orphaned terms:
              db.run("delete from terms where id in (select t.id from terms as t left outer join entry_term as et on et.term_id=t.id where et.entry_id is null)", {}, function(err, row){
                //tell history that I have been created or changed:
                module.exports.saveHistory(db, termbaseID, entryID, (dowhat=="change" ? "update" : "create"), email, json, historiography, function(){
                  callnext(entryID);
                });
              });
            });
          });
        });
      });
    }
  },

  saveHistory: function(db, termbaseID, entryID, action, email, json, historiography, callnext){
    db.run("insert into history(entry_id, action, [when], email, json, historiography) values($entry_id, $action, $when, $email, $json, $historiography)", {
      $entry_id: entryID,
      $action: action,
      $when: (new Date()).toISOString(),
      $email: email,
      $json: json,
      $historiography: JSON.stringify(historiography),
    }, function(err){
      callnext();
    });
  },

  extractTerms: function(db, termbaseID, entry, callnext){
    go();
    function go(){
      //find the first term that hasn't been extracted yet:
      for(var i=0; i<entry.desigs.length; i++){
        if(typeof(entry.desigs[i].term)=="object"){
          module.exports.saveTerm(db, termbaseID, entry.desigs[i].term, function(termID){
            entry.desigs[i].term=termID;
            //recursively, go to the next term that hasn't been extracted yet:
            go();
          });
          break;
        }
      }
      //when all terms have been extracted, we're done:
      if(i>=entry.desigs.length) callnext(entry);
    }
  },
  saveTerm: function(db, termbaseID, term, callnext){
    if(term.id && typeof(term.id)=="string") term.id=parseInt(term.id);
    //delete the term (if it exists), (re)create the term:
    var sql="insert into terms(id, json) values($id, $json)"; var params={$id: term.id, $json: JSON.stringify(term)};
    if(!term.id){ sql="insert into terms(json) values($json)"; params={$json: JSON.stringify(term)}; }
    db.run("delete from terms where id=$id", {$id: term.id}, function(err, row){
      db.run(sql, params, function(err, row){
        var termID=term.id || this.lastID;
        callnext(termID); //return the ID of the term just saved
      });
    });
  },
  saveTermConnections: function(db, termbaseID, entryID, termIDs, callnext){
    go();
    function go(){
      var termID=termIDs.pop();
      if(termID) {
        db.run("insert into entry_term(entry_id, term_id) values($entryID, $termID)", {$entryID: entryID, $termID: termID}, function(err, row){
          go();
        });
      } else {
        callnext();
      }
    }
  },
  intractTermsOfEntry: function(db, termbaseID, entryID, entry, callnext){
    db.all("select t.* from terms as t inner join entry_term as et on et.term_id=t.id where et.entry_id=$entryID", {$entryID: entryID}, function(err, rows){
      var terms={}; //id --> {...}
      rows.map(row => { terms[row["id"]]=JSON.parse(row["json"]) });
      entry.desigs.map(desig => {
        var termID=null; if(typeof(desig.term)=="number") termID=desig.term; else if(desig.term.id) termID=desig.term.id;
        if(terms[termID]) { desig.term=terms[termID]; desig.term.id=termID.toString(); }
      });
      callnext(entry);
    });
  },
  intractTermsOfEntries: function(db, termbaseID, entries, callnext){
    var list=""; entries.map(entry=>{if(entry){ if(list!="") list+=","; list+=entry.id; }});
    db.all("select t.* from terms as t inner join entry_term as et on et.term_id=t.id where et.entry_id in ("+list+")", {}, function(err, rows){
      var terms={}; //id --> {...}
      rows.map(row => { terms[row["id"]]=JSON.parse(row["json"]) });
      entries.map(entry => {
        if(entry) {
          var parsedJson=JSON.parse(entry.json);
          parsedJson.desigs.map(desig => {
            var termID=null; if(typeof(desig.term)!="object") termID=desig.term; else if(desig.term.id) termID=desig.term.id;
            if(terms[termID]) { desig.term=terms[termID]; desig.term.id=termID.toString(); }
          });
          entry.json=JSON.stringify(parsedJson);
        }
      });
      callnext();
    });
  },

  metadataList: function(db, termbaseID, type, facets, searchtext, modifier, howmany, callnext){
    var sql1=`select * from metadata where type=$type order by id limit $howmany`;
    var params1={$howmany: howmany, $type: type};
    var sql2=`select count(*) as total from metadata where type=$type`;
    var params2={$type: type};
    db.all(sql1, params1, function(err, rows){
      if(err || !rows) rows=[];
      var entries=[];
      for(var i=0; i<rows.length; i++){
        var item={id: rows[i].id, title: rows[i].id, json: rows[i].json};
        entries.push(item);
      }
      db.get(sql2, params2, function(err, row){
        var total=(!err && row) ? row.total : 0;
        callnext(total, entries);
      });
    });
  },
  metadataRead: function(db, termbaseID, type, entryID, callnext){
    db.get("select * from metadata where id=$id and type=$type", {$id: entryID, $type: type}, function(err, row){
      if(!row) {
        var entryID=0;
        var json="";
        var title="";
        callnext(entryID, json, title);
      } else {
        var entryID=row.id;
        var json=row.json;
        var title=row.id;
        callnext(entryID, json, title);
      }
    });
  },
  metadataDelete: function(db, termbaseID, type, entryID, callnext){
    db.run("delete from metadata where id=$id and type=$type", {
      $id: entryID, $type: type
    }, function(err){
      callnext();
    });
  },
  metadataCreate: function(db, termbaseID, type, entryID, json, callnext){
    var sql="insert into metadata(type, json) values($type, $json)";
    var params={$json: json, $type: type};
    if(entryID) {
      sql="insert into metadata(id, type, json) values($id, $type, $json)";
      params.$id=entryID;
    }
    db.run(sql, params, function(err){
      if(!entryID) entryID=this.lastID;
      callnext(entryID, json);
    });
  },
  metadataUpdate: function(db, termbaseID, type, entryID, json, callnext){
    db.get("select id, json from metadata where id=$id and type=$type", {$id: entryID, $type: type}, function(err, row){
      var newJson=json;
      var oldJson=(row?row.json:"");
      if(!row) { //an entry with that ID does not exist: recreate it with that ID:
        module.exports.metadataCreate(db, termbaseID, type, entryID, json, callnext);
      } else if(oldJson==newJson) {
        callnext(entryID, json, false);
      } else {
        //update me:
        db.run("update metadata set json=$json where id=$id and type=$type", {
          $id: entryID, $json: json, $type: type
        }, function(err){
          callnext(entryID, json, true);
        });
      }
    });
  },

  configRead: function(db, termbaseID, configID, callnext){
    db.get("select * from configs where id=$id", {$id: configID}, function(err, row){
      config=row.json;
      callnext(config);
    });
  },
  configUpdate: function(db, termbaseID, configID, json, callnext){
    db.run("update configs set json=$json where id=$id", {$id: configID, $json: json}, function(err){
      afterwards();
    });
    var afterwards=function(){
      if(configID=="ident"){
        module.exports.escalateConfigIdent(termbaseID, JSON.parse(json), function(){
          callnext(json, false);
        });
      } else if(configID=="users"){
        module.exports.escalateConfigUsers(termbaseID, JSON.parse(json), function(){
          callnext(json, false);
        });
      } else {
        callnext(json, false);
      }
    };
  },

  markdown: function(str){
    var tree=markdown.parse(str);
    str=markdown.renderJsonML(markdown.toHTMLTree(tree));
    str=str.replace("<a href=\"http", "<a target=\"_blank\" href=\"http");
    return str;
  },
}

function generateKey(){
  var alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var key="";
  while(key.length<32) {
    var i=Math.floor(Math.random() * alphabet.length);
    key+=alphabet[i]
  }
  return key;
}
