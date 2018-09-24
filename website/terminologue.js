const express=require("express");
const app=express();
const path=require("path");
const fs=require("fs");
var siteconfig=JSON.parse(fs.readFileSync(path.join(__dirname, "siteconfig.json"), "utf8"));
const https=require("https");
const bodyParser = require('body-parser');
  app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); // for parsing application/x-www-form-urlencoded
  app.use(bodyParser.json({ limit: '50mb' })); //for parsing application/json
const cookieParser = require('cookie-parser');
  app.use(cookieParser());
const url=require("url");
const querystring=require("querystring");
const PORT=process.env.PORT||siteconfig.port||80;

//ops module:
const ops=require("./ops");
 ops.siteconfig=siteconfig;

//Paths to our static files:
app.use(siteconfig.rootPath+"views", express.static(path.join(__dirname, "views")));
app.use(siteconfig.rootPath+"widgets", express.static(path.join(__dirname, "widgets")));
app.use(siteconfig.rootPath+"furniture", express.static(path.join(__dirname, "furniture")));
app.use(siteconfig.rootPath+"libs", express.static(path.join(__dirname, "libs")));
app.use(siteconfig.rootPath+"docs", express.static(path.join(__dirname, "docs")));

//Path to our views:
app.set('views', path.join(__dirname, "views")); app.set('view engine', 'ejs') //http://ejs.co/

//Temporary: téarma.ie
app.use(siteconfig.rootPath+"tearma/furniture", express.static(path.join(__dirname, "views/tearma/furniture")));
app.get(siteconfig.rootPath+"tearma/", function(req, res){
  var db=ops.getDB("bnt", true);
  ops.readTermbaseMetadata(db, "bnt", function(metadata){
    db.close();
    res.render("tearma/home.ejs", {metadata: metadata});
  });
});
app.get(siteconfig.rootPath+"tearma/s", function(req, res){
  var db=ops.getDB("bnt", true);
  ops.readTermbaseConfigs(db, req.params.dictID, function(configs){
    ops.readTermbaseMetadata(db, "bnt", function(metadata){
      ops.entryList(db, "bnt", {}, req.query.text, "* smart ga", 100, function(total, primeEntries, entries, suggestions){
        db.close();
        res.render("tearma/search.ejs", {text: req.query.text, primeEntries: primeEntries, entries: entries, suggestions: suggestions, metadata: metadata, configs: configs});
      });
    });
  });
});
app.get(siteconfig.rootPath+"tearma/adv", function(req, res){
  res.render("tearma/advsearch.ejs", {});
});
app.get(siteconfig.rootPath+"tearma/dom", function(req, res){
  var db=ops.getDB("bnt", true);
  ops.readTermbaseConfigs(db, req.params.dictID, function(configs){
    ops.readTermbaseMetadata(db, "bnt", function(metadata){
      ops.entryList(db, "bnt", {superdomain: req.query.superID, subdomain: req.query.subID}, "", "* smart ga", 100, function(total, primeEntries, entries, suggestions){
        db.close();
        res.render("tearma/domain.ejs", {metadata: metadata, superID: req.query.superID, subID: req.query.subID, entries: entries, metadata: metadata, configs: configs});
      });
    });
  });
});

//Sitewide:
app.get(siteconfig.rootPath, function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    ops.getTermbasesByUser(user.email, function(termbases){
      res.render("sitewide/home.ejs", {siteconfig: siteconfig, user: user, termbases: termbases});
    });
  });
});
app.get(siteconfig.rootPath+"login/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(/\/login\/$/.test(req.headers.referer)) req.headers.referer=null;
    res.render("sitewide/login.ejs", {user: user, redirectUrl: req.headers.referer || siteconfig.baseUrl, siteconfig: siteconfig});
  });
});
app.get(siteconfig.rootPath+"logout/", function(req, res){
  ops.logout(req.cookies.email, req.cookies.sessionkey, function(){
    res.clearCookie("email");
    res.clearCookie("sessionkey");
    if(/\/logout\/$/.test(req.headers.referer)) req.headers.referer=null;
    res.redirect(req.headers.referer || siteconfig.baseUrl);
  });
});
app.get(siteconfig.rootPath+"endpoints.html", function(req, res){
  res.render("sitewide/endpoints.ejs", {siteconfig: siteconfig});
});
app.post(siteconfig.rootPath+"login.json", function(req, res){
  ops.login(req.body.email, req.body.password, function(success, email, sessionkey){
    if(success) {
      const oneday=86400000; //86,400,000 miliseconds = 24 hours
      res.cookie("email", email, {expires: new Date(Date.now() + oneday)});
      res.cookie("sessionkey", sessionkey, {expires: new Date(Date.now() + oneday)});
      res.json({success: true, sessionkey: sessionkey});
    } else {
      res.json({success: false});
    }
  });
});

