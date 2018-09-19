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
    module.exports.composeSqlQueries(facets, searchtext, modifier, howmany, function(sql1, params1, sql2, params2){
      db.all(sql1, params1, function(err, rows){
        if(err || !rows) rows=[];
        var suggestions=null;
        var primeEntries=null;
        var entries=[];
        for(var i=0; i<rows.length; i++){
          var item={id: rows[i].id, title: rows[i].id, json: rows[i].json};
          if(rows[i].match_quality>0) {
            if(!primeEntries) primeEntries=[];
            primeEntries.push(item);
          } else{
            entries.push(item);
          }
        }
        if(modifier.indexOf(" smart ")>-1 && searchtext!="") suggestions=["jabbewocky", "dord", "gibberish", "coherence", "nonce word", "cypher", "the randomist"];;
        db.get(sql2, params2, function(err, row){
          var total=(!err && row) ? row.total : 0;
          callnext(total, primeEntries, entries, suggestions);
        });
      });
    });
  },
  composeSqlQueries: function(facets, searchtext, modifier, howmany, callnext){
    var modifiers=modifier.split(" ");
    console.log();
    console.log(modifiers);
    var joins=[], where=[]; params={};
    if(searchtext!="") {
      joins.push(`inner join entry_term as et on et.entry_id=e.id`);
      joins.push(`inner join terms as t on t.id=et.term_id`);
      if(modifiers[1]=="start"){
        where.push(`t.wording like $searchtext`);
        params.$searchtext=searchtext+"%";
      }
      else if(modifiers[1]=="substring"){
        where.push(`t.wording like $searchtext`);
        params.$searchtext="%"+searchtext+"%";
      }
      else if(modifiers[1]=="wordstart"){
        joins.push(`inner join words as w on w.term_id=t.id`);
        where.push(`w.word like $searchtext`);
        params.$searchtext=searchtext+"%";
      }
      else if(modifiers[1]=="smart"){
        joins.push(`inner join words as w on w.term_id=t.id`);
        where.push(`w.word=$searchtext`);
        params.$searchtext=searchtext;
      }
      if(modifiers[0]!="*"){
        where.push(`t.lang=$searchlang`);
        params.$searchlang=modifiers[0];
      }
    }

    var params1={}; for(var key in params) params1[key]=params[key]; params1.$howmany=parseInt(howmany);
    var sql1=`select e.id, e.json`;
    if(searchtext!="" && modifiers[1]=="smart"){
      sql1+=`, max(case when t.wording=$searchtext_matchquality then 1 else 0 end)`;
      params1.$searchtext_matchquality=searchtext;
    } else {
      sql1+=`, 0`;
    }
    sql1+=` as match_quality\n`;
    sql1+=`  from entries as e\n`;
    joins.map(s => {sql1+=" "+s+"\n"});
    if(where.length>0){ sql1+=" where "; where.map((s, i) => {if(i>0) sql1+=" and "; sql1+=s+"\n";}); }
    sql1+=` group by e.id\n`;
    sql1+=` order by match_quality desc, e.id\n`;
    sql1+=` limit $howmany`;
    console.log(params1);
    console.log(sql1);
    //sql1=`select * from entries order by id limit $howmany`;
    //var params1={$howmany: howmany};

    var params2=params;
    var sql2=`select count(distinct e.id) as total from entries as e\n`;
    joins.map(s => {sql2+=" "+s+"\n"});
    if(where.length>0){ sql2+=" where "; where.map((s, i) => {if(i>0) sql2+=" and "; sql2+=s+"\n";}); }
    sql2=sql2.trim();
    console.log(params2);
    console.log(sql2);
    //var sql2=`select count(*) as total from entries`;
    //var params2={};

    callnext(sql1, params1, sql2, params2);
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
        callnext(entryID, json, title);
      }
    });
  },
  entrySave: function(db, termbaseID, entryID, json, email, historiography, callnext){
    entryID=parseInt(entryID);
    //first of all, find out what we're supposed to do:
    if(!entryID) go("create"); //this is a new entry
    else db.get("select id, json from entries where id=$id", {$id: entryID}, function(err, row){
      if(!row) go("recreate"); //an entry with that ID does not exist: recreate it with that ID
      else go("change") //the entry has changed: update it
    });
    //now actually do it:
    function go(dowhat){
      var entry=JSON.parse(json);
      module.exports.saveTerms(db, termbaseID, entry, function(changedTerms){
        var sql=""; var params={};
        if(dowhat=="create"){ sql="insert into entries(json) values($json)"; params={$json: JSON.stringify(entry)}; }
        if(dowhat=="recreate"){ sql="insert into entries(id, json) values($id, $json)"; params={$json: JSON.stringify(entry), $id: entryID}; }
        if(dowhat=="change"){ sql="update entries set json=$json where id=$id"; params={$json: JSON.stringify(entry), $id: entryID}; }
        //create or change the term:
        db.run(sql, params, function(err){
          if(!entryID) entryID=this.lastID;
          //save connections between entry and terms:
          var termIDs=[]; entry.desigs.map(desig => { termIDs.push(parseInt(desig.term.id)) });
          module.exports.saveConnections(db, termbaseID, entryID, termIDs, function(){
            //tell history that I have been created or changed:
            var action=(dowhat=="change" ? "update" : "create");
            module.exports.saveHistory(db, termbaseID, entryID, action, email, json, historiography, function(){
              module.exports.propagateTerms(db, termbaseID, entryID, changedTerms, email, historiography, function(){
                callnext(entryID);
              });
            });
          });
        });
      });
    }
  },
  saveTerms: function(db, termbaseID, entry, callnext){
    var terms=[]; entry.desigs.map(desig => { terms.push(desig.term) });
    var changedTerms=[];
    go();
    function go(){
      var term=terms.pop();
      if(term){
        var termID=parseInt(term.id) || 0; var json=JSON.stringify(term);
        db.get("select * from terms where id=$id", {$id: termID}, function(err, row){
          var sql=""; var params={};
          if(termID==0){
            sql="insert into terms(json, lang, wording) values($json, $lang, $wording)";
            params={$json: json, $lang: term.lang, $wording: term.wording};
          } else if(!row){
            sql="insert into terms(id, json, lang, wording) values($id, $json, $lang, $wording)";
            params={$id: termID, $json: json, $lang: term.lang, $wording: term.wording};
          } else if(row["json"]!=json){
            sql="update terms set json=$json, lang=$lang, wording=$wording where id=$id";
            params={$id: termID, $json: json, $lang: term.lang, $wording: term.wording};
            changedTerms.push(term);
          }
          if(sql==""){
            go();
          } else {
            delete term.id;
            db.run(sql, params, function(err){
              term.id=(termID || this.lastID).toString();
              module.exports.saveWords(db, termbaseID, term, function(){
                go();
              });
            });
          }
        });
      } else {
        callnext(changedTerms);
      }
    }
  },
  saveWords: function(db, termbaseID, term, callnext){
    var words=[]; term.wording.split(/[\s\.\,\(\)\[\]\{\}0-9]/).map(w => { if(w) words.push(w); });
    db.run("delete from words where term_id=$termID", {$termID: parseInt(term.id)}, function(err){
      go();
    });
    function go(){
      var word=words.pop();
      if(word){
        db.run("insert into words(term_id, word) values($termID, $word)", {$termID: parseInt(term.id), $word: word}, function(err){
          go();
        });
      } else {
        callnext();
      }
    }
  },
  saveConnections: function(db, termbaseID, entryID, termIDs, callnext){
    //delete all pre-existing connections between this entry and any term:
    var previousTermIDs=[];
    db.all("select term_id from entry_term where entry_id=$entry_id", {$entry_id: entryID}, function(err, rows){
      if(rows) rows.map(row => {previousTermIDs.push(row["term_id"])});
      db.run("delete from entry_term where entry_id=$entry_id", {$entry_id: entryID}, function(err, row){
        go();
      });
    });
    function go(){
      var termID=termIDs.pop();
      if(termID) {
        db.run("insert into entry_term(entry_id, term_id) values($entryID, $termID)", {$entryID: entryID, $termID: termID}, function(err, row){
          go();
        });
      } else {
        //delete orphaned terms:
        var ids=""; previousTermIDs.map(id => {if(ids!="") ids+=","; ids+=id;});
        db.run("delete from terms where id in ("+ids+") and id in (select t.id from terms as t left outer join entry_term as et on et.term_id=t.id where et.entry_id is null)", {}, function(err, row){
          callnext();
        });
      }
    }
  },
  propagateTerms: function(db, termbaseID, originatorEntryID, changedTerms, email, historiography, callnext){
    goTerm();
    function goTerm(){
      var changedTerm=changedTerms.pop();
      if(changedTerm){
        db.all("select e.* from entries as e inner join entry_term as et on et.entry_id=e.id where et.term_id=$changedTermID and e.id<>$originatorEntryID", {$changedTermID: changedTerm.id, $originatorEntryID: originatorEntryID}, function(err, rows){
          goEntry();
          function goEntry(){
            var row=rows.pop();
            if(row){
              var entryID=row["id"];
              var entry=JSON.parse(row["json"]);
              entry.desigs.map(desig => { if(parseInt(desig.term.id)==changedTerm.id) desig.term=changedTerm; });
              var json=JSON.stringify(entry);
              db.run("update entries set json=$json where id=$id", {$id: entryID, $json: json}, function(err){
                module.exports.saveHistory(db, termbaseID, entryID, "update", email, json, historiography, function(){
                  goEntry();
                });
              });
            } else {
              goTerm();
            }
          }
        });
      } else {
        callnext();
      }
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
