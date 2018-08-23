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
app.use(siteconfig.rootPath+"widgets", express.static(path.join(__dirname, "widgets")));
app.use(siteconfig.rootPath+"furniture", express.static(path.join(__dirname, "furniture")));
app.use(siteconfig.rootPath+"libs", express.static(path.join(__dirname, "libs")));
app.use(siteconfig.rootPath+"docs", express.static(path.join(__dirname, "docs")));

//Path to our views:
app.set('views', path.join(__dirname, "views")); app.set('view engine', 'ejs') //http://ejs.co/

//Sitewide JSON endpoints:
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
//Sitewide UI:
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

//Termbase UI:
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

//Termbase editing JSON endpoints:
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
      ops.entryList(db, req.params.termbaseID, req.body.facets, req.body.searchtext, req.body.modifier, req.body.howmany, function(total, entries){
        db.close();
        res.json({success: true, total: total, entries: entries});
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
      ops.entryCreate(db, req.params.termbaseID, null, req.body.content, user.email, {}, function(entryID, adjustedJson){
        db.close();
        res.json({success: true, id: entryID, content: adjustedJson});
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
      ops.entryUpdate(db, req.params.termbaseID, req.body.id, req.body.content, user.email, {}, function(adjustedEntryID, adjustedJson, changed){
        db.close();
        res.json({success: true, id: adjustedEntryID, content: adjustedJson});
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
//Termbase editing UI:
app.get(siteconfig.rootPath+":termbaseID/edit/", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.redirect(siteconfig.baseUrl+req.params.termbaseID+"/");
    } else {
      ops.readTermbaseConfigs(db, req.params.dictID, function(configs){
        db.close();
        res.render("termbase-edit/navigator.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs});
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




app.use(function(req, res){ res.status(404).render("404.ejs", {siteconfig: siteconfig}); });
app.listen(PORT);
console.log("Process ID "+process.pid+" is now listening on port number "+PORT+".");