//Termbase home:
app.get(siteconfig.rootPath+":termbaseID/", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    ops.readTermbaseConfigs(db, req.params.dictID, function(configs){
      db.close();
      configs.ident.blurb=ops.markdown(configs.ident.blurb);
      res.render("termbase/home.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs});
    });
  });
});

//Termbase editing:
app.get(siteconfig.rootPath+":termbaseID/edit/", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.redirect(siteconfig.baseUrl+req.params.termbaseID+"/");
    } else {
      ops.readTermbaseConfigs(db, req.params.dictID, function(configs){
        ops.readTermbaseMetadata(db, req.params.dictID, function(metadata){
          db.close();
          res.render("termbase-edit/navigator.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, termbaseMetadata: metadata});
        });
      });
    }
  });
});
app.get(siteconfig.rootPath+":termbaseID/edit/editor.html", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.redirect("about:blank");
    } else {
      ops.readTermbaseConfigs(db, req.params.termbaseID, function(configs){
        db.close();
        res.render("termbase-edit/editor.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs});
      });
    }
  });
});
app.get(siteconfig.rootPath+":termbaseID/edit/endpoints.html", function(req, res){
  res.render("termbase-edit/endpoints.ejs", {siteconfig: siteconfig});
});
app.post(siteconfig.rootPath+":termbaseID/edit/list.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.entryList(db, req.params.termbaseID, req.body.facets, req.body.searchtext, req.body.modifier, req.body.howmany, function(total, primeEntries, entries, suggestions){
        db.close();
        res.json({success: true, total: total, primeEntries: primeEntries, entries: entries, suggestions: suggestions});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/edit/create.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!true) { //user.canEdit
      db.close();
      res.json({success: false});
    } else {
      ops.entrySave(db, req.params.termbaseID, null, req.body.content, user.email, {}, function(entryID){
        ops.entryRead(db, req.params.termbaseID, entryID, function(adjustedEntryID, json){
          db.close();
          res.json({success: true, id:adjustedEntryID, content: json});
        });
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/edit/read.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.entryRead(db, req.params.termbaseID, req.body.id, function(adjustedEntryID, json){
        db.close();
        res.json({success: (adjustedEntryID>0), id: adjustedEntryID, content: json});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/edit/update.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!true) { //user.canEdit
      db.close();
      res.json({success: false});
    } else {
      ops.entrySave(db, req.params.termbaseID, req.body.id, req.body.content, user.email, {}, function(adjustedEntryID){
        ops.entryRead(db, req.params.termbaseID, adjustedEntryID, function(adjustedEntryID, json){
          db.close();
          res.json({success: true, id:adjustedEntryID, content: json});
        });
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/edit/delete.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!true) { //user.canEdit
      db.close();
      res.json({success: false});
    } else {
      ops.entryDelete(db, req.params.termbaseID, req.body.id, user.email, {}, function(){
        db.close();
        res.json({success: true, id: req.body.id});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/edit/history.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    ops.entryHistory(db, req.params.termbaseID, req.body.id, function(history){
      if(!true) { //user can view history?
        db.close();
        res.json([]);
      } else {
        db.close();
        res.json(history);
      }
    });
  })
});

//Term sharing:
app.post(siteconfig.rootPath+":termbaseID/edit/sharEnquire.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    ops.sharEnquire(db, req.params.termbaseID, req.body.termID, req.body.lang, req.body.wording, function(data){
      db.close();
      res.json(data);
    });
  })
});

