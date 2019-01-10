const path=require("path");
const fs=require("fs-extra");
const sqlite3 = require('sqlite3').verbose(); //https://www.npmjs.com/package/sqlite3
const sha1 = require('sha1'); //https://www.npmjs.com/package/sha1
const markdown = require("markdown").markdown; //https://www.npmjs.com/package/markdown

module.exports={
  siteconfig: {}, //populated by terminologue.js on startup
  mailtransporter: null,

  login: function(email, password, uilang, callnext){
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
          db.run("update users set sessionKey=$key, sessionLast=$now, uilang=$uilang where email=$email", {$key: key, $now: now, $uilang: uilang, $email: email}, function(err, row){
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
    db.get("select email, uilang from users where email=$email and sessionKey=$key and sessionLast>=$yesterday", {$email: email, $key: sessionkey, $yesterday: yesterday}, function(err, row){
      if(!row || module.exports.siteconfig.readonly){
        db.close();
        callnext({loggedin: false, email: null});
      } else {
        email=row.email;
        var uilang=row.uilang || module.exports.siteconfig.uilangDefault;
        var now=(new Date()).toISOString();
        db.run("update users set sessionLast=$now where email=$email", {$now: now, $email: email}, function(err, row){
          db.close();
          callnext({loggedin: true, email: email, uilang: uilang, isAdmin: (module.exports.siteconfig.admins.indexOf(email)>-1)});
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
  saveUilang: function(email, lang, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE);
    db.run("update users set uilang=$lang where email=$email", {$lang: lang, $email: email}, function(err){
      db.close();
      callnext();
    });
  },
  getRemoteAddress: function(request) {
    var remoteIp = request.connection.remoteAddress.replace('::ffff:','');
    if (request.headers['x-forwarded-for'] != undefined) {
      remoteIp = request.headers['x-forwarded-for'];
    }
    if (request.headers['x-real-ip'] != undefined) {
      remoteIp = request.headers['x-real-ip'];
    }
    if (request.headers['x-real-ip'] != undefined) {
      remoteIp = request.headers['x-real-ip'];
    }
    return remoteIp;
  },
  sendSignupToken: function(email, remoteip, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select email from users where email=$email", {$email: email}, function(err, row){
      if (row==undefined) {
        var expireDate = (new Date()); expireDate.setHours(expireDate.getHours()+48);
        expireDate = expireDate.toISOString();
        var token = sha1(sha1(Math.random()));
        var tokenurl = module.exports.siteconfig.baseUrl + 'createaccount/' + token;
        var mailSubject="Terminologue signup";
        var mailText = `Dear Terminologue user,\n\n`;
        mailText+=`Somebody (hopefully you, from the address ${remoteip}) requested to create a new Terminologue account. Please follow the link below to create your account:\n\n`
        mailText+=`${tokenurl}\n\n`;
        mailText+=`For security reasons this link is only valid for two days (until ${expireDate}). If you did not request an account, you can safely ignore this message. \n\n`;
        mailText+=`Yours,\nThe Terminologue team`;
        db.run("insert into register_tokens (email, requestAddress, token, expiration) values ($email, $remoteip, $token, $expire)", {$email: email, $expire: expireDate, $remoteip: remoteip, $token: token}, function(err, row){
          module.exports.mailtransporter.sendMail({from: module.exports.siteconfig.mailconfig.from, to: email, subject: mailSubject, text: mailText}, (err, info) => {});
          db.close();
          callnext(true);
        });
      } else {
        db.close();
        callnext(false);
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
        var db=module.exports.getDB(termbaseID);
        var users={}; users[email]={level: "5"};
        db.run("update configs set json=$json where id='users'", {$json: JSON.stringify(users, null, "\t")}, function(err){
          var ident={title: {$: title}, blurb: {$: blurb}};
          db.run("update configs set json=$json where id='ident'", {$json: JSON.stringify(ident, null, "\t")}, function(err){
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
      db.run("insert into termbases(id, title) values ($termbaseID, $title)", {$termbaseID: termbaseID, $title: JSON.stringify(ident.title)}, function(err){
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
  destroyTermbase: function(termbaseID, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "terminologue.sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
    db.run("delete from termbases where id=$termbaseID", {$termbaseID: termbaseID}, function(err){
      db.run("delete from user_termbase where termbase_id=$termbaseID", {$termbaseID: termbaseID}, function(err){
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
    db.get("select email, uilang from users where email=$email and sessionKey=$key and sessionLast>=$yesterday", {$email: email, $key: sessionkey, $yesterday: yesterday}, function(err, row){
      if(!row || module.exports.siteconfig.readonly){
        db.close();
        callnext({loggedin: false, email: null});
      } else {
        email=row.email;
        var uilang=row.uilang || module.exports.siteconfig.uilangDefault;
        var now=(new Date()).toISOString();
        db.run("update users set sessionLast=$now where email=$email", {$now: now, $email: email}, function(err, row){
          db.close();
          module.exports.readTermbaseConfigs(termbaseDB, termbaseID, function(configs){
            if(!configs.users[email] && module.exports.siteconfig.admins.indexOf(email)==-1){
              callnext({loggedin: true, email: email, uilang: uilang, termbaseAccess: false, isAdmin: false, level: configs.users[email].level});
            } else {
              var isAdmin=(module.exports.siteconfig.admins.indexOf(email)>-1);
              callnext({loggedin: true, email: email, uilang: uilang, termbaseAccess: true, isAdmin: isAdmin, level: configs.users[email].level});
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
      if(!row || module.exports.siteconfig.readonly){
        db.close();
        callnext({loggedin: false, email: null});
      } else {
        email=row.email;
        var uilang=row.uilang || module.exports.siteconfig.uilangDefault;
        var now=(new Date()).toISOString();
        db.run("update users set sessionLast=$now where email=$email", {$now: now, $email: email}, function(err, row){
          module.exports.readTermbaseConfigs(termbaseDB, termbaseID, function(configs){
            if(!configs.users[email] && module.exports.siteconfig.admins.indexOf(email)==-1){
              db.close();
              callnext({loggedin: true, email: email, uilang: uilang, termbaseAccess: false, xnetAccess: false, isAdmin: false});
            } else {
              var isAdmin=(module.exports.siteconfig.admins.indexOf(email)>-1);
              module.exports.readExtranet(termbaseDB, termbaseID, xnetID, function(xnet){
                db.close();
                var xnetAccess=(xnet.users.indexOf(email)>-1);
                callnext({loggedin: true, email: email, uilang: uilang, termbaseAccess: true, xnetAccess: xnetAccess, isAdmin: isAdmin}, xnet);
              });
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
    db.all("select * from metadata order by sortkey", {}, function(err, rows){
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
  readExtranetsByUser: function(db, termbaseID, email, callnext){
    db.all("select * from metadata where type='extranet'", {}, function(err, rows){
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
      var json=null;
      if(row) {
        json=JSON.parse(row.json);
        json.id=row.id;
      }
      callnext(json);
    });
  },

  wordSplit: function(wording, langOrNull){
    var words=[]; wording.split(/[\s\.\,\(\)\[\]\{\}0-9]/).map(w => { if(w) words.push(w); });
    return words;
  },

  entryListById: function(db, termbaseID, ids, callnext){
    var sql=`select * from entries where id in(${ids})`;
    db.all(sql, {}, function(err, rows){
      if(err || !rows) rows=[];
      var entries=[];
      for(var i=0; i<rows.length; i++){
        var item={id: rows[i].id, title: rows[i].id, json: rows[i].json};
        entries.push(item);
      }
      callnext(entries);
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
        //if(modifier.indexOf(" smart ")>-1 && searchtext!="") suggestions=["jabbewocky", "dord", "gibberish", "coherence", "nonce word", "cypher", "the randomist"];;
        db.get(sql2, params2, function(err, row){
          if(err) console.log(err);
          var total=(!err && row) ? row.total : 0;
          callnext(total, primeEntries, entries, suggestions);
        });
      });
    });
  },
  composeSqlQueries: function(facets, searchtext, modifier, howmany, callnext){
    var modifiers=modifier.split(" ");
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
        var words=module.exports.wordSplit(searchtext);
        words.map((word, index) => {
          joins.push(`inner join words as w${index} on w${index}.term_id=t.id`);
          where.push(`w${index}.word=$word${index}`);
          params[`$word${index}`]=word;
        });
      }

      if(modifiers[0]!="*"){
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

    if(facets.dateStamp){
      if(facets.dateStamp=="*") where.push("e.dateStamp<>''");
      if(facets.dateStamp=="-1") where.push("(e.dateStamp='' or e.dateStamp is null)");
      if(facets.dateStamp=="before" && facets.dateStampValue){
        where.push("e.dateStamp<$fDateStamp");
        params[`$fDateStamp`]=facets.dateStampValue;
      }
      if(facets.dateStamp=="on" && facets.dateStampValue){
        where.push("e.dateStamp=$fDateStamp");
        params[`$fDateStamp`]=facets.dateStampValue;
      }
      if(facets.dateStamp=="after" && facets.dateStampValue){
        where.push("e.dateStamp>$fDateStamp");
        params[`$fDateStamp`]=facets.dateStampValue;
      }
    }

    if(facets.superdomain && facets.superdomain=="-1"){
      joins.push(`left outer join entry_domain as fDomain on fDomain.entry_id=e.id`);
      where.push(`fDomain.superdomain is null`);
    }
    else if(facets.superdomain){
      joins.push(`inner join entry_domain as fDomain on fDomain.entry_id=e.id`);
      if(facets.superdomain=="*") where.push(`fDomain.superdomain>0`);
      else { where.push(`fDomain.superdomain=$fSuperdomain`); params[`$fSuperdomain`]=parseInt(facets.superdomain); }

      if(facets.subdomain){
        if(facets.subdomain=="*") where.push(`fDomain.subdomain>0`);
        else if(facets.subdomain=="-1") where.push(`fDomain.subdomain=0`);
        else { where.push(`fDomain.subdomain=$fSubdomain`); params[`$fSubdomain`]=parseInt(facets.subdomain); }
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
        else if(facets.clarif=="-1") where.push(`f_et.clarif=''`)
        else if(facets.clarif=="txt") {
          where.push(`(f_et.clarif<>'' and f_et.clarif like $fClarif)`);
          params[`$fClarif`]="%"+facets.clarifValue+"%";
        }
      }
    }

    if(facets.intro){
      joins.push(`inner join entry_intro as f_ei on f_ei.entry_id=e.id`);
      if(facets.intro=="*") where.push(`f_ei.text<>''`)
      else if(facets.intro=="-1") where.push(`f_ei.text=''`)
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

    var params1={}; for(var key in params) params1[key]=params[key];
    var sql1=`select e.id, e.json`;
    if(searchtext!="" && modifiers[1]=="smart"){
      sql1+=`, max(case when t.wording=$searchtext_matchquality then 1 else 0 end)`;
      params1.$searchtext_matchquality=searchtext;
    } else {
      sql1+=`, 0`;
    }
    sql1+=` as match_quality\n`;
    sql1+=` from entries as e\n`;
    joins.map(s => {sql1+=" "+s+"\n"});
    sql1+=` inner join entry_sortkey as sk on sk.entry_id=e.id and sk.lang=$sortlang\n`;
    params1.$sortlang=modifiers[2];
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

    callnext(sql1, params1, sql2, params2);
  },
  cStatus: function(db, termbaseID, facets, searchtext, modifier, val, callnext){
    var items=[];
    module.exports.composeSqlQueries(facets, searchtext, modifier, null, function(sql1, params1, sql2, params2){
      db.all(sql1, params1, function(err, rows){
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
    module.exports.composeSqlQueries(facets, searchtext, modifier, null, function(sql1, params1, sql2, params2){
      db.all(sql1, params1, function(err, rows){
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
    module.exports.composeSqlQueries(facets, searchtext, modifier, null, function(sql1, params1, sql2, params2){
      db.all(sql1, params1, function(err, rows){
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
            db.run("insert into entry_extranet(entry_id, extranet) values($entry_id, $extranet)", {$entry_id: item.id, $extranet: extranetID}, function(err){
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
    module.exports.composeSqlQueries(facets, searchtext, modifier, null, function(sql1, params1, sql2, params2){
      db.all(sql1, params1, function(err, rows){
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
            db.run("delete from entry_extranet where entry_id=$entry_id and extranet=$extranet", {$entry_id: item.id, $extranet: extranetID}, function(err){
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
      module.exports.cleanUpXrefs(db, termbaseID, entryID, entry, function(entry){
        module.exports.saveTerms(db, termbaseID, entry, function(changedTerms){
        var sql=""; var params={};
        if(dowhat=="create"){
          sql="insert into entries(json, cStatus, pStatus, dateStamp) values($json, $cStatus, $pStatus, $dateStamp)";
          params={$json: JSON.stringify(entry), $cStatus: parseInt(entry.cStatus), $pStatus: parseInt(entry.pStatus), $dateStamp: entry.dateStamp};
        }
        if(dowhat=="recreate"){
          sql="insert into entries(id, json, cStatus, pStatus, dateStamp) values($id, $json, $cStatus, $pStatus, $dateStamp)";
          params={$json: JSON.stringify(entry), $id: entryID, $cStatus: parseInt(entry.cStatus), $pStatus: parseInt(entry.pStatus), $dateStamp: entry.dateStamp};
        }
        if(dowhat=="change"){
          sql="update entries set json=$json, cStatus=$cStatus, pStatus=$pStatus, dateStamp=$dateStamp where id=$id";
          params={$json: JSON.stringify(entry), $id: entryID, $cStatus: parseInt(entry.cStatus), $pStatus: parseInt(entry.pStatus), $dateStamp: entry.dateStamp};
        }
        //create or change me:
        db.run(sql, params, function(err){ if(!entryID) entryID=this.lastID;
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
    var words=module.exports.wordSplit(term.wording, term.lang);
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
      if(rows) rows.map(row => {previousTermIDs.push(row["term_id"])});
      db.run("delete from entry_term where entry_id=$entry_id", {$entry_id: entryID}, function(err, row){
        go();
      });
    });
    function go(){
      var termAssig=termAssigs.pop();
      if(termAssig) {
        db.run("insert into entry_term(entry_id, term_id, accept, clarif) values($entryID, $termID, $accept, $clarif)", {$entryID: entryID, $termID: termAssig.termID, $accept: termAssig.accept, $clarif: termAssig.clarif}, function(err, row){
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
                module.exports.saveEntrySortings(db, termbaseID, entryID, entry, function(){
                  module.exports.saveHistory(db, termbaseID, entryID, "update", email, json, historiography, function(){
                    goEntry();
                  });
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
        save();
      })
    });
    function save(){
      var obj=sortkeys.pop();
      if(obj) {
        db.run("insert into entry_sortkey(entry_id, lang, key) values($entry_id, $lang, $key)", {$entry_id: entryID, $lang: obj.lang, $key: obj.key}, function(err){
          save();
        });
      } else {
        callnext();
      }
    }
  },
  saveDomains: function(db, termbaseID, entryID, entry, callnext){
    var assigs=[]; entry.domains.map(obj => {
      if(obj.superdomain) assigs.push({
        superdomain: parseInt(obj.superdomain),
        subdomain: parseInt(obj.subdomain) || 0,
      });
    });
    db.run("delete from entry_domain where entry_id=$entryID", {$entryID: entryID}, function(err){
      go();
    });
    function go(){
      var assig=assigs.pop();
      if(assig){
        db.run("insert into entry_domain(entry_id, superdomain, subdomain) values($entryID, $superdomain, $subdomain)", {$entryID: entryID, $superdomain: assig.superdomain, $subdomain: assig.subdomain}, function(err){
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
      go();
    });
    function go(){
      var assig=assigs.pop();
      if(assig){
        db.run("insert into entry_collection(entry_id, collection) values($entryID, $collection)", {$entryID: entryID, $collection: assig}, function(err){
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
      go();
    });
    function go(){
      var assig=assigs.pop();
      if(assig){
        db.run("insert into entry_extranet(entry_id, extranet) values($entryID, $extranet)", {$entryID: entryID, $extranet: assig}, function(err){
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
      go();
    });
    function go(){
      var assig=assigs.pop();
      if(assig || assig===""){
        db.run("insert into entry_intro(entry_id, text) values($entryID, $text)", {$entryID: entryID, $text: assig}, function(err){
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
      go();
    });
    function go(){
      var assig=assigs.pop();
      if(assig){
        db.run("insert into entry_def(entry_id, text) values($entryID, $text)", {$entryID: entryID, $text: assig}, function(err){
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
      go();
    });
    function go(){
      var assig=assigs.pop();
      if(assig){
        db.run("insert into entry_xmpl(entry_id, text) values($entryID, $text)", {$entryID: entryID, $text: assig}, function(err){
          go();
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

  sharEnquire: function(db, termbaseID, termID, lang, wording, callnext){
    var data={sharedBy: [], similarTo: []};
    //find out which entries share this term:
    db.all("select e.id, e.json from entries as e inner join entry_term as et on e.id=et.entry_id where et.term_id=$termID", {$termID: termID}, function(err, rows){
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
        rows.map(row => { data.similarTo.push({termID: row.id, json: row.json}) });
        callnext(data);
      });
    });
  },
  xrefsMake: function(db, termbaseID, ids, email, historiography, callnext){
    var sql=`select * from entries where id in(${ids})`;
    ids=[]; var entries={};
    db.all(sql, {}, function(err, rows){ if(err || !rows) rows=[];
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
          module.exports.saveHistory(db, termbaseID, entryID, "update", email, json, historiography, function(){
            save();
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
    db.all(sql, {}, function(err, rows){ if(err || !rows) rows=[];
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
          module.exports.saveHistory(db, termbaseID, entryID, "update", email, json, historiography, function(){
            save();
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
    db.all(sql, {}, function(err, rows){ if(err || !rows) rows=[];
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
    db.all(sql, {}, function(err, rows){ if(err || !rows) rows=[];
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
          if(key=="cStatus" || key=="pStatus"){
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
    var sql1=`select * from metadata where type=$type order by sortkey limit $howmany`;
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
    if(type=="domain") json=module.exports.subdomainIDs(json);
    module.exports.getMetadataSortkey(db, termbaseID, json, function(sortkey){
      var sql="insert into metadata(type, json, sortkey) values($type, $json, $sortkey)";
      var params={$json: json, $type: type, $sortkey: sortkey};
      if(entryID) { sql="insert into metadata(id, type, json, sortkey) values($id, $type, $json, $sortkey)"; params.$id=entryID; }
      db.run(sql, params, function(err){
        if(!entryID) entryID=this.lastID;
        callnext(entryID, json);
      });
    });
  },
  metadataUpdate: function(db, termbaseID, type, entryID, json, callnext){
    if(type=="domain") json=module.exports.subdomainIDs(json);
    db.get("select id, json from metadata where id=$id and type=$type", {$id: entryID, $type: type}, function(err, row){
      var newJson=json;
      var oldJson=(row?row.json:"");
      if(!row) { //an entry with that ID does not exist: recreate it with that ID:
        module.exports.metadataCreate(db, termbaseID, type, entryID, json, callnext);
      } else if(oldJson==newJson) {
        callnext(entryID, json, false);
      } else {
        //update me:
        module.exports.getMetadataSortkey(db, termbaseID, json, function(sortkey){
          db.run("update metadata set json=$json, sortkey=$sortkey where id=$id and type=$type", {
            $id: entryID, $json: json, $type: type, $sortkey: sortkey
          }, function(err){
            callnext(entryID, json, true);
          });
        });
      }
    });
  },
  subdomainIDs: function(json){
    var domain=JSON.parse(json);
    var maxID=0;
    var lidless=[];
    if(domain.subdomains) walk(domain.subdomains);
    function walk(subdomains){
      subdomains.map(subdomain => {
        if(!subdomain.lid) lidless.push(subdomain); else maxID=Math.max(maxID, parseInt(subdomain.lid));
        if(subdomain.subdomains) walk(subdomain.subdomains);
      });
    }
    lidless.map(subdomain => {
      subdomain.lid=(++maxID).toString();
    });
    return JSON.stringify(domain);
  },
  getMetadataSortkey: function(db, termbaseID, json, callnext){
    var metadatum=JSON.parse(json);
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

  commentSave: function(db, termbaseID, entryID, extranetID, commentID, email, body, tagID, callnext){
    commentID=parseInt(commentID);
    //first of all, find out what we're supposed to do:
    if(!commentID) go("create"); //this is a new comment
    else db.get("select id from comments where id=$id", {$id: commentID}, function(err, row){
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
        if(!commentID) commentID=this.lastID;
        db.get("select * from comments where id=$id", {$id: commentID}, function(err, row){
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
      callnext();
    });
  },

  markdown: function(str){
    var tree=markdown.parse(str);
    str=markdown.renderJsonML(markdown.toHTMLTree(tree));
    str=str.replace("<a href=\"http", "<a target=\"_blank\" href=\"http");
    return str;
  },

  readRandoms: function(db, termbaseID, callnext){
    var limit=30;
    var sql_randoms="select wording from terms where id in (select id from terms order by random() limit $limit)"
    var sql_total="select count(*) as total from terms";
    var randoms=[];
    var more=false;
    db.all(sql_randoms, {$limit: limit}, function(err, rows){
      for(var i=0; i<rows.length; i++){
        randoms.push(rows[i].wording);
      }
      db.get(sql_total, {}, function(err, row){
        if(row.total>limit) more=true;
        callnext(more, randoms);
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

const prohibitedTermbaseIDs=["login", "logout", "make", "signup", "forgotpwd", "changepwd", "users", "termbases", "recoverpwd", "createaccount"];
