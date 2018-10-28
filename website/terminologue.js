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
const localizer={
  en: require("./localizer/en.js"),
  ga: require("./localizer/ga.js"),
};

//ops module:
const ops=require("./ops");
 ops.siteconfig=siteconfig;

//Paths to our static files:
app.use(siteconfig.rootPath+"views", express.static(path.join(__dirname, "views")));
app.use(siteconfig.rootPath+"widgets", express.static(path.join(__dirname, "widgets")));
app.use(siteconfig.rootPath+"furniture", express.static(path.join(__dirname, "furniture")));
app.use(siteconfig.rootPath+"libs", express.static(path.join(__dirname, "libs")));
app.use(siteconfig.rootPath+"docs", express.static(path.join(__dirname, "docs")));
app.use(siteconfig.rootPath+"localizer", express.static(path.join(__dirname, "localizer")));

//Path to our views:
app.set('views', path.join(__dirname, "views")); app.set('view engine', 'ejs') //http://ejs.co/

//Temporary: téarma.ie
app.use(siteconfig.rootPath+"_tearma/furniture", express.static(path.join(__dirname, "views/_tearma/furniture")));
app.get(siteconfig.rootPath+"_tearma/", function(req, res){
  var db=ops.getDB("bnt", true);
  ops.readTermbaseMetadata(db, "bnt", function(metadata){
    db.close();
    res.render("_tearma/home.ejs", {metadata: metadata});
  });
});
app.get(siteconfig.rootPath+"_tearma/s", function(req, res){
  var db=ops.getDB("bnt", true);
  ops.readTermbaseConfigs(db, req.params.dictID, function(configs){
    ops.readTermbaseMetadata(db, "bnt", function(metadata){
      ops.entryList(db, "bnt", {}, req.query.text, "* smart ga", 100, function(total, primeEntries, entries, suggestions){
        db.close();
        res.render("_tearma/search.ejs", {text: req.query.text, primeEntries: primeEntries, entries: entries, suggestions: suggestions, metadata: metadata, configs: configs});
      });
    });
  });
});
app.get(siteconfig.rootPath+"_tearma/adv", function(req, res){
  res.render("_tearma/advsearch.ejs", {});
});
app.get(siteconfig.rootPath+"_tearma/dom", function(req, res){
  var db=ops.getDB("bnt", true);
  ops.readTermbaseConfigs(db, req.params.dictID, function(configs){
    ops.readTermbaseMetadata(db, "bnt", function(metadata){
      ops.entryList(db, "bnt", {superdomain: req.query.superID, subdomain: req.query.subID}, "", "* smart ga", 100, function(total, primeEntries, entries, suggestions){
        db.close();
        res.render("_tearma/domain.ejs", {metadata: metadata, superID: req.query.superID, subID: req.query.subID, entries: entries, metadata: metadata, configs: configs});
      });
    });
  });
});

//Sitewide:
app.get(siteconfig.rootPath, function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    ops.getTermbasesByUser(user.email, function(termbases){
      var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
      res.render("sitewide/home.ejs", {siteconfig: siteconfig, user: user, termbases: termbases, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
    });
  });
});
app.get(siteconfig.rootPath+"login/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(/\/login\/$/.test(req.headers.referer)) req.headers.referer=null;
    res.render("sitewide/login.ejs", {user: user, redirectUrl: req.headers.referer || siteconfig.baseUrl, siteconfig: siteconfig, uilang: user.uilang || req.cookies.uilang || siteconfig.uilangDefault, uilangs: siteconfig.uilangs});
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
  ops.login(req.body.email, req.body.password, req.cookies.uilang || siteconfig.uilangDefault, function(success, email, sessionkey){
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
app.get(siteconfig.rootPath+"uilang", function(req, res){
  var redirTo=req.headers.referer || siteconfig.baseUrl;
  const oneday=86400000; //86,400,000 miliseconds = 24 hours
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.loggedin){
      res.cookie("uilang", req.query.lang, {expires: new Date(Date.now() + oneday)});
      res.redirect(redirTo);
    } else {
      ops.saveUilang(req.cookies.email, req.query.lang, function(){
        res.cookie("uilang", req.query.lang, {expires: new Date(Date.now() + oneday)});
        res.redirect(redirTo);
      });
    }
  });
});

