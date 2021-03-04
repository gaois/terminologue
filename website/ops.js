const path=require("path");
const fs=require("fs-extra");
const xmldom=require("xmldom"); //https://www.npmjs.com/package/xmldom
const sqlite3=require('sqlite3').verbose(); //https://www.npmjs.com/package/sqlite3
const sha1=require('sha1'); //https://www.npmjs.com/package/sha1
const markdown=require("markdown").markdown; //https://www.npmjs.com/package/markdown
const levenshtein=require('js-levenshtein');
const pp=require('./widgets/pretty-public.js');
const xmlformatter=require("xml-formatter");

module.exports={
  siteconfig: {}, //populated by terminologue.js on startup
  mailtransporter: null,
  propagator: null,

  login: function(email, password, uilang, callnext){
    if(module.exports.siteconfig.readonly){
      callnext(false, "", "");
    } else {
      var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE);
      var hash=sha1(password);
      db.get("select email from users where lower(email)=lower($email) and passwordHash=$hash", {$email: email, $hash: hash}, function(err, row){
        if(err) console.error(err);
        if(!row){
          db.close();
          callnext(false, "", "");
        } else {
          email=row.email;
          var key=generateKey();
          var now=(new Date()).toISOString();
          db.run("update users set sessionKey=$key, sessionLast=$now, uilang=$uilang where email=$email", {$key: key, $now: now, $uilang: uilang, $email: email}, function(err, row){
            if(err) console.error(err);
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
      if(err) console.error(err);
      db.close();
      callnext();
    });
  },
  verifyLogin: function(email, sessionkey, callnext){
    var yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select email, uilang from users where email=$email and sessionKey=$key and sessionLast>=$yesterday", {$email: email, $key: sessionkey, $yesterday: yesterday}, function(err, row){
      if(err) console.error(err);
      if(!row || module.exports.siteconfig.readonly){
        db.close();
        callnext({loggedin: false, email: null});
      } else {
        email=row.email;
        var uilang=row.uilang || module.exports.siteconfig.uilangDefault;
        var now=(new Date()).toISOString();
        db.run("update users set sessionLast=$now where email=$email", {$now: now, $email: email}, function(err, row){
          if(err) console.error(err);
          db.close();
          callnext({loggedin: true, email: email, uilang: uilang, isAdmin: (module.exports.siteconfig.admins.indexOf(email)>-1)});
        });
      }
    });
  },
  getTermbasesByUser: function(email, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE);
    var sql="select tb.id, tb.title from termbases as tb inner join user_termbase as utb on utb.termbase_id=tb.id where trim(utb.user_email)=$email order by tb.title"
    var termbases=[];
    db.all(sql, {$email: email}, function(err, rows){
      if(err) console.error(err);
      if(rows) for(var i=0; i<rows.length; i++) termbases.push({id: rows[i].id, title: rows[i].title});
      db.close();
      callnext(termbases);
    });
  },
  saveUilang: function(email, lang, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE);
    db.run("update users set uilang=$lang where email=$email", {$lang: lang, $email: email}, function(err){
      if(err) console.error(err);
      db.close();
      callnext();
    });
  },
  getRemoteAddress: function(request) {
    // var remoteIp = request.connection.remoteAddress.replace('::ffff:','');
    // if (request.headers['x-forwarded-for'] != undefined) {
      // remoteIp = request.headers['x-forwarded-for'];
    // }
    // if (request.headers['x-real-ip'] != undefined) {
      // remoteIp = request.headers['x-real-ip'];
    // }
    // if (request.headers['x-real-ip'] != undefined) {
      // remoteIp = request.headers['x-real-ip'];
    // }
    // return remoteIp;
	   return "XYZ";
  },
  sendSignupToken: function(email, remoteip, mailSubject, mailText, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select email from users where email=$email", {$email: email}, function(err, row){
      if(err) console.error(err);
      if(row==undefined) {
        var expireDate = (new Date()); expireDate.setHours(expireDate.getHours()+48);
        expireDate = expireDate.toISOString();
        var token = sha1(sha1(Math.random()));
        var tokenurl = module.exports.siteconfig.baseUrl + 'createaccount/' + token;
        // var mailSubject="Terminologue signup";
        // var mailText=`Please follow the link below to create your Terminologue account:`
        mailText+=`\n\n${tokenurl}\n\n`;
        db.run("insert into register_tokens (email, requestAddress, token, expiration) values ($email, $remoteip, $token, $expire)", {$email: email, $expire: expireDate, $remoteip: remoteip, $token: token}, function(err, row){
          module.exports.mailtransporter.sendMail({from: module.exports.siteconfig.mailconfig.from, to: email, subject: mailSubject, text: mailText}, (err, info) => {
            if(err) console.error(err);
          });
          db.close();
          callnext(true);
        });
      } else {
        db.close();
        callnext(false);
      }
    });
  },
  sendToken: function(email, remoteip, mailSubject, mailText, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select email from users where email=$email", {$email: email}, function(err, row){
      if(err) console.error(err);
      if(row) {
        var expireDate = (new Date()); expireDate.setHours(expireDate.getHours()+48);
        expireDate = expireDate.toISOString();
        var token = sha1(sha1(Math.random()));
        var tokenurl = module.exports.siteconfig.baseUrl + 'recoverpwd/' + token;
        // var mailSubject="Terminologue password reset";
        // var mailText=`Please click the link below to reset your Terminologue password:\n\n`
        mailText+=`\n\n${tokenurl}\n\n`;
        db.run("insert into recovery_tokens (email, requestAddress, token, expiration) values ($email, $remoteip, $token, $expire)", {$email: email, $expire: expireDate, $remoteip: remoteip, $token: token}, function(err, row){
          if(err) console.error(err);
          module.exports.mailtransporter.sendMail({from: module.exports.siteconfig.mailconfig.from, to: email, subject: mailSubject, text: mailText}, (err, info) => {
            if(err) console.error(err);
          });
          db.close();
          callnext(true);
        });
      } else {
        db.close();
        callnext(false);
      }
    });
  },
  changePwd: function(email, password, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE);
    var hash=sha1(password);
    db.run("update users set passwordHash=$hash where email=$email", {$hash: hash, $email: email}, function(err, row){
      if(err) console.error(err);
      db.close();
      callnext(true);
    });
  },
  verifyToken: function(token, type, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select * from "+type+"_tokens where token=$token and expiration>=datetime('now') and usedDate is null", {$token: token}, function(err, row){
      if(err) console.error(err);
      db.close();
      if(!row) callnext(false); else callnext(true);
    });
  },
  createAccount: function(token, password, remoteip, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select * from register_tokens where token=$token and expiration>=datetime('now') and usedDate is null", {$token: token}, function(err, row){
      if(err) console.error(err);
      if(row) {
        var email = row.email;
        db.get("select * from users where email=$email", {$email: email}, function(err, row){
          if(err) console.error(err);
          if (row==undefined) {
            var hash = sha1(password);
            db.run("insert into users (email,passwordHash) values ($email,$hash)", {$hash: hash, $email: email}, function(err, row){
              if(err) console.error(err);
              db.run("update register_tokens set usedDate=datetime('now'), usedAddress=$remoteip where token=$token", {$remoteip: remoteip, $token: token}, function(err, row){
                if(err) console.error(err);
                db.close();
                callnext(true);
              });
            });
          } else {
            callnext(false);
          }
        });
      }
    });
  },
  resetPwd: function(token, password, remoteip, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select * from recovery_tokens where token=$token and expiration>=datetime('now') and usedDate is null", {$token: token}, function(err, row){
      if(err) console.error(err);
      if(row) {
        var email = row.email;
        var hash = sha1(password);
        db.run("update users set passwordHash=$hash where email=$email", {$hash: hash, $email: email}, function(err, row){
          if(err) console.error(err);
          db.run("update recovery_tokens set usedDate=datetime('now'), usedAddress=$remoteip where token=$token", {$remoteip: remoteip, $token: token}, function(err, row){
            if(err) console.error(err);
            db.close();
            callnext(true);
          });
        });
      }
    });
  },

  suggestTermbaseID: function(callnext){
    var id;
    do{ id=generateTermbaseID(); } while(prohibitedTermbaseIDs.indexOf(id)>-1 || module.exports.termbaseExists(id));
    callnext(id);
  },
  makeTermbase: function(termbaseID, template, title, blurb, email, callnext){
    if(!title) title="?";
    if(!blurb) blurb="";
    if(prohibitedTermbaseIDs.indexOf(termbaseID)>-1 || module.exports.termbaseExists(termbaseID)){
      callnext(false);
    } else {
      fs.copy("termbaseTemplates/"+template+".sqlite", path.join(module.exports.siteconfig.dataDir, "termbases/"+termbaseID+".sqlite"), function(err){
        if(err) console.error(err);
        var db=module.exports.getDB(termbaseID);
        var users={}; users[email]={level: "5"};
        db.run("update configs set json=$json where id='users'", {$json: JSON.stringify(users, null, "\t")}, function(err){
          if(err) console.error(err);
          var ident={title: {$: title}, blurb: {$: blurb}};
          db.run("update configs set json=$json where id='ident'", {$json: JSON.stringify(ident, null, "\t")}, function(err){
            if(err) console.error(err);
            module.exports.escalateConfigIdent(termbaseID, ident, function(){
              module.exports.escalateConfigUsers(termbaseID, users, function(){
                db.close();
                callnext(true);
              });
            });
          });
        });
      });
    }
  },
  escalateConfigIdent: function(termbaseID, ident, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
    db.run("delete from termbases where id=$termbaseID", {$termbaseID: termbaseID}, function(err){
      if(err) console.error(err);
      db.run("insert into termbases(id, title) values ($termbaseID, $title)", {$termbaseID: termbaseID, $title: JSON.stringify(ident.title)}, function(err){
        if(err) console.error(err);
        db.close();
        callnext();
      });
    });
  },
  escalateConfigUsers: function(termbaseID, users, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
    db.run("delete from user_termbase where termbase_id=$termbaseID", {$termbaseID: termbaseID}, function(err){
      if(err) console.error(err);
      for(var email in users){
        db.run("insert into user_termbase(termbase_id, user_email) values ($termbaseID, $email)", {$termbaseID: termbaseID, $email: email}, function(err){
          if(err) console.error(err);
        });
      }
      db.close();
      callnext();
    });
  },
  destroyTermbase: function(termbaseID, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
    db.run("delete from termbases where id=$termbaseID", {$termbaseID: termbaseID}, function(err){
      if(err) console.error(err);
      db.run("delete from user_termbase where termbase_id=$termbaseID", {$termbaseID: termbaseID}, function(err){
        if(err) console.error(err);
        db.close(function(){
          fs.remove(path.join(module.exports.siteconfig.dataDir, "termbases/"+termbaseID+".sqlite"), function(){
            callnext();
          });
        });
      });
    });
  },
  renameTermbase: function(oldTermbaseID, newTermbaseID, callnext){
    if(prohibitedTermbaseIDs.indexOf(newTermbaseID)>-1 || module.exports.termbaseExists(newTermbaseID)){
      callnext(false);
    } else {
      fs.move(path.join(module.exports.siteconfig.dataDir, "termbases/"+oldTermbaseID+".sqlite"), path.join(module.exports.siteconfig.dataDir, "termbases/"+newTermbaseID+".sqlite"), function(err){
        var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
        db.run("delete from termbases where id=$termbaseID", {$termbaseID: oldTermbaseID}, function(err){
          if(err) console.error(err);
          db.close();
          var termbaseDB=module.exports.getDB(newTermbaseID);
          module.exports.readTermbaseConfigs(termbaseDB, newTermbaseID, function(configs){
            module.exports.escalateConfigIdent(newTermbaseID, configs.ident, function(){
              module.exports.escalateConfigUsers(newTermbaseID, configs.users, function(){
                termbaseDB.close();
                callnext(true);
              });
            });
          });
        });
      });
    }
  },
  purgeTermbase: function(termbaseID, callnext){
    var db=module.exports.getDB(termbaseID);
    var sql=`delete from comments;
    delete from entries;
    delete from entry_collection;
    delete from entry_def;
    delete from entry_domain;
    delete from entry_extranet;
    delete from entry_intro;
    delete from entry_note;
    delete from entry_sortkey;
    delete from entry_xmpl;
    delete from entry_xref;
    delete from entry_term;
    delete from history;
    delete from spelling;
    delete from terms;
    delete from words`;
    db.exec(sql, function(err){
      if(err) console.log(err);
      callnext();
    });
  },

  termbaseExists: function(termbaseID){
    return fs.existsSync(path.join(module.exports.siteconfig.dataDir, "termbases/"+termbaseID+".sqlite"));
  },
  getDB: function(termbaseID, readonly){
    var mode=(readonly ? sqlite3.OPEN_READONLY : sqlite3.OPEN_READWRITE);
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "termbases/"+termbaseID+".sqlite"), mode, function(err){
      if(err) console.error(err);
    });
    if(!readonly) db.run('PRAGMA journal_mode=WAL');
    db.run('PRAGMA foreign_keys=on');
    return db;
  },
  verifyLoginAndTermbaseAccess: function(email, sessionkey, termbaseDB, termbaseID, callnext){
    var yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select email, uilang from users where email=$email and sessionKey=$key and sessionLast>=$yesterday", {$email: email, $key: sessionkey, $yesterday: yesterday}, function(err, row){
      if(err) console.error(err);
      if(!row || module.exports.siteconfig.readonly){
        db.close();
        callnext({loggedin: false, email: null});
      } else {
        email=row.email;
        var uilang=row.uilang || module.exports.siteconfig.uilangDefault;
        var now=(new Date()).toISOString();
        db.run("update users set sessionLast=$now where email=$email", {$now: now, $email: email}, function(err, row){
          if(err) console.error(err);
          db.close();
          module.exports.readTermbaseConfigs(termbaseDB, termbaseID, function(configs){
            if(!configs.users[email] && module.exports.siteconfig.admins.indexOf(email)==-1){
              callnext({loggedin: true, email: email, uilang: uilang, termbaseAccess: false, isAdmin: false, level: 0});
            } else {
              var isAdmin=(module.exports.siteconfig.admins.indexOf(email)>-1);
              var level=0; if(configs.users[email]) level=configs.users[email].level; if(isAdmin) level=5;
              callnext({loggedin: true, email: email, uilang: uilang, termbaseAccess: true, isAdmin: isAdmin, level: level});
            }
          });
        });
      }
    });
  },
  verifyLoginAndXnetAccess: function(email, sessionkey, termbaseDB, termbaseID, xnetID, callnext){
    var yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select email, uilang from users where email=$email and sessionKey=$key and sessionLast>=$yesterday", {$email: email, $key: sessionkey, $yesterday: yesterday}, function(err, row){
      if(err) console.error(err);
      if(!row || module.exports.siteconfig.readonly){
        db.close();
        callnext({loggedin: false, email: null});
      } else {
        email=row.email;
        var uilang=row.uilang || module.exports.siteconfig.uilangDefault;
        var now=(new Date()).toISOString();
        db.run("update users set sessionLast=$now where email=$email", {$now: now, $email: email}, function(err, row){
          if(err) console.error(err);
          var isAdmin=(module.exports.siteconfig.admins.indexOf(email)>-1);
          module.exports.readExtranet(termbaseDB, termbaseID, xnetID, function(xnet){
            db.close();
            var xnetAccess=(xnet.users.indexOf(email)>-1);
            callnext({loggedin: true, email: email, uilang: uilang, termbaseAccess: true, xnetAccess: xnetAccess, isAdmin: isAdmin}, xnet);
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
        if(err) console.error(err);
        if(!err) for(var i=0; i<rows.length; i++) configs[rows[i].id]=JSON.parse(rows[i].json);
        if(configs.users) for(var key in configs.users){
          if(key!=key.trim()){
            configs.users[key.trim()]=configs.users[key];
            delete configs.users[key];
          }
        }
        if(configs.xnet && configs.xnet.users) for(var key in configs.xnet.users){
          if(key!=key.trim()){
            configs.xnet.users[key.trim()]=configs.xnet.users[key];
            delete configs.xnet.users[key];
          }
        }
        db.termbaseConfigs=configs;
        callnext(configs);
      });
    }
  },
  readTermbaseStats: function(db, termbaseID, callnext){
    var stats={};
    db.get("select count(*) as [count] from entries", {}, function(err, row){
      if(err) console.error(err);
      if(!err) stats.entryCount=row.count;
      db.get("select count(*) as [count] from history", {}, function(err, row){
        if(err) console.error(err);
        if(!err) stats.historyCount=row.count;
        var size=fs.statSync(path.join(module.exports.siteconfig.dataDir, "termbases/"+termbaseID+".sqlite")).size;
        stats.fileSize={value: size, unit: "B"};
        if(stats.fileSize.value>1000) stats.fileSize={value: stats.fileSize.value/1000, unit: "kB"};
        if(stats.fileSize.value>1000) stats.fileSize={value: stats.fileSize.value/1000, unit: "MB"};
        if(stats.fileSize.value>1000) stats.fileSize={value: stats.fileSize.value/1000, unit: "GB"};
        callnext(stats);
      });
    });
  },
  readTermbaseMetadata: function(db, termbaseID, callnext){
    var metadata={
      domain: [],
      posLabel: [],
      inflectLabel: [],
      acceptLabel: [],
      source: [],
      collection: [],
      tag: [],
      extranet: [],
    };
    db.all(`select m.id, m.type, m.json, m.sortkey,
    (case when exists(select * from metadata as x where x.id=m.parent_id) then m.parent_id else null end) as parent_id
    from metadata as m order by m.sortkey`, {}, function(err, rows){
      if(err) console.error(err);
      if(!err) for(var i=0; i<rows.length; i++) {
        var type=rows[i].type;
        if(!metadata[type]) metadata[type]=[];
        var json=JSON.parse(rows[i].json);
        json.id=rows[i].id;
        json.parentID=rows[i].parent_id;
        metadata[type].push(json);
      }
      callnext(metadata);
    });
  },
  readExtranetsByUser: function(db, termbaseID, email, callnext){
    db.all("select * from metadata where type='extranet'", {}, function(err, rows){
      if(err) console.error(err);
      var ret=[];
      if(!err) for(var i=0; i<rows.length; i++) {
        var json=JSON.parse(rows[i].json);
        if(json.users.indexOf(email)>-1){
          json.id=rows[i].id;
          ret.push(json);
        }
      }
      callnext(ret);
    });
  },
  readExtranet: function(db, termbaseID, extranetID, callnext){
    db.get("select * from metadata where type='extranet' and id=$id", {$id: extranetID}, function(err, row){
      if(err) console.error(err);
      var json=null;
      if(row) {
        json=JSON.parse(row.json);
        json.id=row.id;
      }
      callnext(json);
    });
  },

  wordSplit: function(wording, langOrNull){
    var words=[]; wording.split(/[\s\.\,\(\)\[\]\{\}\'\-0-9]/).map(w => { if(w) words.push(w); });
    return words;
  },

  entryListById: function(db, termbaseID, ids, callnext){
    var sql=`select *, (select count(*) from comments as c where c.entry_id=e.id) as commentCount from entries as e where e.id in(${ids})`;
    db.all(sql, {}, function(err, rows){
      if(err) console.error(err);
      if(err || !rows) rows=[];
      var entries=[];
      for(var i=0; i<rows.length; i++){
        var item={id: rows[i].id, title: rows[i].id, json: rows[i].json, commentCount: rows[i].commentCount};
        entries.push(item);
      }
      callnext(entries);
    });
  },
  entryList: function(db, termbaseID, facets, searchtext, modifier, page, pageSize, callnext){
    page=parseInt(page);
    var howmany=page*pageSize;
    var startAt=(page-1)*pageSize;
    module.exports.composeSqlQueries(db, facets, searchtext, modifier, howmany, function(sql1, params1, sql2, params2){
      db.all(sql1, params1, function(err, rows){
        if(err) console.log(err);
        if(err || !rows) rows=[];
        var suggestions=null;
        var want=(searchtext!="" && modifier.split(" ")[1]=="smart");
        module.exports.getSpellsuggs(db, termbaseID, want, searchtext, function(suggs){
          suggestions=suggs;

          var primeEntries=null;
          var entries=[];
          for(var i=0; i<rows.length; i++){
            if(i>=startAt){
              var item={id: rows[i].id, title: rows[i].id, json: rows[i].json, commentCount: rows[i].commentCount};
              if(rows[i].match_quality>0) {
                if(!primeEntries) primeEntries=[];
                primeEntries.push(item);
              } else{
                entries.push(item);
              }
            }
          }
          db.get(sql2, params2, function(err, row){
            if(err) console.error(err);
            var total=(!err && row) ? row.total : 0;
            var pages=Math.floor(total/pageSize); if(total%pageSize > 0) pages++;
            callnext(total, pages, page, pageSize, primeEntries, entries, suggestions);
          });
        });
      });
    });
  },
  getSubdomainIDs: function(db, domainID, callnext){
    var ret=[];
    var subdomainIDs=[];
    db.all("select * from metadata where type='domain' and parent_id=$parentID", {$parentID: domainID}, function(err, rows){
      if(err) console.log(err);
      rows.map(row => subdomainIDs.push(row.id));
      go();
    });
    function go(){
      var subdomainID=subdomainIDs.pop();
      if(subdomainID){
        ret.push(subdomainID);
        module.exports.getSubdomainIDs(db, subdomainID, function(subsubdomainIDs){
          ret=ret.concat(subsubdomainIDs);
          go();
        });
      } else {
        callnext(ret);
      }
    }
  },
  composeSqlQueries: function(db, facets, searchtext, modifier, howmany, callnext){
    var domainIDs=[facets.domain];
    if(facets.domain && facets.domain!="*" && facets.domain!="-1" && facets.domainDrilldown && facets.domainDrilldown=="incl"){
      module.exports.getSubdomainIDs(db, facets.domain, function(subdomainIDs){
        subdomainIDs.unshift(facets.domain);
        domainIDs=subdomainIDs;
        go();
      });
    } else {
      go();
    }
    function go(){
      var modifiers=modifier.split(" ");
      var joins=[], where=[]; params={};
      if(searchtext!="") {
        joins.push(`inner join entry_term as et on et.entry_id=e.id`);
        joins.push(`inner join terms as t on t.id=et.term_id`);
        if(searchtext!="" && modifiers[1]=="complete"){
          where.push(`t.wording like $searchtext`);
          params.$searchtext=searchtext;
        }
        else if(searchtext!="" && modifiers[1]=="start"){
          where.push(`t.wording like $searchtext`);
          params.$searchtext=searchtext+"%";
        }
        else if(searchtext!="" && modifiers[1]=="end"){
          where.push(`t.wording like $searchtext`);
          params.$searchtext="%"+searchtext;
        }
        else if(searchtext!="" && modifiers[1]=="part"){
          where.push(`t.wording like $searchtext`);
          params.$searchtext="%"+searchtext+"%";
        }
        else if(searchtext!="" && modifiers[1]=="midpart"){
          where.push(`t.wording like $searchtext`);
          params.$searchtext="_%"+searchtext+"%_";
        }
        // else if(searchtext!="" && modifiers[1]=="wordstart"){
        //   joins.push(`inner join words as w on w.term_id=t.id`);
        //   where.push(`(w.word like $searchtext and w.implicit=0)`);
        //   params.$searchtext=searchtext+"%";
        // }
        else if(searchtext!="" && modifiers[1]=="smart"){
          var words=module.exports.wordSplit(searchtext);
          words.map((word, index) => {
            joins.push(`inner join words as w${index} on w${index}.term_id=t.id`);
            where.push(`w${index}.word=$word${index}`);
            params[`$word${index}`]=word;
          });
        }

        if(searchtext!="" && modifiers[0]!="*"){
          where.push(`t.lang=$searchlang`);
          params.$searchlang=modifiers[0];
        }
      }

      if(facets.cStatus){
        where.push(`e.cStatus=$fCStatus`);
        params[`$fCStatus`]=parseInt(facets.cStatus);
      }
      if(facets.pStatus){
        where.push(`e.pStatus=$fPStatus`);
        params[`$fPStatus`]=parseInt(facets.pStatus);
      }
      if(facets.dStatus){
        where.push(`e.dStatus=$fDStatus`);
        params[`$fDStatus`]=parseInt(facets.dStatus);
      }

      if(facets.domain && facets.domain=="-1"){
        joins.push(`left outer join entry_domain as fDomain on fDomain.entry_id=e.id`);
        where.push(`fDomain.domain is null`);
      }
      else if(facets.domain){
        joins.push(`inner join entry_domain as fDomain on fDomain.entry_id=e.id`);
        if(facets.domain=="*"){
          where.push(`fDomain.domain>0`);
        }
        else {
          where.push(`fDomain.domain in (${domainIDs.join(",")})`);
          if(facets.domainScope && facets.domainScope=="unique"){
            joins.push(`left outer join entry_domain as fOtherDomain on fOtherDomain.entry_id=e.id and fOtherDomain.domain not in (${domainIDs.join(",")})`);
            where.push(`fOtherDomain.domain is null`);
          } else if(facets.domainScope && facets.domainScope=="notunique"){
            joins.push(`inner join entry_domain as fOtherDomain on fOtherDomain.entry_id=e.id and fOtherDomain.domain not in (${domainIDs.join(",")})`);
          }
        }
      }

      if(facets.termLang || facets.accept || facets.clarif){
        joins.push(`inner join entry_term as f_et on f_et.entry_id=e.id`);
        if(facets.termLang) {
          joins.push(`inner join terms as f_t on f_t.id=f_et.term_id`);
          where.push(`f_t.lang=$fTermLang`);
          params[`$fTermLang`]=facets.termLang;
        }
        if(facets.accept){
          if(facets.accept=="*") where.push(`f_et.accept>0`)
          else if(facets.accept=="-1") where.push(`f_et.accept=0`)
          else {where.push(`f_et.accept=$fAccept`); params[`$fAccept`]=parseInt(facets.accept);}
        }
        if(facets.clarif){
          if(facets.clarif=="*") where.push(`f_et.clarif<>''`)
          else if(facets.clarif=="-1") where.push(`(f_et.clarif='' or f_et.clarif is null)`)
          else if(facets.clarif=="txt") {
            where.push(`(f_et.clarif<>'' and f_et.clarif like $fClarif)`);
            params[`$fClarif`]="%"+facets.clarifValue+"%";
          }
        }
      }

      if(facets.intro){
        joins.push(`inner join entry_intro as f_ei on f_ei.entry_id=e.id`);
        if(facets.intro=="*") where.push(`f_ei.text<>''`)
        else if(facets.intro=="-1") where.push(`(f_ei.text='' or f_ei.text is null)`)
        else if(facets.intro=="txt") {
          where.push(`(f_ei.text<>'' and f_ei.text like $fIntro)`);
          params[`$fIntro`]="%"+facets.introValue+"%";
        }
      }

      if(facets.def && facets.def=="-1"){
        joins.push(`left outer join entry_def as fDef on fDef.entry_id=e.id`);
        where.push(`fDef.text is null`);
      }
      else if(facets.def){
        joins.push(`inner join entry_def as fDef on fDef.entry_id=e.id`);
        if(facets.def=="*") where.push(`fDef.text<>''`);
        else { where.push(`fDef.text like $fDef`); params[`$fDef`]="%"+facets.defValue+"%"; }
      }

      if(facets.xmpl && facets.xmpl=="-1"){
        joins.push(`left outer join entry_xmpl as fXmpl on fXmpl.entry_id=e.id`);
        where.push(`fXmpl.text is null`);
      }
      else if(facets.xmpl){
        joins.push(`inner join entry_xmpl as fXmpl on fXmpl.entry_id=e.id`);
        if(facets.xmpl=="*") where.push(`fXmpl.text<>''`);
        else { where.push(`fXmpl.text like $fXmpl`); params[`$fXmpl`]="%"+facets.xmplValue+"%"; }
      }

      if(facets.collection && facets.collection=="-1"){
        joins.push(`left outer join entry_collection as fCollection on fCollection.entry_id=e.id`);
        where.push(`fCollection.collection is null`);
      }
      else if(facets.collection){
        joins.push(`inner join entry_collection as fCollection on fCollection.entry_id=e.id`);
        if(facets.collection=="*") where.push(`fCollection.collection>0`);
        else { where.push(`fCollection.collection=$fCollection`); params[`$fCollection`]=parseInt(facets.collection); }
      }

      if(facets.extranet && facets.extranet=="-1"){
        joins.push(`left outer join entry_extranet as fExtranet on fExtranet.entry_id=e.id`);
        where.push(`fExtranet.extranet is null`);
      }
      else if(facets.extranet){
        joins.push(`inner join entry_extranet as fExtranet on fExtranet.entry_id=e.id`);
        if(facets.extranet=="*") where.push(`fExtranet.extranet>0`);
        else { where.push(`fExtranet.extranet=$fExtranet`); params[`$fExtranet`]=parseInt(facets.extranet); }
      }

      if(facets.extranet){
        if(facets.hasComments=="1"){
          joins.push(`inner join comments as fComments on fComments.entry_id=e.id and fComments.extranet_id=$fExtranet`);
          params[`$fExtranet`]=parseInt(facets.extranet);
        }
        if(facets.hasComments=="0"){
          joins.push(`left outer join comments as fComments on fComments.entry_id=e.id and fComments.extranet_id=$fExtranet`);
          params[`$fExtranet`]=parseInt(facets.extranet);
          where.push(`fComments.id is null`);
        }
      } else {
        if(facets.hasComments=="1" || facets.hasComments=="txt"){
          joins.push(`inner join comments as fComments on fComments.entry_id=e.id`);
          if(facets.hasComments=="txt"){
            where.push(`(fComments.body<>'' and fComments.body like $fCommentText)`);
            params[`$fCommentText`]="%"+facets.commentText+"%";
          }
        }
        if(facets.hasComments=="0"){
          joins.push(`left outer join comments as fComments on fComments.entry_id=e.id`);
          where.push(`fComments.id is null`);
        }
      }

      if(facets.me=="1" && facets.extranet && facets.email){
        joins.push(`inner join comments as fCommentsMe on fCommentsMe.entry_id=e.id and fCommentsMe.email=$fEmail and fCommentsMe.extranet_id=$fExtranet`);
        params[`$fEmail`]=facets.email;
        params[`$fExtranet`]=parseInt(facets.extranet);
      }
      if(facets.me=="0" && facets.extranet && facets.email){
        joins.push(`left outer join comments as fCommentsMe on fCommentsMe.entry_id=e.id and fCommentsMe.email=$fEmail and fCommentsMe.extranet_id=$fExtranet`);
        params[`$fEmail`]=facets.email;
        params[`$fExtranet`]=parseInt(facets.extranet);
        where.push(`fCommentsMe.id is null`);
      }

      if(facets.oth=="1" && facets.extranet && facets.email){
        joins.push(`inner join comments as fCommentsMe on fCommentsMe.entry_id=e.id and fCommentsMe.email<>$fEmail and fCommentsMe.extranet_id=$fExtranet`);
        params[`$fEmail`]=facets.email;
        params[`$fExtranet`]=parseInt(facets.extranet);
      }
      if(facets.oth=="0" && facets.extranet && facets.email){
        joins.push(`left outer join comments as fCommentsMe on fCommentsMe.entry_id=e.id and fCommentsMe.email<>$fEmail and fCommentsMe.extranet_id=$fExtranet`);
        params[`$fEmail`]=facets.email;
        params[`$fExtranet`]=parseInt(facets.extranet);
        where.push(`fCommentsMe.id is null`);
      }

      if(facets.note=="0"){
        joins.push(`left outer join entry_note as fEntryNote on fEntryNote.entry_id=e.id`);
        where.push(`fEntryNote.text is null`);
      } else if(facets.note=="1" || facets.note=="txt"){
        joins.push(`inner join entry_note as fEntryNote on fEntryNote.entry_id=e.id`);
        if(facets.noteType){
          where.push(`fEntryNote.type=$fNoteType`);
          params[`$fNoteType`]=parseInt(facets.noteType);
        }
        if(facets.note=="txt"){
          where.push(`(fEntryNote.text<>'' and fEntryNote.text like $fNoteText)`);
          params[`$fNoteText`]="%"+facets.noteText+"%";
        }
      }

      var params1={}; for(var key in params) params1[key]=params[key];
      var sql1=`select e.id, e.json, (select count(*) from comments as c where c.entry_id=e.id) as commentCount`;
      if(searchtext!=""){
        sql1+=`, max(case when t.wording=$searchtext_matchquality then 1 else 0 end)`;
        params1.$searchtext_matchquality=searchtext;
      } else {
        sql1+=", 0";
      }
      sql1+=` as match_quality\n`;
      sql1+=` from entries as e\n`;
      joins.map(s => {sql1+=" "+s+"\n"});
      if(modifiers[2]){
        sql1+=` left outer join entry_sortkey as sk on sk.entry_id=e.id and sk.lang=$sortlang\n`;
        params1.$sortlang=modifiers[2];
      } else {
        sql1+=` left outer join entry_sortkey as sk on sk.entry_id=e.id and sk.lang=$sortlang\n`;
      }
      if(where.length>0){ sql1+=" where "; where.map((s, i) => {if(i>0) sql1+=" and "; sql1+=s+"\n";}); }
      sql1+=` group by e.id\n`;
      sql1+=` order by match_quality desc, sk.key\n`;
      if(howmany){
        sql1+=` limit $howmany`;
        params1.$howmany=parseInt(howmany);
      }
      //sql1=`select * from entries order by id limit $howmany`;
      //var params1={$howmany: howmany};

      var params2=params;
      var sql2=`select count(distinct e.id) as total from entries as e\n`;
      joins.map(s => {sql2+=" "+s+"\n"});
      if(where.length>0){ sql2+=" where "; where.map((s, i) => {if(i>0) sql2+=" and "; sql2+=s+"\n";}); }
      sql2=sql2.trim();
      //var sql2=`select count(*) as total from entries`;
      //var params2={};

      // console.log("---");
      // console.log(params1);
      // console.log(sql1);
      // console.log("---");
      // console.log(params2);
      // console.log(sql2);

      callnext(sql1, params1, sql2, params2);
    }
  },
  cStatus: function(db, termbaseID, facets, searchtext, modifier, val, callnext){
    var items=[];
    module.exports.composeSqlQueries(db, facets, searchtext, modifier, null, function(sql1, params1, sql2, params2){
      db.all(sql1, params1, function(err, rows){
        if(err) console.error(err);
        if(err || !rows) rows=[];
        for(var i=0; i<rows.length; i++){
          var item={id: rows[i].id, json: rows[i].json};
          items.push(item);
        }
        db.run("BEGIN TRANSACTION");
        go();
      });
    });
    function go(){
      if(items.length>0){
        var item=items.pop();
        var entry=JSON.parse(item.json);
        if(entry.cStatus==val){
          go();
        } else {
          entry.cStatus=val;
          db.run("update entries set cStatus=$val, json=$json where id=$id", {$val: val, $json: JSON.stringify(entry), $id: item.id}, function(err){
            module.exports.propagator.saveEntry(termbaseID, item.id, entry, function(err){
              if(err) console.error(err);
            });
            go();
          });
        }
      } else {
        db.run("COMMIT");
        callnext();
      }
    }
  },
  pStatus: function(db, termbaseID, facets, searchtext, modifier, val, callnext){
    var items=[];
    module.exports.composeSqlQueries(db, facets, searchtext, modifier, null, function(sql1, params1, sql2, params2){
      db.all(sql1, params1, function(err, rows){
        if(err) console.error(err);
        if(err || !rows) rows=[];
        for(var i=0; i<rows.length; i++){
          var item={id: rows[i].id, json: rows[i].json};
          items.push(item);
        }
        db.run("BEGIN TRANSACTION");
        go();
      });
    });
    function go(){
      if(items.length>0){
        var item=items.pop();
        var entry=JSON.parse(item.json);
        if(entry.pStatus==val){
          go();
        } else {
          entry.pStatus=val;
          db.run("update entries set pStatus=$val, json=$json where id=$id", {$val: val, $json: JSON.stringify(entry), $id: item.id}, function(err){
            module.exports.propagator.saveEntry(termbaseID, item.id, entry, function(err){
              if(err) console.error(err);
            });
            go();
          });
        }
      } else {
        db.run("COMMIT");
        callnext();
      }
    }
  },
  extranetAdd: function(db, termbaseID, facets, searchtext, modifier, extranetID, callnext){
    var items=[];
    module.exports.composeSqlQueries(db, facets, searchtext, modifier, null, function(sql1, params1, sql2, params2){
      db.all(sql1, params1, function(err, rows){
        if(err) console.error(err);
        if(err || !rows) rows=[];
        for(var i=0; i<rows.length; i++){
          var item={id: rows[i].id, json: rows[i].json};
          items.push(item);
        }
        db.run("BEGIN TRANSACTION");
        go();
      });
    });
    function go(){
      if(items.length>0){
        var item=items.pop();
        var entry=JSON.parse(item.json);
        if(entry.extranets.indexOf(extranetID)>-1){
          go();
        } else {
          entry.extranets.push(extranetID);
          db.run("update entries set json=$json where id=$id", {$json: JSON.stringify(entry), $id: item.id}, function(err){
            if(err) console.error(err);
            db.run("insert into entry_extranet(entry_id, extranet) values($entry_id, $extranet)", {$entry_id: item.id, $extranet: extranetID}, function(err){
              if(err) console.error(err);
              go();
            });
          });
        }
      } else {
        db.run("COMMIT");
        callnext();
      }
    }
  },
  extranetRemove: function(db, termbaseID, facets, searchtext, modifier, extranetID, callnext){
    var items=[];
    module.exports.composeSqlQueries(db, facets, searchtext, modifier, null, function(sql1, params1, sql2, params2){
      db.all(sql1, params1, function(err, rows){
        if(err) console.error(err);
        if(err || !rows) rows=[];
        for(var i=0; i<rows.length; i++){
          var item={id: rows[i].id, json: rows[i].json};
          items.push(item);
        }
        db.run("BEGIN TRANSACTION");
        go();
      });
    });
    function go(){
      if(items.length>0){
        var item=items.pop();
        var entry=JSON.parse(item.json);
        if(entry.extranets.indexOf(extranetID)==-1){
          go();
        } else {
          entry.extranets.splice(entry.extranets.indexOf(extranetID), 1);
          db.run("update entries set json=$json where id=$id", {$json: JSON.stringify(entry), $id: item.id}, function(err){
            if(err) console.error(err);
            db.run("delete from entry_extranet where entry_id=$entry_id and extranet=$extranet", {$entry_id: item.id, $extranet: extranetID}, function(err){
              if(err) console.error(err);
              go();
            });
          });
        }
      } else {
        db.run("COMMIT");
        callnext();
      }
    }
  },

  entryDelete: function(db, termbaseID, entryID, email, historiography, callnext){
    db.run("delete from entries where id=$id", {$id: entryID}, function(err){
      if(err) console.error(err);
      module.exports.propagator.deleteEntry(termbaseID, entryID, function(err){
        if(err) console.error(err);
      });
      //delete connections from this entry to any terms, and delete any thereby orphaned terms:
      module.exports.saveConnections(db, termbaseID, entryID, null, function(){
        //tell history that have been deleted:
        module.exports.saveHistory(db, termbaseID, entryID, "delete", email, null, historiography, function(){
          callnext();
        });
      });
    });
  },
  entryHistory: function(db, termbaseID, entryID, callnext){
    db.all("select * from history where entry_id=$entryID order by [when] desc", {$entryID: entryID}, function(err, rows){
      if(err) console.error(err);
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
      if(err) console.error(err);
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
      if(err) console.error(err);
      if(!row) go("recreate"); //an entry with that ID does not exist: recreate it with that ID
      else go("change") //the entry has changed: update it
    });
    //now actually do it:
    function go(dowhat){
      var entry=JSON.parse(json);
      module.exports.cleanUpXrefs(db, termbaseID, entryID, entry, function(entry){
        module.exports.saveTerms(db, termbaseID, entry, function(changedTerms){
          var sql=""; var params={};
          if(dowhat=="create"){
            sql="insert into entries(json, cStatus, pStatus, dStatus, dateStamp, tod) values($json, $cStatus, $pStatus, $dStatus, $dateStamp, $tod)";
            params={$json: JSON.stringify(entry), $cStatus: parseInt(entry.cStatus), $pStatus: parseInt(entry.pStatus), $dStatus: parseInt(entry.dStatus), $dateStamp: entry.dateStamp, $tod: entry.tod};
          }
          if(dowhat=="recreate"){
            sql="insert into entries(id, json, cStatus, pStatus, dStatus, dateStamp, tod) values($id, $json, $cStatus, $pStatus, $dStatus, $dateStamp, $tod)";
            params={$json: JSON.stringify(entry), $id: entryID, $cStatus: parseInt(entry.cStatus), $pStatus: parseInt(entry.pStatus), $dStatus: parseInt(entry.dStatus), $dateStamp: entry.dateStamp, $tod: entry.tod};
          }
          if(dowhat=="change"){
            sql="update entries set json=$json, cStatus=$cStatus, pStatus=$pStatus, dStatus=$dStatus, dateStamp=$dateStamp, tod=$tod where id=$id";
            params={$json: JSON.stringify(entry), $id: entryID, $cStatus: parseInt(entry.cStatus), $pStatus: parseInt(entry.pStatus), $dStatus: parseInt(entry.dStatus), $dateStamp: entry.dateStamp, $tod: entry.tod};
          }
          //create or change me:
          db.run(sql, params, function(err){
            if(err) console.error(err);
            if(!entryID) entryID=this.lastID;
            module.exports.propagator.saveEntry(termbaseID, entryID, entry, function(err){
              if(err) console.error(err);
            });
            module.exports.saveEntrySortings(db, termbaseID, entryID, entry, function(){
              //save connections between me and my terms, delete any terms orphaned by this:
              module.exports.saveConnections(db, termbaseID, entryID, entry, function(){
                //tell history that I have been created or changed:
                module.exports.saveHistory(db, termbaseID, entryID, (dowhat=="change"?"update":"create"), email, JSON.stringify(entry), historiography, function(){
                  //propagate changes in my terms to other entries that share the terms:
                  module.exports.propagateTerms(db, termbaseID, entryID, changedTerms, email, historiography, function(){
                    //index my domains:
                    module.exports.saveDomains(db, termbaseID, entryID, entry, function(){
                      //index my collections:
                      module.exports.saveCollections(db, termbaseID, entryID, entry, function(){
                        //index my extranets:
                        module.exports.saveExtranets(db, termbaseID, entryID, entry, function(){
                          //index my intros:
                          module.exports.saveIntros(db, termbaseID, entryID, entry, function(){
                            //index my definitions:
                            module.exports.saveDefinitions(db, termbaseID, entryID, entry, function(){
                              //index my examples:
                              module.exports.saveExamples(db, termbaseID, entryID, entry, function(){
                                //index my xrefs:
                                module.exports.saveXrefs(db, termbaseID, entryID, entry, function(){
                                  //index my notes:
                                  module.exports.saveNotes(db, termbaseID, entryID, entry, function(){
                                    callnext(entryID);
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
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
          if(err) console.error(err);
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
              if(err) console.error(err);
              term.id=(termID || this.lastID).toString();
              module.exports.saveWords(db, termbaseID, term, function(){
                module.exports.saveSpelling(db, termbaseID, term, function(){
                  go();
                });
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
    var words=module.exports.wordSplit(term.wording, term.lang);
    db.run("delete from words where term_id=$termID", {$termID: parseInt(term.id)}, function(err){
      if(err) console.error(err);
      go();
    });
    function go(){
      var word=words.pop();
      if(word){
        db.run("insert into words(term_id, word, implicit) values($termID, $word, 0)", {$termID: parseInt(term.id), $word: word}, function(err){
          if(err) console.error(err);
          module.exports.saveLemmas(db, termbaseID, parseInt(term.id), term.lang, word, function(){
            go();
          });
        });
      } else {
        callnext();
      }
    }
  },
  saveConnections: function(db, termbaseID, entryID, entryOrNull, callnext){
    var termAssigs=[]; if(entryOrNull){
      entryOrNull.desigs.map(desig => {
        termAssigs.push({
          termID: parseInt(desig.term.id),
          accept: parseInt(desig.accept)||0,
          clarif: desig.clarif||"",
        });
      });
    }
    //delete all pre-existing connections between this entry and any term:
    var previousTermIDs=[];
    db.all("select term_id from entry_term where entry_id=$entry_id", {$entry_id: entryID}, function(err, rows){
      if(err) console.error(err);
      if(rows) rows.map(row => {previousTermIDs.push(row["term_id"])});
      db.run("delete from entry_term where entry_id=$entry_id", {$entry_id: entryID}, function(err, row){
        if(err) console.error(err);
        go();
      });
    });
    function go(){
      var termAssig=termAssigs.pop();
      if(termAssig) {
        db.run("insert into entry_term(entry_id, term_id, accept, clarif) values($entryID, $termID, $accept, $clarif)", {$entryID: entryID, $termID: termAssig.termID, $accept: termAssig.accept, $clarif: termAssig.clarif}, function(err, row){
          if(err) console.error(err);
          go();
        });
      } else {
        //delete orphaned terms:
        var ids=""; previousTermIDs.map(id => {if(ids!="") ids+=","; ids+=id;});
        db.run("delete from terms where id in ("+ids+") and id in (select t.id from terms as t left outer join entry_term as et on et.term_id=t.id where et.entry_id is null)", {}, function(err, row){
          if(err) console.error(err);
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
          if(err) console.error(err);
          goEntry();
          function goEntry(){
            var row=rows.pop();
            if(row){
              var entryID=row["id"];
              var entry=JSON.parse(row["json"]);
              entry.desigs.map(desig => { if(parseInt(desig.term.id)==changedTerm.id) desig.term=changedTerm; });
              var json=JSON.stringify(entry);
              if(row["json"]==json){
                goEntry();
              } else {
                db.run("update entries set json=$json where id=$id", {$id: entryID, $json: json}, function(err){
                  if(err) console.error(err);
                  module.exports.propagator.saveEntry(termbaseID, entryID, entry, function(err){
                    if(err) console.error(err);
                  });
                  module.exports.saveEntrySortings(db, termbaseID, entryID, entry, function(){
                    module.exports.saveHistory(db, termbaseID, entryID, "update", email, json, historiography, function(){
                      goEntry();
                    });
                  });
                });
              }
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
  saveEntrySortings: function(db, termbaseID, entryID, entry, callnext){
    var sortkeys=[];
    module.exports.readTermbaseConfigs(db, termbaseID, function(termbaseConfigs){
      termbaseConfigs.lingo.languages.map(lang => { if(lang.role=="major"){
        var str="";
        entry.desigs.map(desig => { if(desig.term.lang==lang.abbr) str+=desig.term.wording; });
        var abc=termbaseConfigs.abc[lang.abbr] || module.exports.siteconfig.defaultAbc;
        var sortkey=toSortkey(str, abc);
        sortkeys.push({lang: lang.abbr, key: sortkey})
      }});
      db.run("delete from entry_sortkey where entry_id=$entry_id", {$entry_id: entryID}, function(err){
        if(err) console.error(err);
        save();
      })
    });
    function save(){
      var obj=sortkeys.pop();
      if(obj) {
        db.run("insert into entry_sortkey(entry_id, lang, key) values($entry_id, $lang, $key)", {$entry_id: entryID, $lang: obj.lang, $key: obj.key}, function(err){
          if(err) console.error(err);
          save();
        });
      } else {
        callnext();
      }
    }
  },
  saveDomains: function(db, termbaseID, entryID, entry, callnext){
    var assigs=[]; entry.domains.map(domainID => {
      if(domainID) assigs.push(domainID);
    });
    db.run("delete from entry_domain where entry_id=$entryID", {$entryID: entryID}, function(err){
      if(err) console.error(err);
      go();
    });
    function go(){
      var assig=assigs.pop();
      if(assig){
        db.run("insert into entry_domain(entry_id, domain) values($entryID, $domain)", {$entryID: entryID, $domain: assig}, function(err){
          if(err) console.error(err);
          go();
        });
      } else {
        callnext();
      }
    }
  },
  saveCollections: function(db, termbaseID, entryID, entry, callnext){
    var assigs=[]; entry.collections.map(obj => {
      assigs.push(parseInt(obj));
    });
    db.run("delete from entry_collection where entry_id=$entryID", {$entryID: entryID}, function(err){
      if(err) console.error(err);
      go();
    });
    function go(){
      var assig=assigs.pop();
      if(assig){
        db.run("insert into entry_collection(entry_id, collection) values($entryID, $collection)", {$entryID: entryID, $collection: assig}, function(err){
          if(err) console.error(err);
          go();
        });
      } else {
        callnext();
      }
    }
  },
  saveExtranets: function(db, termbaseID, entryID, entry, callnext){
    var assigs=[]; entry.extranets.map(obj => {
      assigs.push(parseInt(obj));
    });
    db.run("delete from entry_extranet where entry_id=$entryID", {$entryID: entryID}, function(err){
      if(err) console.error(err);
      go();
    });
    function go(){
      var assig=assigs.pop();
      if(assig){
        db.run("insert into entry_extranet(entry_id, extranet) values($entryID, $extranet)", {$entryID: entryID, $extranet: assig}, function(err){
          if(err) console.error(err);
          go();
        });
      } else {
        callnext();
      }
    }
  },
  saveIntros: function(db, termbaseID, entryID, entry, callnext){
    var assigs=[]; for(var key in entry.intros) assigs.push(entry.intros[key]);
    db.run("delete from entry_intro where entry_id=$entryID", {$entryID: entryID}, function(err){
      if(err) console.error(err);
      go();
    });
    function go(){
      var assig=assigs.pop();
      if(assig || assig===""){
        db.run("insert into entry_intro(entry_id, text) values($entryID, $text)", {$entryID: entryID, $text: assig}, function(err){
          if(err) console.error(err);
          go();
        });
      } else {
        callnext();
      }
    }
  },
  saveDefinitions: function(db, termbaseID, entryID, entry, callnext){
    var assigs=[]; entry.definitions.map(def => {
      for(var key in def.texts){
        if(def.texts[key]) assigs.push(def.texts[key]);
      }
    });
    db.run("delete from entry_def where entry_id=$entryID", {$entryID: entryID}, function(err){
      if(err) console.error(err);
      go();
    });
    function go(){
      var assig=assigs.pop();
      if(assig){
        db.run("insert into entry_def(entry_id, text) values($entryID, $text)", {$entryID: entryID, $text: assig}, function(err){
          if(err) console.error(err);
          go();
        });
      } else {
        callnext();
      }
    }
  },
  saveExamples: function(db, termbaseID, entryID, entry, callnext){
    var assigs=[]; entry.examples.map(ex => {
      for(var key in ex.texts){
        ex.texts[key].map(text => {
          if(text) assigs.push(text);
        });
      }
    });
    db.run("delete from entry_xmpl where entry_id=$entryID", {$entryID: entryID}, function(err){
      if(err) console.error(err);
      go();
    });
    function go(){
      var assig=assigs.pop();
      if(assig){
        db.run("insert into entry_xmpl(entry_id, text) values($entryID, $text)", {$entryID: entryID, $text: assig}, function(err){
          if(err) console.error(err);
          go();
        });
      } else {
        callnext();
      }
    }
  },
  saveXrefs: function(db, termbaseID, entryID, entry, callnext){
    var assigs=[]; entry.xrefs.map(targetID => {
      assigs.push(targetID);
    });
    db.run("delete from entry_xref where entry_id=$entryID", {$entryID: entryID}, function(err){
      if(err) console.error(err);
      go();
    });
    function go(){
      var assig=assigs.pop();
      if(assig){
        db.run("insert into entry_xref(entry_id, target_entry_id) values($entryID, $targetID)", {$entryID: entryID, $targetID: assig}, function(err){
          if(err) console.error(err);
          go();
        });
      } else {
        callnext();
      }
    }
  },
  saveNotes: function(db, termbaseID, entryID, entry, callnext){
    var objs=[]; entry.notes.map(note => {
      for(var lang in note.texts){
        objs.push({typeID: note.type, lang: lang, text: note.texts[lang]});
      }
    });
    db.run("delete from entry_note where entry_id=$entryID", {$entryID: entryID}, function(err){
      if(err) console.error(err);
      go();
    });
    function go(){
      var obj=objs.pop();
      if(obj){
        db.run("insert into entry_note(entry_id, type, lang, text) values($entryID, $typeID, $lang, $text)", {$entryID: entryID, $typeID: obj.typeID, $lang: obj.lang, $text: obj.text}, function(err){
          if(err) console.log(err);
          go();
        });
      } else {
        callnext();
      }
    }
  },

  todNextAvailableDate: function(db, termbaseID, callnext){
    db.get("select max(tod) as maxDate from entries", {}, function(err, row){
      if(err) console.error(err);
      var date=new Date();
      if(row && /^[0-9][0-9][0-9][0-9]\-[0-9][0-9]\-[0-9][0-9]/.test(row["maxDate"])){
        date=new Date(row["maxDate"]);
        date.setDate(date.getDate()+1);
      }
      callnext(date.toISOString().split('T')[0]);
    });
  },

  langDBs: {},
  getLangDB: function(lang){
    if(module.exports.langDBs[lang]){
      return module.exports.langDBs[lang];
    } else {
      var db=null;
      if(fs.existsSync(path.join(module.exports.siteconfig.dataDir, "lang/"+lang+".sqlite"))){
        db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lang/"+lang+".sqlite"), sqlite3.OPEN_READONLY, function(err){
          if(err) console.error(err);
        });
        module.exports.langDBs[lang]=db;
      }
      return db;
    }
  },
  getLemmas: function(lang, word, callnext){
    var langDB=module.exports.getLangDB(lang);
    if(!langDB) callnext([]); else {
      langDB.all("select lemma from lemmatization where token=$token", {$token: word}, function(err, rows){
        var lemmas=[];
        for(var i=0; i<rows.length; i++) if(lemmas.indexOf(rows[i]["lemma"])==-1) lemmas.push(rows[i]["lemma"]);
        callnext(lemmas);
      });
    }
  },
  getLemmasMulti: function(lang, words, callnext){
    var langDB=module.exports.getLangDB(lang);
    if(!langDB) callnext([]); else {
      var str="";
      words.map(word => {
        if(str!="") str+=",";
        str+="'"+word.replace(/'/g, "''")+"'";
      });
      langDB.all("select lemma from lemmatization where token in ("+str+")", {}, function(err, rows){
        if(err) console.error(err);
        var lemmas=[];
        for(var i=0; i<rows.length; i++) if(lemmas.indexOf(rows[i]["lemma"])==-1) lemmas.push(rows[i]["lemma"]);
        callnext(lemmas);
      });
    }
  },
  saveLemmas: function(db, termbaseID, termID, lang, word, callnext){
    var lemmas=[];
    module.exports.getLemmas(lang, word, function(_lemmas){
      lemmas=_lemmas;
      go();
    });
    function go(){
      var lemma=lemmas.pop();
      if(lemma){
        db.run("insert into words(term_id, word, implicit) values($termID, $word, 1)", {$termID: termID, $word: lemma}, function(err){
          if(err) console.error(err);
          go();
        });
      } else {
        callnext();
      }
    }
  },

  saveSpelling: function(db, termbaseID, term, callnext){
    db.run("delete from spelling where term_id=$termID", {$termID: parseInt(term.id)}, function(err){
      if(err) console.error(err);
      var params={$termID: parseInt(term.id), $wording: term.wording, $length: term.wording.length};
      var spellindex=module.exports.getSpellindex(term.wording);
      for(var key in spellindex) params["$"+key]=spellindex[key];
      db.run("insert into spelling(term_id, wording, length, a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z) values($termID, $wording, $length, $a,$b,$c,$d,$e,$f,$g,$h,$i,$j,$k,$l,$m,$n,$o,$p,$q,$r,$s,$t,$u,$v,$w,$x,$y,$z)", params, function(err){
        if(err) console.error(err);
        callnext();
      });
    });
  },
  getSpellindex: function(wording){
    var ret={a:0, b:0, c:0, d:0, e:0, f:0, g:0, h:0, i:0, j:0, k:0, l:0, m:0, n:0, o:0, p:0, q:0, r:0, s:0, t:0, u:0, v:0, w:0, x:0, y:0, z:0};
    var chars={
      a: "aáàâäăāãåąæ",
      b: "b",
      c: "cćċĉčç",
      d: "dďđ",
      e: "eéèėêëěēęæœ",
      f: "f",
      g: "gġĝğģ",
      h: "hĥħ",
      i: "iıíìİîïīį",
      j: "jĵ",
      k: "kĸķ",
      l: "lĺŀľļł",
      m: "m",
      n: "nńňñņ",
      o: "oóòôöōõőøœ",
      p: "p",
      q: "q",
      r: "rŕřŗ",
      s: "sśŝšşșß",
      t: "tťţț",
      u: "uúùûüŭūůųű",
      v: "v",
      w: "wẃẁŵẅ",
      x: "x",
      y: "yýỳŷÿ",
      z: "zźżž"
    };
    wording=wording.toLowerCase();
    for(var i=0; i<wording.length; i++){
      var c=wording[i];
      for(var key in chars){
        if(chars[key].indexOf(c)>-1) ret[key]++;
      }
    }
    return ret;
  },
  getSpellsuggs: function(db, termbaseID, want, searchtext, callnext){
    if(!want) callnext(null); else {
      var si=module.exports.getSpellindex(searchtext);
      var sql="select distinct wording from spelling";
      var orderby="";
      for(var key in si){
        if(orderby!="") orderby+="+";
        orderby+="abs("+key+"-"+si[key]+")";
      }
      orderby+="+abs(length-"+searchtext.length+")";
      sql+=" order by "+orderby+" asc limit 10";
      //console.log(sql);
      db.all(sql, {}, function(err, rows){
        if(err) console.error(err);
        var suggs=[];
        rows.map(row => {
          if(row["wording"]!=searchtext) suggs.push({text: row["wording"], lev: levenshtein(searchtext, row["wording"])})
        })
        suggs.sort(function(a, b){return a.lev>b.lev});
        var ret=[];
        suggs.map(sugg => {
          if(ret.length<3 && sugg.lev<3) ret.push(sugg.text);
        });
        callnext(ret);
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
      if(err) console.error(err);
      callnext();
    });
  },

  sharEnquire: function(db, termbaseID, termID, lang, wording, callnext){
    var data={sharedBy: [], similarTo: []};
    //find out which entries share this term:
    db.all("select e.id, e.json from entries as e inner join entry_term as et on e.id=et.entry_id where et.term_id=$termID", {$termID: termID}, function(err, rows){
      if(err) console.error(err);
      rows.map(row => { data.sharedBy.push({entryID: row.id, json: row.json}) });

      //find out which terms are similar to this term:
      var sql="select id, json from terms where wording=$wording";
      var params={$wording: wording};
      if(lang){
        sql+=" and lang=$lang";
        params.$lang=lang;
      }
      if(termID){
        sql+=" and id<>$termID";
        params.$termID=termID;
      }
      db.all(sql, params, function(err, rows){
        if(err) console.error(err);
        rows.map(row => { data.similarTo.push({termID: row.id, json: row.json}) });
        callnext(data);
      });
    });
  },
  xrefsMake: function(db, termbaseID, ids, email, historiography, callnext){
    var sql=`select * from entries where id in(${ids})`;
    ids=[]; var entries={};
    db.all(sql, {}, function(err, rows){
      if(err) console.error(err);
      if(err || !rows) rows=[];
      for(var i=0; i<rows.length; i++){ entries[rows[i].id.toString()]=JSON.parse(rows[i].json); ids.push(rows[i].id.toString()); }
      ids.map(id1 => { ids.map(id2 => { if(id1!=id2){
        var entry1=entries[id1]; var entry2=entries[id2];
        if(!entry1.xrefs) entry1.xrefs=[];
        if(entry1.xrefs.indexOf(id2)==-1) entry1.xrefs.push(id2);
      }})});
      save();
    });
    function save(){
      if(ids.length>0){
        var entryID=ids.pop();
        var json=JSON.stringify(entries[entryID]);
        db.run("update entries set json=$json where id=$id", {$json: json, $id: entryID}, function(err){
          if(err) console.error(err);
          module.exports.propagator.saveEntry(termbaseID, entryID, entries[entryID], function(err){
            if(err) console.error(err);
          });
          module.exports.saveHistory(db, termbaseID, entryID, "update", email, json, historiography, function(){
            module.exports.saveXrefs(db, termbaseID, entryID, entries[entryID], function(){
              save();
            });
          });
        });
      } else {
        callnext();
      }
    }
  },
  xrefsBreak: function(db, termbaseID, ids, email, historiography, callnext){
    var sql=`select * from entries where id in(${ids})`;
    ids=[]; var entries={};
    db.all(sql, {}, function(err, rows){
      if(err) console.error(err);
      if(err || !rows) rows=[];
      for(var i=0; i<rows.length; i++){ entries[rows[i].id.toString()]=JSON.parse(rows[i].json); ids.push(rows[i].id.toString()); }
      ids.map(id1 => { ids.map(id2 => { if(id1!=id2){
        var entry1=entries[id1]; var entry2=entries[id2];
        if(!entry1.xrefs) entry1.xrefs=[];
        if(entry1.xrefs.indexOf(id2)>-1) entry1.xrefs.splice(entry1.xrefs.indexOf(id2), 1);
      }})});
      save();
    });
    function save(){
      if(ids.length>0){
        var entryID=ids.pop();
        var json=JSON.stringify(entries[entryID]);
        db.run("update entries set json=$json where id=$id", {$json: json, $id: entryID}, function(err){
          if(err) console.error(err);
          module.exports.propagator.saveEntry(termbaseID, entryID, entries[entryID], function(err){
            if(err) console.error(err);
          });
          module.exports.saveHistory(db, termbaseID, entryID, "update", email, json, historiography, function(){
            module.exports.saveXrefs(db, termbaseID, entryID, entries[entryID], function(){
              save();
            });
          });
        });
      } else {
        callnext();
      }
    }
  },
  cleanUpXrefs: function(db, termbaseID, entryID, entry, callnext){
    //remove xrefs that go to entries that don't exist
    var ids=[]; if(entry.xrefs) entry.xrefs.map(id => { ids.push(id); });
    var sql=`select id from entries where id in(${ids})`;
    db.all(sql, {}, function(err, rows){
      if(err) console.error(err);
      if(err || !rows) rows=[];
      var existIDs=[]; for(var i=0; i<rows.length; i++){ existIDs.push(rows[i].id.toString()); }
      if(entry.xrefs){
        ids.map(id => {
          if(existIDs.indexOf(id)==-1 || id==entryID.toString()) entry.xrefs.splice(entry.xrefs.indexOf(id), 1);
        });
      }
      callnext(entry);
    });
  },
  merge: function(db, termbaseID, ids, email, historiography, callnext){
    var sql=`select * from entries where id in(${ids})`;
    ids=[]; var entries={};
    var motherID=0; var motherEntry=null;
    db.all(sql, {}, function(err, rows){
      if(err) console.error(err);
      if(err || !rows) rows=[];
      for(var i=0; i<rows.length; i++){ entries[rows[i].id.toString()]=JSON.parse(rows[i].json); ids.push(rows[i].id.toString()); }
      motherID=ids[0]; ids.splice(0, 1); motherEntry=entries[motherID];
      ids.map(id => {
        var deadEntry=entries[id];
        motherEntry=mergeTwo(motherEntry, deadEntry);
      });
      del();
    });
    function del(){
      if(ids.length>0){
        var entryID=ids.pop();
        module.exports.entryDelete(db, termbaseID, entryID, email, historiography, function(){
          del();
        });
      } else {
        module.exports.entrySave(db, termbaseID, motherID, JSON.stringify(motherEntry), email, historiography, function(){
          callnext();
        });
      }
    }
    function mergeTwo(entry1, entry2){
      for(var key in entry2){
        if(!entry1[key]){
          entry1[key]=entry2[key]
        } else {
          if(key=="cStatus" || key=="pStatus" || key=="dStatus"){
            entry1[key]=Math.max(entry1[key], entry2[key]).toString();
          } else if(key=="dateStamp"){
            entry1[key]=(entry1[key]>entry2[key] ? entry1[key] : entry2[key]);
          } else if(key=="intros"){
            for(var lang in entry2[key]){
              if(!entry1[key][lang]) entry1[key][lang]=entry2[key][lang]; else entry1[key][lang]+=" + "+entry2[key][lang];
            }
          } else {
            var stamps=[]; entry1[key].map(obj => { stamps.push(JSON.stringify(obj)); });
            entry2[key].map(obj => {
              if(stamps.indexOf(JSON.stringify(obj))==-1) entry1[key].push(obj);
            });
          }
        }
      }
      return entry1;
    }
  },

  metadataList: function(db, termbaseID, type, facets, searchtext, modifier, howmany, callnext){
    var sql1=`select
      m.*,
      (select count(*) from metadata as chld where chld.type=$type and chld.parent_id=m.id) as hasChildren
      from metadata as m
      where m.type=$type and (m.parent_id is null or not exists(select * from metadata as x where x.id=m.parent_id))
      order by m.sortkey
      limit $howmany`;
    var params1={$howmany: howmany, $type: type};
    var sql2=`select count(*) as total from metadata as m where m.type=$type and (m.parent_id is null or not exists(select * from metadata as x where x.id=m.parent_id))`;
    var params2={$type: type};
    db.all(sql1, params1, function(err, rows){
      if(err) console.error(err);
      if(err || !rows) rows=[];
      var entries=[];
      for(var i=0; i<rows.length; i++){
        var item={id: rows[i].id, title: rows[i].id, json: rows[i].json, hasChildren: (rows[i].hasChildren>0)};
        entries.push(item);
      }
      db.get(sql2, params2, function(err, row){
        if(err) console.error(err);
        var total=(!err && row) ? row.total : 0;
        callnext(total, entries);
      });
    });
  },
  metadataListHierarchy: function(db, termbaseID, type, parentID, callnext){
    module.exports.metadataParentsAndSelf(db, type, parentID, 0, [], function(parentEntries){
      var level=0;
      if(parentEntries.length>0){
        var levelOffset=parentEntries[0].level;
        parentEntries.map(entry => {
          entry.hasChildren=true;
          entry.level=entry.level-levelOffset;
        });
        level=parentEntries[parentEntries.length-1].level+1;
      }
      var sql1=`select
        m.*,
        (select count(*) from metadata as chld where chld.type=$type and chld.parent_id=m.id) as hasChildren
        from metadata as m
        where m.type=$type and m.parent_id=$parentID
        order by m.sortkey
        limit $howmany`;
      var params1={$howmany: 10000, $type: type, $parentID: parentID};
      db.all(sql1, params1, function(err, rows){
        if(err) console.error(err);
        if(err || !rows) rows=[];
        var entries=[];
        for(var i=0; i<rows.length; i++){
          var item={id: rows[i].id, title: rows[i].id, json: rows[i].json, hasChildren: (rows[i].hasChildren>0), level: level};
          entries.push(item);
        }
        callnext((parentEntries.length+entries.length), parentEntries, entries);
      });
    });
  },
  metadataParentsAndSelf: function(db, type, entryID, level, acc, callnext){
    var sql=`select * from metadata where type=$type and id=$entryID`;
    var params={$type: type, $entryID: entryID};
    db.get(sql, params, function(err, row){
      if(err) console.error(err);
      if(err || !row) console.log(err);
      var parentID=null;
      if(row){
        var item={id: row.id, title: row.id, json: row.json, level: (level-1)};
        acc.unshift(item);
        parentID=row.parent_id;
      }
      if(parentID){
        module.exports.metadataParentsAndSelf(db, type, parentID, level-1, acc, callnext);
      } else {
        callnext(acc);
      }
    });
  },
  metadataRead: function(db, termbaseID, type, entryID, callnext){
    db.get("select * from metadata where id=$id and type=$type", {$id: entryID, $type: type}, function(err, row){
      if(err) console.error(err);
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
      if(err) console.error(err);
      module.exports.propagator.deleteMetadatum(termbaseID, entryID);
      callnext();
    });
  },
  metadataCreate: function(db, termbaseID, type, entryID, json, callnext){
    var metadatum=JSON.parse(json);
    module.exports.getMetadataSortkey(db, termbaseID, metadatum, function(sortkey){
      var sql="insert into metadata(type, json, sortkey, parent_id) values($type, $json, $sortkey, $parentID)";
      var params={$json: json, $type: type, $sortkey: sortkey, $parentID: metadatum.parentID || null};
      if(entryID) { sql="insert into metadata(id, type, json, sortkey, parent_id) values($id, $type, $json, $sortkey, $parentID)"; params.$id=entryID; }
      db.run(sql, params, function(err){
        if(err) console.error(err);
        if(!entryID) entryID=this.lastID;
        module.exports.propagator.saveMetadatum(termbaseID, entryID, type, json);
        callnext(entryID, json);
      });
    });
  },
  metadataUpdate: function(db, termbaseID, type, entryID, json, callnext){
    db.get("select id, json from metadata where id=$id and type=$type", {$id: entryID, $type: type}, function(err, row){
      if(err) console.error(err);
      var newJson=json;
      var oldJson=(row?row.json:"");
      if(!row) { //an entry with that ID does not exist: recreate it with that ID:
        module.exports.metadataCreate(db, termbaseID, type, entryID, json, callnext);
      } else if(oldJson==newJson) {
        callnext(entryID, json, false);
      } else {
        //update me:
        var metadatum=JSON.parse(json);
        module.exports.getMetadataSortkey(db, termbaseID, metadatum, function(sortkey){
          db.run("update metadata set json=$json, sortkey=$sortkey, parent_id=$parentID where id=$id and type=$type", {
            $id: entryID, $json: json, $type: type, $sortkey: sortkey, $parentID: metadatum.parentID || null
          }, function(err){
            if(err) console.error(err);
            module.exports.propagator.saveMetadatum(termbaseID, entryID, type, json);
            callnext(entryID, json, true);
          });
        });
      }
    });
  },
  getMetadataSortkey: function(db, termbaseID, metadatum, callnext){
    if(typeof(metadatum)=="string") metadatum=JSON.parse(metadatum);
    module.exports.readTermbaseConfigs(db, termbaseID, function(termbaseConfigs){
      var str="";
      if(metadatum.abbr) str+=metadatum.abbr;
      if(metadatum.title && typeof(metadatum.title)=="string") str+=metadatum.title;
      if(metadatum.title && typeof(metadatum.title)=="object") {
        if(metadatum.title.$) str+=metadatum.title.$;
        termbaseConfigs.lingo.languages.map(lang => { if(lang.role=="major" && metadatum.title[lang.abbr]) str+=metadatum.title[lang.abbr]; });
      }
      var abc=module.exports.siteconfig.defaultAbc;
      if(termbaseConfigs.lingo.languages.length>0) abc=termbaseConfigs.abc[termbaseConfigs.lingo.languages[0].abbr] || abc;
      var sortkey=toSortkey(str, abc)
      callnext(sortkey);
    });
  },

  configRead: function(db, termbaseID, configID, callnext){
    db.get("select * from configs where id=$id", {$id: configID}, function(err, row){
      if(err) console.error(err);
      config=(row ? row.json : "{}");
      callnext(config);
    });
  },
  configUpdate: function(db, termbaseID, configID, json, callnext){
    //db.run("update configs set json=$json where id=$id", {$id: configID, $json: json}, function(err){
    db.run("insert or replace into configs(id, json) values($id, $json)", {$id: configID, $json: json}, function(err){
      if(err) console.error(err);
      module.exports.propagator.saveConfig(termbaseID, configID, json);
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

  commentSave: function(db, termbaseID, entryID, extranetID, commentID, email, body, tagID, callnext){
    commentID=parseInt(commentID);
    //first of all, find out what we're supposed to do:
    if(!commentID) go("create"); //this is a new comment
    else db.get("select id from comments where id=$id", {$id: commentID}, function(err, row){
      if(err) console.error(err);
      if(!row) go("recreate"); //a comment with that ID does not exist: recreate it with that ID
      else go("change") //the comment has changed: update it
    });
    //now actually do it:
    function go(dowhat){
      var sql=""; var params={};
      if(dowhat=="create"){
        sql="insert into comments(entry_id, extranet_id, [when], email, body, tag_id) values($entry_id, $extranet_id, $when, $email, $body, $tag_id)";
        params={$entry_id: entryID, $extranet_id: extranetID, $when: (new Date()).toISOString(), $email: email, $body: body, $tag_id: tagID};
      }
      if(dowhat=="recreate"){
        sql="insert into comments(id, entry_id, extranet_id, [when], email, body, tag_id) values($id, $entry_id, $extranet_id, $when, $email, $body, $tag_id)";
        params={$id: commentID, $entry_id: entryID, $extranet_id: extranetID, $when: (new Date()).toISOString(), $email: email, $body: body, $tag_id: tagID};
      }
      if(dowhat=="change"){
        sql="update comments set entry_id=$entry_id, extranet_id=$extranet_id, email=$email, body=$body, tag_id=$tag_id where id=$id";
        params={$id: commentID, $entry_id: entryID, $extranet_id: extranetID, $email: email, $body: body, $tag_id: tagID};
      }
      //create or change me:
      db.run(sql, params, function(err){
        if(err) console.error(err);
        if(!commentID) commentID=this.lastID;
        db.get("select * from comments where id=$id", {$id: commentID}, function(err, row){
          if(err) console.error(err);
          callnext(commentID, row.when, row.body, module.exports.markdown(row.body), row.extranet_id, row.tag_id);
        });
      });
    }
  },
  commentList: function(db, termbaseID, entryID, extranetID, callnext){
    if(extranetID){
      //var sql="select * from comments where entry_id=$entry_id and extranet_id=$extranet_id order by [when] asc";
      //var params={$entry_id: entryID, $extranet_id: extranetID};
      //temporary workaround: show all comments on all extranets
      var sql="select * from comments where entry_id=$entry_id order by [when] asc";
      var params={$entry_id: entryID};
    } else {
      var sql="select * from comments where entry_id=$entry_id order by [when] asc";
      var params={$entry_id: entryID};
    }
    db.all(sql, params, function(err, rows){
      if(err) console.error(err);
      if(err || !rows) rows=[];
      var comments=[];
      for(var i=0; i<rows.length; i++){
        var comment={commentID: rows[i].id, userID: rows[i].email, when: rows[i].when, body: rows[i].body, bodyMarkdown: module.exports.markdown(rows[i].body), extranetID: rows[i].extranet_id, tagID: rows[i].tag_id};
        comments.push(comment);
      }
      callnext(comments);
    });
  },
  commentPeek: function(db, termbaseID, entryID, extranetID, callnext){
    if(extranetID){
      var sql="select count(*) as commentCount from comments where entry_id=$entry_id and extranet_id=$extranet_id";
      var params={$entry_id: entryID, $extranet_id: extranetID};
    } else {
      var sql="select count(*) as commentCount from comments where entry_id=$entry_id";
      var params={$entry_id: entryID};
    }
    db.get(sql, params, function(err, row){
      if(err) console.error(err);
      if(row) callnext(row.commentCount); else callnext(0);
    });
  },
  commentDelete: function(db, termbaseID, extranetID, commentID, callnext){
    if(extranetID){
      var sql="delete from comments where id=$id and extranet_id=$extranet_id";
      var params={$id: commentID, $extranet_id: extranetID};
    } else {
      var sql="delete from comments where id=$id";
      var params={$id: commentID};
    }
    db.run(sql, params, function(err){
      if(err) console.error(err);
      callnext();
    });
  },

  getDoc: function(docID, uilang, callnext){
    var doc={id: docID, title: "", html: "", englishOnly: false};
    if(fs.existsSync("docs/"+docID+"."+uilang+".md")){
      fs.readFile("docs/"+docID+"."+uilang+".md", "utf8", function(err, content){
        if(err) console.error(err);
        var tree=markdown.parse(content);
        doc.title=tree[1][2];
        doc.html=markdown.renderJsonML(markdown.toHTMLTree(tree));
        callnext(doc);
      });
    }
    else if(fs.existsSync("docs/"+docID+".en.md")){
      fs.readFile("docs/"+docID+".en.md", "utf8", function(err, content){
        if(err) console.error(err);
        var tree=markdown.parse(content);
        doc.title=tree[1][2];
        doc.html=markdown.renderJsonML(markdown.toHTMLTree(tree));
        doc.englishOnly=true;
        callnext(doc);
      });
    }
    else {
      callnext(doc);
    }
  },
  markdown: function(str){
    var tree=markdown.parse(str);
    str=markdown.renderJsonML(markdown.toHTMLTree(tree));
    str=str.replace(/\<a href=\"http/g, "<a target=\"_blank\" href=\"http");
    return str;
  },

  readRandoms: function(db, termbaseID, callnext){
    var limit=30;
    var sql_randoms="select wording from terms where id in (select id from terms order by random() limit $limit)"
    var sql_total="select count(*) as total from terms";
    var randoms=[];
    var more=false;
    db.all(sql_randoms, {$limit: limit}, function(err, rows){
      if(err) console.error(err);
      for(var i=0; i<rows.length; i++){
        randoms.push(rows[i].wording);
      }
      db.get(sql_total, {}, function(err, row){
        if(err) console.error(err);
        if(row.total>limit) more=true;
        callnext(more, randoms);
      });
    });
  },

  listUsers: function(searchtext, howmany, callnext){
    var sql1=`select * from users where email like $like order by email limit $howmany`;
    var sql2=`select count(*) as total from users where email like $like`;
    var like="%"+searchtext+"%";
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READONLY);
    db.all(sql1, {$howmany: howmany, $like: like}, function(err, rows){
      if(err) console.error(err);
      var entries=[];
      for(var i=0; i<rows.length; i++){
        var item={id: rows[i].email, title: rows[i].email};
        entries.push(item);
      }
      db.get(sql2, {$like: like}, function(err, row){
        if(err) console.error(err);
        var total=row.total;
        db.close();
        callnext(total, entries);
      });
    });
  },
  readUser: function(email, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READONLY);
    db.get("select * from users where email=$email", {$email: email}, function(err, row){
      if(err) console.error(err);
      if(!row) callnext("", ""); else {
        email=row.email;
        var lastSeen=""; if(row.sessionLast) lastSeen=row.sessionLast;
        db.all("select d.id, d.title from user_termbase as ud inner join termbases as d on d.id=ud.termbase_id  where ud.user_email=$email order by d.title", {$email: email}, function(err, rows){
          if(err) console.error(err);
          xml="<user"; if(lastSeen) xml+=" lastSeen='"+lastSeen+"'"; xml+=">";
          for(var i=0; i<rows.length; i++){
            var title=JSON.parse(rows[i].title).$;
            xml+="<dict id='"+rows[i].id+"' title='"+clean4xml(title)+"'/>";
          }
          xml+="</user>";
          db.close();
          callnext(email, xml);
        });
      }
    });
  },
  deleteUser: function(email, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
    db.run("delete from users where email=$email", {
      $email: email,
    }, function(err){
      if(err) console.error(err);
      db.close();
      callnext();
    });
  },
  createUser: function(xml, callnext){
    var doc=(new xmldom.DOMParser()).parseFromString(xml, 'text/xml');
    var email=doc.documentElement.getAttribute("email");
    var passwordHash=sha1(doc.documentElement.getAttribute("password"));
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
    db.run("insert into users(email, passwordHash) values($email, $passwordHash)", {
      $email: email,
      $passwordHash: passwordHash,
    }, function(err){
      if(err) console.error(err);
      db.close();
      module.exports.readUser(email, function(email, xml){ callnext(email, xml); });
    });
  },
  updateUser: function(email, xml, callnext){
    var doc=(new xmldom.DOMParser()).parseFromString(xml, 'text/xml');
    if(!doc.documentElement.getAttribute("password")){
      module.exports.readUser(email, function(email, xml){ callnext(email, xml); });
    } else {
      var passwordHash=sha1(doc.documentElement.getAttribute("password"));
      var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
      db.run("update users set passwordHash=$passwordHash where email=$email", {
        $email: email,
        $passwordHash: passwordHash,
      }, function(err){
        if(err) console.error(err);
        db.close();
        module.exports.readUser(email, function(email, xml){
          callnext(email, xml);
        });
      });
    }
  },

  pubSearch: function(db, termbaseID, searchtext, page, callnext){
    page=parseInt(page);
    var howmany=page*100;
    var startAt=(page-1)*100;
    var sortlang=db.termbaseConfigs.lingo.languages[0].abbr;
    module.exports.composeSqlQueries(db, {pStatus: "1"}, searchtext, "* smart "+sortlang, howmany, function(sql1, params1, sql2, params2){
      db.all(sql1, params1, function(err, rows){
        if(err) console.error(err);
        if(err || !rows) rows=[];
        var suggestions=null;
        var want=true;
        module.exports.getSpellsuggs(db, termbaseID, want, searchtext, function(suggs){
          suggestions=suggs;
          module.exports.readTermbaseMetadata(db, termbaseID, function(metadata){
            var primeEntries=null;
            var entries=[];
            for(var i=0; i<rows.length; i++){
              if(i>=startAt){
                var item={id: rows[i].id, json: rows[i].json, html: pp.renderEntry(rows[i].id, rows[i].json, metadata, db.termbaseConfigs)};
                if(rows[i].match_quality>0) {
                  if(!primeEntries) primeEntries=[];
                  primeEntries.push(item);
                } else{
                  entries.push(item);
                }
              }
            }
            //if(modifier.indexOf(" smart ")>-1 && searchtext!="") suggestions=["jabbewocky", "dord", "gibberish", "coherence", "nonce word", "cypher", "the randomist"];;
            db.get(sql2, params2, function(err, row){
              if(err) console.error(err);
              if(err) console.log(err);
              var total=(!err && row) ? row.total : 0;
              var pages=Math.floor(total/100); if(total%100 > 0) pages++;
              // callnext(total, pages, page, primeEntries, entries, suggestions);
              callnext({
                q: searchtext,
                pages: pages,
                page: page,
                primeEntries: primeEntries,
                entries: entries,
                suggestions: suggestions,
              });
            });
          });
        });
      });
    });
  },
  pubEntry: function(db, termbaseID, entryID, callnext){
    db.get("select * from entries where id=$id and pStatus=1", {$id: entryID}, function(err, row){
      if(err) console.error(err);
      if(!row) {
        callnext({id: 0, json: "", html: ""});
      } else {
        module.exports.readTermbaseMetadata(db, termbaseID, function(metadata){
          callnext({id: row.id, json: row.json, html: pp.renderEntry(row.id, row.json, metadata, db.termbaseConfigs)});
        });
      }
    });
  },

  toTBX: function(db, termbaseID, offset, limit, callnext){
    var stamp=(new Date()).toISOString().replace(/[^0-9]/g, "-");
    var filename=stamp+termbaseID+".tbx";
    var path=module.exports.siteconfig.dataDir+"downloads/"+filename;
    var lingo=null;
    var ident=null;
    module.exports.readTermbaseConfigs(db, termbaseID, function(configs){
      var lingo=configs.lingo;
      var ident=configs.ident;
      var termbaseLang=""; lingo.languages.map(l => {if(!termbaseLang) termbaseLang=l.abbr});
      module.exports.readTermbaseMetadata(db, termbaseID, function(obj){
        var metadata={};
        for(var type in obj){
          obj[type].map(datum => {
            metadata[datum.id]={type: type, obj: datum};
          });
        }
        var entry2tbx=require(module.exports.siteconfig.sharedDir+"/entry-to-tbx.js");
        entry2tbx.setTermbaseLang(termbaseLang);
        entry2tbx.setMetadata(metadata);

        fs.writeFileSync(path, `<?xml version="1.0" encoding="UTF-8"?>
<martif type="TBX" xml:lang="${termbaseLang}">
  <martifHeader>
    <fileDesc>
      <titleStmt>
        <title>${clean4xml(ident.title[termbaseLang] || ident.title.$)}</title>
      </titleStmt>
      <sourceDesc>
        <p>${clean4xml(ident.blurb[termbaseLang] || ident.blurb.$)}</p>
      </sourceDesc>
    </fileDesc>
  </martifHeader>
  <text>
    <body>
        `, "utf8");
        db.all(`select id, json from entries order by id limit ${limit} offset ${offset}`, {}, function(err, rows){
          if(err) console.error(err);
          rows.map(row => {
            var entry=JSON.parse(row.json);
            entry.id=row.id;
            var xml=entry2tbx.doEntry(entry);
            xml=xmlformatter(xml, {collapseContent: true}).replace(/(^|\n)/g, function($1){ return $1+"      " });
            fs.appendFileSync(path, "\n"+xml+"\n", "utf8");
          });
          fs.appendFileSync(path, `
    </body>
  </text>
</martif>
          `, "utf8");
          callnext(filename);
        });
      });
    });
  },
  toTBXByIDs: function(db, termbaseID, ids, callnext){
    var stamp=(new Date()).toISOString().replace(/[^0-9]/g, "-");
    var filename=stamp+termbaseID+".tbx";
    var path=module.exports.siteconfig.dataDir+"downloads/"+filename;
    var lingo=null;
    var ident=null;
    module.exports.readTermbaseConfigs(db, termbaseID, function(configs){
      var lingo=configs.lingo;
      var ident=configs.ident;
      var termbaseLang=""; lingo.languages.map(l => {if(!termbaseLang) termbaseLang=l.abbr});
      module.exports.readTermbaseMetadata(db, termbaseID, function(obj){
        var metadata={};
        for(var type in obj){
          obj[type].map(datum => {
            metadata[datum.id]={type: type, obj: datum};
          });
        }
        var entry2tbx=require(module.exports.siteconfig.sharedDir+"/entry-to-tbx.js");
        entry2tbx.setTermbaseLang(termbaseLang);
        entry2tbx.setMetadata(metadata);

        fs.writeFileSync(path, `<?xml version="1.0" encoding="UTF-8"?>
<martif type="TBX" xml:lang="${termbaseLang}">
  <martifHeader>
    <fileDesc>
      <titleStmt>
        <title>${clean4xml(ident.title[termbaseLang] || ident.title.$)}</title>
      </titleStmt>
      <sourceDesc>
        <p>${clean4xml(ident.blurb[termbaseLang] || ident.blurb.$)}</p>
      </sourceDesc>
    </fileDesc>
  </martifHeader>
  <text>
    <body>
        `, "utf8");
        db.all(`select id, json from entries where id in (${ids})`, {$ids: ids}, function(err, rows){
          if(err) console.error(err);
          rows.map(row => {
            var entry=JSON.parse(row.json);
            entry.id=row.id;
            var xml=entry2tbx.doEntry(entry);
            xml=xmlformatter(xml, {collapseContent: true}).replace(/(^|\n)/g, function($1){ return $1+"      " });
            fs.appendFileSync(path, "\n"+xml+"\n", "utf8");
          });
          fs.appendFileSync(path, `
    </body>
  </text>
</martif>
          `, "utf8");
          callnext(filename);
        });
      });
    });
  },
  toTXTByIDs: function(db, termbaseID, ids, callnext){
    var stamp=(new Date()).toISOString().replace(/[^0-9]/g, "-");
    var filename=stamp+termbaseID+".txt";
    var path=module.exports.siteconfig.dataDir+"downloads/"+filename;
    var lingo=null;
    var ident=null;
    module.exports.readTermbaseConfigs(db, termbaseID, function(configs){
      var lingo=configs.lingo;
      var ident=configs.ident;
      var termbaseLang=""; lingo.languages.map(l => {if(!termbaseLang) termbaseLang=l.abbr});
      module.exports.readTermbaseMetadata(db, termbaseID, function(obj){
        var metadata={};
        for(var type in obj){
          obj[type].map(datum => {
            metadata[datum.id]={type: type, obj: datum};
          });
        }
        var entry2txt=require(module.exports.siteconfig.sharedDir+"/entry-to-txt.js");
        entry2txt.setTermbaseLang(termbaseLang);
        entry2txt.setMetadata(metadata);
        var spec={
          separator: "\t", separatorEscape: "[TAB]",
          joiner: " | ", joinerEscape: " [LINE] ",
          linebreakEscape: "[LINEBREAK]",
          openBracketEscape: "[OPENBRACKET]",
          closeBracketEscape: "[CLOSEBRACKET]",
          commaEscape: "[COMMA]",
          columns: [
            {
              title: "ID",
              what: "id",
            },
            {
              title: "Réimse",
              what: "domains",
              lang: "en",
            },
            {
              title: "Téarma Béarla",
              what: "terms",
              lang: "en",
              includeAnnotations: true,
              includeInflectedForms: true,
              includeAcceptability: true,
              includeClarification: true,
            },
            {
              title: "Intreoir Béarla",
              what: "intro",
              lang: "en",
            },
            {
              title: "Téarma Gaeilge",
              what: "terms",
              lang: "ga",
              includeAnnotations: true,
              includeInflectedForms: true,
              includeAcceptability: true,
              includeClarification: true,
            },
            {
              title: "Sainmhíniú Béarla",
              what: "definitions",
              lang: "en",
            },
            {
              title: "Sainmhíniú Gaeilge",
              what: "definitions",
              lang: "ga",
            },
            {
              title: "Sampla Béarla",
              what: "examples",
              lang: "en",
            },
            {
              title: "Sampla Gaeilge",
              what: "examples",
              lang: "ga",
            },
            // {
            //   title: "Nóta Gaeilge de chineál 913502",
            //   what: "notes",
            //   type: "913502",
            //   lang: "ga",
            // },
          ],
        };
        entry2txt.setSpec(spec);
        fs.writeFileSync(path, ``, "utf8");
        spec.columns.map((col, i) => {
          if(i>0) fs.appendFileSync(path, "\t", "utf8");
          fs.appendFileSync(path, col.title, "utf8");
        });
        fs.appendFileSync(path, `\n`, "utf8");
        db.all(`select id, json from entries where id in (${ids})`, {$ids: ids}, function(err, rows){
          if(err) console.error(err);
          rows.map(row => {
            var entry=JSON.parse(row.json);
            entry.id=row.id;
            var txt=entry2txt.doEntry(entry);
            fs.appendFileSync(path, txt+"\n", "utf8");
          });
          callnext(filename);
        });
      });
    });
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

function toSortkey(s, abc){
  const keylength=5;
  var ret=s.replace(/\<[\<\>]+>/g, "").toLowerCase();
  //replace any numerals:
  var pat=new RegExp("[0-9]{1,"+keylength+"}", "g");
  ret=ret.replace(pat, function(x){while(x.length<keylength+1) x="0"+x; return x;});
  //prepare characters:
  var chars=[];
  var count=0;
  for(var pos=0; pos<abc.length; pos++){
    var key=(count++).toString(); while(key.length<keylength) key="0"+key; key="_"+key;
    for(var i=0; i<abc[pos].length; i++){
      if(i>0) count++;
      chars.push({char: abc[pos][i], key: key});
    }
  }
  chars.sort(function(a,b){ if(a.char.length>b.char.length) return -1; if(a.char.length<b.char.length) return 1; return 0; });
  //replace characters:
  for(var i=0; i<chars.length; i++){
    if(!/^[0-9]$/.test(chars[i].char)) { //skip chars that are actually numbers
      while(ret.indexOf(chars[i].char)>-1) ret=ret.replace(chars[i].char, chars[i].key);
    }
  }
  //remove any remaining characters that aren't a number or an underscore:
  ret=ret.replace(/[^0-9_]/g, "");
  return ret;
}

function generateTermbaseID(){
  var alphabet="abcdefghijkmnpqrstuvwxy23456789";
  var id="";
  while(id.length<8) {
    var i=Math.floor(Math.random() * alphabet.length);
    id+=alphabet[i]
  }
  return "z"+id;
}

function clean4xml(txt){
  return txt
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

const prohibitedTermbaseIDs=["login", "logout", "make", "signup", "forgotpwd", "changepwd", "users", "termbases", "recoverpwd", "createaccount"];