//Termbase config:
app.get(siteconfig.rootPath+":termbaseID/config/", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.redirect(siteconfig.baseUrl+req.params.termbaseID+"/");
    } else {
      ops.readTermbaseConfigs(db, req.params.dictID, function(configs){
        db.close();
        res.render("termbase-config/home.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs});
      });
    }
  });
});
app.get(siteconfig.rootPath+":termbaseID/config/:configType/", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.redirect(siteconfig.baseUrl+req.params.termbaseID+"/");
    } else {
      ops.readTermbaseConfigs(db, req.params.dictID, function(configs){
        db.close();
        res.render("termbase-config/editor.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, configType: req.params.configType});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/config/read.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.configRead(db, req.params.termbaseID, req.body.id, function(config){
        db.close();
        res.json({success: true, id: req.body.id, content: config});
      });
    }
  })
});
app.post(siteconfig.rootPath+":termbaseID/config/update.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.configUpdate(db, req.params.termbaseID, req.body.id, req.body.content, function(adjustedJson, resaveNeeded){
        db.close();
        var redirUrl=null; if(resaveNeeded) redirUrl="../../resave/";
        res.json({success: true, id: req.body.id, content: adjustedJson, redirUrl: redirUrl});
      });
    }
  });
});

//Termbase metadata:
app.get(siteconfig.rootPath+":termbaseID/metadata/", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.redirect(siteconfig.baseUrl+req.params.termbaseID+"/");
    } else {
      ops.readTermbaseConfigs(db, req.params.dictID, function(configs){
        db.close();
        res.render("termbase-metadata/home.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs});
      });
    }
  });
});
app.get(siteconfig.rootPath+":termbaseID/metadata/:metadataType/", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.redirect(siteconfig.baseUrl+req.params.termbaseID+"/");
    } else {
      ops.readTermbaseConfigs(db, req.params.dictID, function(configs){
        db.close();
        res.render("termbase-metadata/navigator.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, metadataType: req.params.metadataType});
      });
    }
  });
});
app.get(siteconfig.rootPath+":termbaseID/metadata/:metadataType/editor.html", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.redirect("about:blank");
    } else {
      ops.readTermbaseConfigs(db, req.params.termbaseID, function(configs){
        db.close();
        res.render("termbase-metadata/editor.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, metadataType: req.params.metadatType});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/metadata/:metadataType/list.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.metadataList(db, req.params.termbaseID, req.params.metadataType, req.body.facets, req.body.searchtext, req.body.modifier, req.body.howmany, function(total, entries){
        db.close();
        res.json({success: true, total: total, entries: entries});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/metadata/:metadataType/create.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!true) { //user.canEdit
      db.close();
      res.json({success: false});
    } else {
      ops.metadataCreate(db, req.params.termbaseID, req.params.metadataType, null, req.body.content, function(entryID, adjustedJson){
        db.close();
        res.json({success: true, id: entryID, content: adjustedJson});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/metadata/:metadataType/read.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.metadataRead(db, req.params.termbaseID, req.params.metadataType, req.body.id, function(adjustedEntryID, json){
        db.close();
        res.json({success: (adjustedEntryID>0), id: adjustedEntryID, content: json});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/metadata/:metadataType/update.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!true) { //user.canEdit
      db.close();
      res.json({success: false});
    } else {
      ops.metadataUpdate(db, req.params.termbaseID, req.params.metadataType, req.body.id, req.body.content, function(adjustedEntryID, adjustedJson, changed){
        db.close();
        res.json({success: true, id: adjustedEntryID, content: adjustedJson});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/metadata/:metadataType/delete.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!true) { //user.canEdit
      db.close();
      res.json({success: false});
    } else {
      ops.metadataDelete(db, req.params.termbaseID, req.params.metadataType, req.body.id, function(){
        db.close();
        res.json({success: true, id: req.body.id});
      });
    }
  });
});

app.use(function(req, res){ res.status(404).render("404.ejs", {siteconfig: siteconfig}); });
app.listen(PORT);
console.log("Process ID "+process.pid+" is now listening on port number "+PORT+".");