//Termbase home:
app.get(siteconfig.rootPath+":termbaseID/", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    ops.readTermbaseConfigs(db, req.params.termbaseID, function(configs){
      db.close();
      var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
      configs.ident.blurb=ops.markdown(configs.ident.blurb[uilang] || configs.ident.blurb.$);
      ops.readExtranetsByUser(db, req.params.termbaseID, user.email, function(extranets){
        res.render("termbase/home.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L, extranets: extranets});
      });
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
          var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
          res.render("termbase-edit/navigator.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, termbaseMetadata: metadata, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
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
        res.render("termbase-edit/editor.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, uilang: user.uilang, uilangs: siteconfig.uilangs});
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
        var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
        res.render("termbase-config/home.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
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
        var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
        res.render("termbase-config/editor.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, configType: req.params.configType, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
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

//Termbase admin/metadata:
app.get(siteconfig.rootPath+":termbaseID/admin/", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.redirect(siteconfig.baseUrl+req.params.termbaseID+"/");
    } else {
      ops.readTermbaseConfigs(db, req.params.dictID, function(configs){
        db.close();
        var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
        res.render("termbase-admin/home.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
      });
    }
  });
});
app.get(siteconfig.rootPath+":termbaseID/admin/:metadataType/", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.redirect(siteconfig.baseUrl+req.params.termbaseID+"/");
    } else {
      ops.readTermbaseConfigs(db, req.params.dictID, function(configs){
        db.close();
        var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
        res.render("termbase-admin/navigator.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, metadataType: req.params.metadataType, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
      });
    }
  });
});
app.get(siteconfig.rootPath+":termbaseID/admin/:metadataType/editor.html", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.redirect("about:blank");
    } else {
      ops.readTermbaseConfigs(db, req.params.termbaseID, function(configs){
        db.close();
        var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
        res.render("termbase-admin/editor.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, metadataType: req.params.metadatType, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/admin/:metadataType/list.json", function(req, res){
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
app.post(siteconfig.rootPath+":termbaseID/admin/:metadataType/create.json", function(req, res){
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
app.post(siteconfig.rootPath+":termbaseID/admin/:metadataType/read.json", function(req, res){
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
app.post(siteconfig.rootPath+":termbaseID/admin/:metadataType/update.json", function(req, res){
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
app.post(siteconfig.rootPath+":termbaseID/admin/:metadataType/delete.json", function(req, res){
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

//Extranet entries:
app.get(siteconfig.rootPath+":termbaseID/x:xnetID/", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndXnetAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, req.params.xnetID, function(user, xnet){
    if(!user.xnetAccess) {
      db.close();
      res.redirect(siteconfig.baseUrl+req.params.termbaseID+"/");
    } else {
      ops.readTermbaseConfigs(db, req.params.dictID, function(configs){
        ops.readTermbaseMetadata(db, req.params.dictID, function(metadata){
          db.close();
          var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
          res.render("xnet/navigator.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, termbaseMetadata: metadata, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L, xnet: xnet});
        });
      });
    }
  });
});
app.get(siteconfig.rootPath+":termbaseID/x:xnetID/editor.html", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndXnetAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, req.params.xnetID, function(user){
    if(!user.xnetAccess) {
      db.close();
      res.redirect("about:blank");
    } else {
      ops.readTermbaseConfigs(db, req.params.termbaseID, function(configs){
        db.close();
        res.render("xnet/editor.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, uilang: user.uilang, uilangs: siteconfig.uilangs});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/x:xnetID/list.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndXnetAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, req.params.xnetID, function(user){
    if(!user.xnetAccess) {
      db.close();
      res.json({success: false});
    } else {
      var facets=req.body.facets || {};
      facets.extranet=req.params.xnetID;
      ops.entryList(db, req.params.termbaseID, facets, req.body.searchtext, req.body.modifier, req.body.howmany, function(total, primeEntries, entries, suggestions){
        db.close();
        res.json({success: true, total: total, primeEntries: primeEntries, entries: entries, suggestions: suggestions});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/x:xnetID/read.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndXnetAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, req.params.xnetID, function(user){
    if(!user.xnetAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.entryRead(db, req.params.termbaseID, req.body.id, function(adjustedEntryID, json){
        db.close();
        var entry=JSON.parse(json);
        if(!entry.extranets || entry.extranets.indexOf(req.params.xnetID)==-1){
          res.json({success: false});
        } else {
          res.json({success: (adjustedEntryID>0), id: adjustedEntryID, content: json});
        }
      });
    }
  });
});

//Extranet comments:
app.post(siteconfig.rootPath+":termbaseID/x:xnetID/commentSave.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, false);
  ops.verifyLoginAndXnetAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, req.params.xnetID, function(user){
    if(!user.xnetAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.commentSave(db, req.params.termbaseID, req.body.entryID, req.params.xnetID, req.body.commentID, req.body.userID, req.body.body, function(commentID, when, body, bodyMarkdown){
        db.close();
        res.json({success: true, commentID: commentID, when: when, body: body, bodyMarkdown: bodyMarkdown});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/x:xnetID/commentList.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, false);
  ops.verifyLoginAndXnetAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, req.params.xnetID, function(user){
    if(!user.xnetAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.commentList(db, req.params.termbaseID, req.body.entryID, req.params.xnetID, function(comments){
        db.close();
        res.json({success: true, comments: comments});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/x:xnetID/commentDelete.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, false);
  ops.verifyLoginAndXnetAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, req.params.xnetID, function(user){
    if(!user.xnetAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.commentDelete(db, req.params.termbaseID, req.params.xnetID, req.body.commentID, function(){
        db.close();
        res.json({success: true});
      });
    }
  });
});

//Extranet comments viewed from the edit screen:
app.post(siteconfig.rootPath+":termbaseID/edit/commentPeek.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, false);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.commentPeek(db, req.params.termbaseID, req.body.entryID, null, function(hasComments){
        db.close();
        res.json({success: true, hasComments: hasComments});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/edit/commentList.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, false);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.commentList(db, req.params.termbaseID, req.body.entryID, null, function(comments){
        db.close();
        res.json({success: true, comments: comments});
      });
    }
  });
});

app.use(function(req, res){ res.status(404).render("404.ejs", {siteconfig: siteconfig}); });
app.listen(PORT);
console.log("Process ID "+process.pid+" is now listening on port number "+PORT+".");
