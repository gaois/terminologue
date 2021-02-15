const express=require("express");
const app=express();
const path=require("path");
const fs=require("fs-extra");
var siteconfig=JSON.parse(fs.readFileSync(path.join(__dirname, "siteconfig.json"), "utf8").trim());
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
  cs: require("./localizer/cs.js"),
  sv: require("./localizer/sv.js"),
  cy: require("./localizer/cy.js"),
  fi: require("./localizer/fi.js"),
  nl: require("./localizer/nl.js"),
  ru: require("./localizer/ru.js"),
  es: require("./localizer/es.js"),
};

//our uploader:
const multer = require("multer");
const upload = multer({ dest: path.join(siteconfig.dataDir, "uploads/") });

//ops module:
const ops=require("./ops");
 ops.siteconfig=siteconfig;
const nodemailer=require('nodemailer');
 ops.mailtransporter=nodemailer.createTransport(siteconfig.mailconfig);
const propagator=require("./propagator.js");
 ops.propagator=propagator.withMsSqlConnectionStrings(siteconfig.propagatorMsSqlConnectionStrings);

 //configure e-mail service:
if (!!siteconfig.mailconfig && !!siteconfig.mailconfig.provider && siteconfig.mailconfig.provider === "SendGrid") {
  const sgMail=require('@sendgrid/mail');
  sgMail.setApiKey(siteconfig.mailconfig.apiKey);
   ops.mailtransporter={
    sendMail: async (opts, cb) => {
      sgMail
       .send(opts)
       .then(() => cb(false, opts))
       .catch((err) => cb(true, err));
    }
   }
} else {
  const nodemailer=require('nodemailer');
   ops.mailtransporter=nodemailer.createTransport(siteconfig.mailconfig);
}

//Paths to our static files:
app.use(siteconfig.rootPath+"views", express.static(path.join(__dirname, "views")));
app.use(siteconfig.rootPath+"widgets", express.static(path.join(__dirname, "widgets")));
app.use(siteconfig.rootPath+"furniture", express.static(path.join(__dirname, "furniture")));
app.use(siteconfig.rootPath+"libs", express.static(path.join(__dirname, "libs")));
app.use(siteconfig.rootPath+"docs", express.static(path.join(__dirname, "docs")));
app.use(siteconfig.rootPath+"localizer", express.static(path.join(__dirname, "localizer")));

//Path to our views:
app.set('views', path.join(__dirname, "views")); app.set('view engine', 'ejs') //http://ejs.co/

//Make sure all non-file GET requests have slahes at the end:
app.get(/^\/.*$/, function(req, res, next) {
  if(!req.path.endsWith("/") && req.path.indexOf(".")==-1){
    var url=req.path+"/";
    var qs=querystring.stringify(req.query);
    if(qs!="") url+="?"+qs;
    res.redirect(301, url);
  }
  else {
    next();
  }
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
    var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
    res.render("sitewide/login.ejs", {siteconfig: siteconfig, user: user, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L, redirectUrl: req.headers.referer || siteconfig.baseUrl});
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
app.get(siteconfig.rootPath+"make/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.loggedin) res.redirect("/"); else {
      ops.suggestTermbaseID(function(suggested){
        var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
        res.render("sitewide/make.ejs", {siteconfig: siteconfig, user: user, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L, suggested: suggested});
      });
    }
  });
});
app.post(siteconfig.rootPath+"make.json", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.loggedin) res.redirect(siteconfig.baseUrl); else {
      ops.makeTermbase(req.body.url, req.body.template, req.body.title, "", user.email, function(success){
        res.json({success: success});
      });
    }
  });
});
app.get(siteconfig.rootPath+"signup/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
    res.render("sitewide/signup.ejs", {siteconfig: siteconfig, user: user, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
  });
});
app.post(siteconfig.rootPath+"signup.json", function(req, res){
  var remoteip = ops.getRemoteAddress(req);
  var uilang=req.cookies.uilang || siteconfig.uilangDefault;
  var mailSubject=localizer[uilang].L("Terminologue signup");
  var mailText=localizer[uilang].L("Please follow the link below to create your Terminologue account:");
  ops.sendSignupToken(req.body.email, remoteip, mailSubject, mailText, function(success){
    res.json({success: success});
  });
});
app.get(siteconfig.rootPath+"changepwd/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(/\/changepwd\/$/.test(req.headers.referer)) req.headers.referer=null;
    var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
    res.render("sitewide/changepwd.ejs", {user: user, redirectUrl: req.headers.referer || siteconfig.baseUrl, siteconfig: siteconfig, user: user, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
  });
});
app.post(siteconfig.rootPath+"changepwd.json", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.loggedin) res.redirect(siteconfig.baseUrl); else {
      ops.changePwd(user.email, req.body.password, function(success){
        res.json({success: success});
      });
    }
  });
});
app.get(siteconfig.rootPath+"forgotpwd/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
    res.render("sitewide/forgotpwd.ejs", {user: user, redirectUrl: siteconfig.baseUrl, siteconfig: siteconfig, user: user, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
  });
});
app.post(siteconfig.rootPath+"forgotpwd.json", function(req, res){
  var remoteip = ops.getRemoteAddress(req);
  var uilang=req.cookies.uilang || siteconfig.uilangDefault;
  var mailSubject=localizer[uilang].L("Terminologue password reset");
  var mailText=localizer[uilang].L("Please follow the link below to reset your Terminologue password:");
  ops.sendToken(req.body.email, remoteip, mailSubject, mailText, function(success){
    res.json({success: success});
  });
});
app.get(siteconfig.rootPath+"createaccount/:token/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    ops.verifyToken(req.params.token, "register", function(valid){
      var tokenValid = valid;
      var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
      res.render("sitewide/createaccount.ejs", {user: user, redirectUrl: siteconfig.baseUrl, siteconfig: siteconfig, token: req.params.token, tokenValid: tokenValid, user: user, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
    });
  });
});
app.post(siteconfig.rootPath+"createaccount.json", function(req, res){
  var remoteip = ops.getRemoteAddress(req);
  ops.createAccount(req.body.token, req.body.password, remoteip, function(success){
    res.json({success: success});
  });
});
app.get(siteconfig.rootPath+"recoverpwd/:token/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    ops.verifyToken(req.params.token, "recovery", function(valid){
      var tokenValid = valid;
      var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
      res.render("sitewide/recoverpwd.ejs", {user: user, redirectUrl: siteconfig.baseUrl, siteconfig: siteconfig, token: req.params.token, tokenValid: tokenValid, user: user, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
    });
  });
});
app.post(siteconfig.rootPath+"recoverpwd.json", function(req, res){
  var remoteip = ops.getRemoteAddress(req);
  ops.resetPwd(req.body.token, req.body.password, remoteip, function(success){
    res.json({success: success});
  });
});

//Docs:
app.get(siteconfig.rootPath+"docs/:docID.:uilang/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    var uilang=req.params.uilang;

    const oneday=86400000; //86,400,000 miliseconds = 24 hours
    res.cookie("uilang", uilang, {expires: new Date(Date.now() + oneday)});
    if(user.loggedin) ops.saveUilang(req.cookies.email, uilang, function(){});

    ops.getDoc(req.params.docID, uilang, function(doc){
      res.render("sitewide/doc.ejs", {doc: doc, siteconfig: siteconfig, user: user, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
    });
  });
});
app.get(siteconfig.rootPath+"docs/:docID/", function(req, res){
  res.redirect(siteconfig.rootPath+`docs/${req.params.docID}.en/`);
});

//Users:
app.get(siteconfig.rootPath+"users/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.isAdmin) res.redirect(siteconfig.baseUrl); else {
      var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
      res.render("users/navigator.ejs", {user: user, siteconfig: siteconfig, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
    }
  });
});
app.get(siteconfig.rootPath+"users/editor.html", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.isAdmin) res.redirect("about:blank"); else {
      var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
      res.render("users/editor.ejs", {user: user, siteconfig: siteconfig, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
    }
  });
});
app.post(siteconfig.rootPath+"users/list.json", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.isAdmin) res.json({success: false}); else {
      ops.listUsers(req.body.searchtext, req.body.howmany, function(total, entries){
        res.json({success: true, total: total, entries: entries});
      });
    }
  });
});
app.post(siteconfig.rootPath+"users/create.json", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.isAdmin) res.json({success: false}); else {
      ops.createUser(req.body.content, function(entryID, adjustedXml){
        res.json({success: true, id: entryID, content: adjustedXml});
      })
    }
  });
});
app.post(siteconfig.rootPath+"users/read.json", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.isAdmin) res.json({success: false}); else {
      ops.readUser(req.body.id, function(adjustedEntryID, xml){
        res.json({success: (adjustedEntryID!=""), id: adjustedEntryID, content: xml});
      });
    }
  });
});
app.post(siteconfig.rootPath+"users/update.json", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.isAdmin) res.json({success: false}); else {
      ops.updateUser(req.body.id, req.body.content, function(adjustedEntryID, adjustedXml){
        res.json({success: true, id: adjustedEntryID, content: adjustedXml});
      });
    }
  });
});
app.post(siteconfig.rootPath+"users/delete.json", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.isAdmin) res.json({success: false}); else {
      ops.deleteUser(req.body.id, function(){
        res.json({success: true, id: req.body.id});
      });
    }
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
      ops.readTermbaseConfigs(db, req.params.termbaseID, function(configs){
        ops.readTermbaseMetadata(db, req.params.termbaseID, function(metadata){
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
        ops.todNextAvailableDate(db, req.params.termbaseID, function(todNextAvailableDate){
          db.close();
          res.render("termbase-edit/editor.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, uilang: user.uilang, uilangs: siteconfig.uilangs, todNextAvailableDate: todNextAvailableDate});
        });
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
      ops.entryList(db, req.params.termbaseID, req.body.facets, req.body.searchtext, req.body.modifier, req.body.page, req.body.pageSize, function(total, pages, page, pageSize, primeEntries, entries, suggestions){
        db.close();
        res.json({success: true, total: total, pages: pages, page: page, pageSize: pageSize, primeEntries: primeEntries, entries: entries, suggestions: suggestions});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/edit/listById.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.json({success: false});
    } else {
      //if(req.body.id) req.body.ids=[req.body.id];
      ops.entryListById(db, req.params.termbaseID, req.body.ids, function(entries){
        db.close();
        res.json({success: true, entries: entries});
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
      var entryID=req.body.id || req.query.id;
      ops.entryRead(db, req.params.termbaseID, entryID, function(adjustedEntryID, json){
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
app.post(siteconfig.rootPath+":termbaseID/edit/xrefsMake.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, false);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess){
      db.close();
      res.json({success: false});
    } else {
      ops.xrefsMake(db, req.params.termbaseID, req.body.ids, req.cookies.email, {}, function(){
        db.close();
        res.json({success: true});
      });
    }
  })
});
app.post(siteconfig.rootPath+":termbaseID/edit/xrefsBreak.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, false);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess){
      db.close();
      res.json({success: false});
    } else {
      ops.xrefsBreak(db, req.params.termbaseID, req.body.ids, req.cookies.email, {}, function(){
        db.close();
        res.json({success: true});
      });
    }
  })
});
app.post(siteconfig.rootPath+":termbaseID/edit/merge.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, false);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess){
      db.close();
      res.json({success: false});
    } else {
      ops.merge(db, req.params.termbaseID, req.body.ids, req.cookies.email, {}, function(){
        db.close();
        res.json({success: true});
      });
    }
  })
});
app.post(siteconfig.rootPath+":termbaseID/edit/cStatus.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, false);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.cStatus(db, req.params.termbaseID, req.body.facets, req.body.searchtext, req.body.modifier, req.query.val, function(){
        db.close();
        res.json({success: true});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/edit/pStatus.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, false);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.pStatus(db, req.params.termbaseID, req.body.facets, req.body.searchtext, req.body.modifier, req.query.val, function(){
        db.close();
        res.json({success: true});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/edit/extranetAdd.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, false);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.extranetAdd(db, req.params.termbaseID, req.body.facets, req.body.searchtext, req.body.modifier, req.query.extranetID, function(){
        db.close();
        res.json({success: true});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/edit/extranetRemove.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, false);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.extranetRemove(db, req.params.termbaseID, req.body.facets, req.body.searchtext, req.body.modifier, req.query.extranetID, function(){
        db.close();
        res.json({success: true});
      });
    }
  });
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

//Termbase admin:
app.get(siteconfig.rootPath+":termbaseID/admin/", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess || (user.level<4 && !user.isAdmin)) {
      db.close();
      res.redirect(req.headers.referer || siteconfig.baseUrl+req.params.termbaseID+"/");
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
    if(!user.termbaseAccess || (user.level<4 && !user.isAdmin)) {
      db.close();
      res.redirect(siteconfig.baseUrl+req.params.termbaseID+"/");
    } else {
      ops.readTermbaseConfigs(db, req.params.dictID, function(configs){
        ops.readTermbaseMetadata(db, req.params.termbaseID, function(metadata){
          db.close();
          var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
          res.render("termbase-admin/navigator.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, termbaseMetadata: metadata, metadataType: req.params.metadataType, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
        });
      });
    }
  });
});
app.get(siteconfig.rootPath+":termbaseID/admin/:metadataType/editor.html", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess || (user.level<4 && !user.isAdmin)) {
      db.close();
      res.redirect("about:blank");
    } else {
      ops.readTermbaseConfigs(db, req.params.termbaseID, function(configs){
        db.close();
        var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
        res.render("termbase-admin/editor.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, metadataType: req.params.metadataType, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
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
app.post(siteconfig.rootPath+":termbaseID/admin/:metadataType/listHierarchy.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.metadataListHierarchy(db, req.params.termbaseID, req.params.metadataType, req.body.parentID, function(total, parentEntries, entries){
        db.close();
        res.json({success: true, total: total, parentEntries: parentEntries, entries: entries});
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
        ops.readTermbaseMetadata(db, req.params.termbaseID, function(metadata){
          db.close();
          res.json({success: true, id: entryID, content: adjustedJson, metadata: metadata});
        });
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
        ops.readTermbaseMetadata(db, req.params.termbaseID, function(metadata){
          db.close();
          res.json({success: true, id: adjustedEntryID, content: adjustedJson, metadata: metadata});
        });
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
        ops.readTermbaseMetadata(db, req.params.termbaseID, function(metadata){
          db.close();
          res.json({success: true, id: req.body.id, metadata: metadata});
        });
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
      facets.email=user.email;
      ops.entryList(db, req.params.termbaseID, facets, req.body.searchtext, req.body.modifier, req.body.page, req.body.pageSize, function(total, pages, page, pageSize, primeEntries, entries, suggestions){
        db.close();
        res.json({success: true, total: total, pages: pages, page: page, pageSize: pageSize, primeEntries: primeEntries, entries: entries, suggestions: suggestions});
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
      var entryID=req.body.id || req.query.id;
      ops.entryRead(db, req.params.termbaseID, entryID, function(adjustedEntryID, json){
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

//Comments viewed from an extranet:
app.post(siteconfig.rootPath+":termbaseID/x:xnetID/commentSave.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, false);
  ops.verifyLoginAndXnetAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, req.params.xnetID, function(user){
    if(!user.xnetAccess) {
      db.close();
      res.json({success: false});
    } else {
      console.log(req.body.tagID);
      ops.commentSave(db, req.params.termbaseID, req.body.entryID, req.params.xnetID, req.body.commentID, req.body.userID, req.body.body, req.body.tagID, function(commentID, when, body, bodyMarkdown, extranetID, tagID){
        console.log(tagID);
        db.close();
        res.json({success: true, commentID: commentID, when: when, body: body, bodyMarkdown: bodyMarkdown, tagID: tagID, extranetID: extranetID});
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

//Comments viewed from the edit screen:
app.post(siteconfig.rootPath+":termbaseID/edit/commentPeek.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, false);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.commentPeek(db, req.params.termbaseID, req.body.entryID, null, function(numComments){
        db.close();
        res.json({success: true, numComments: numComments});
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
app.post(siteconfig.rootPath+":termbaseID/edit/commentSave.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, false);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.commentSave(db, req.params.termbaseID, req.body.entryID, null, req.body.commentID, req.body.userID, req.body.body, req.body.tagID, function(commentID, when, body, bodyMarkdown, extranetID, tagID){
        db.close();
        res.json({success: true, commentID: commentID, when: when, body: body, bodyMarkdown: bodyMarkdown, extranetID: extranetID, tagID: tagID});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/edit/commentDelete.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, false);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.commentDelete(db, req.params.termbaseID, null, req.body.commentID, function(){
        db.close();
        res.json({success: true});
      });
    }
  });
});

//Termbase home (and search):
app.get(siteconfig.rootPath+":termbaseID/", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    ops.readTermbaseConfigs(db, req.params.termbaseID, function(configs){
      var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
      if(req.query.q){
        //search results page:
        ops.pubSearch(db, req.params.termbaseID, req.query.q, (req.query.p || 1), function(results){
          db.close();
          res.render("termbase/search.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L, results: results});
        });
      } else if(req.query.id) {
        //individual entry page:
        ops.pubEntry(db, req.params.termbaseID, req.query.id, function(entry){
          db.close();
          res.render("termbase/entry.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L, entry: entry});
        });
      } else {
        //termbase home page:
        configs.ident.blurb=ops.markdown(configs.ident.blurb[uilang] || configs.ident.blurb.$);
        ops.readExtranetsByUser(db, req.params.termbaseID, user.email, function(_extranets){
          db.close();
          var extranets=[]; _extranets.map(obj => { if(obj.live=="1") extranets.push(obj); });
          res.render("termbase/home.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L, extranets: extranets});
        });
      }
    });
  });
});
app.post(siteconfig.rootPath+":termbaseID/random.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.readTermbaseConfigs(db, req.params.termbaseID, function(configs){
    if(!configs.publico.public) res.json({more: false, entries: []}); else {
      ops.readRandoms(db, req.params.termbaseID, function(more, entries){
        db.close();
        res.json({more: more, entries: entries});
      });
    }
  });
});


//Termbase download:
app.get(siteconfig.rootPath+"data/termbases/:filename", function(req, res, next){
  if(!req.params.filename.endsWith(".sqlite")){res.status(404).render("404.ejs", {siteconfig: siteconfig}); return;}
  var termbaseID=req.params.filename.replace(/\.sqlite$/, "");
  if(!ops.termbaseExists(termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(termbaseID, false);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, termbaseID, function(user){
    db.close();
    if(!user.termbaseAccess || user.level<5) {
      res.status(404).render("404.ejs", {siteconfig: siteconfig});
    } else {
      next();
    }
  });
});
app.use(siteconfig.rootPath+"data/termbases", express.static(path.join(siteconfig.dataDir, "termbases")));

//Termbase upload:
app.get(siteconfig.rootPath+":termbaseID/config/upload/", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess || (user.level<5 && !user.isAdmin)) {
      db.close();
      res.redirect(req.headers.referer || siteconfig.baseUrl+req.params.termbaseID+"/");
    } else {
      ops.readTermbaseConfigs(db, req.params.dictID, function(configs){
        db.close();
        var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
        res.render("termbase-config/upload.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, configType: "upload", uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/config/upload/upload.html", upload.single("myfile"), function (req, res) {
  if(!ops.termbaseExists(req.params.termbaseID)) { res.status(404).render("404.ejs", { siteconfig: siteconfig }); return }
  var db = ops.getDB(req.params.termbaseID);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function (user) {
    db.close();
    if (!user.termbaseAccess || user.level<5) {
      res.redirect("../../edit/");
    } else {
      if (!req.file) {
        res.send("<html><body>false</body></html>");
      } else {
        var filename=path.basename(req.file.path);
        fs.move(path.join(siteconfig.dataDir, "uploads/"+filename), path.join(siteconfig.dataDir, "termbases/"+req.params.termbaseID+".sqlite"), {overwrite: true}, function(err){
          res.send("<html><body>"+siteconfig.rootPath+req.params.termbaseID+"/config/"+"</body></html>");
        });
      }
    }
  });
});

//Termbase config:
app.get(siteconfig.rootPath+":termbaseID/config/", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess || (user.level<5 && !user.isAdmin)) {
      db.close();
      res.redirect(siteconfig.baseUrl+req.params.termbaseID+"/");
    } else {
      ops.readTermbaseConfigs(db, req.params.termbaseID, function(configs){
        ops.readTermbaseStats(db, req.params.termbaseID, function(stats){
          db.close();
          var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
          var locked=(siteconfig.propagatorMsSqlConnectionStrings[req.params.termbaseID] ? true : false);
          res.render("termbase-config/home.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L, locked: locked, stats: stats});
        });
      });
    }
  });
});
app.get(siteconfig.rootPath+":termbaseID/config/url/", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess || (user.level<5 && !user.isAdmin)) {
      db.close();
      res.redirect(req.headers.referer || siteconfig.baseUrl+req.params.termbaseID+"/");
    } else {
      ops.readTermbaseConfigs(db, req.params.dictID, function(configs){
        db.close();
        var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
        res.render("termbase-config/url.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, configType: "url", uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
      });
    }
  });
});
app.get(siteconfig.rootPath+":termbaseID/config/tbxout/", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess || (user.level<5 && !user.isAdmin)) {
      db.close();
      res.redirect(req.headers.referer || siteconfig.baseUrl+req.params.termbaseID+"/");
    } else {
      ops.readTermbaseConfigs(db, req.params.termbaseID, function(configs){
        ops.readTermbaseStats(db, req.params.termbaseID, function(stats){
          db.close();
          var offsets=[];
          for(var i=0; i<stats.entryCount; i=i+1000){
            offsets.push(i);
          }
          var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
          res.render("termbase-config/tbxout.ejs", {offsets: offsets, stats: stats, user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, configType: "tbxout", uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
        });
      });
    }
  });
});
app.get(siteconfig.rootPath+":termbaseID/config/tbxin/", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess || (user.level<5 && !user.isAdmin)) {
      db.close();
      res.redirect(req.headers.referer || siteconfig.baseUrl+req.params.termbaseID+"/");
    } else {
      ops.readTermbaseConfigs(db, req.params.dictID, function(configs){
        db.close();
        var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
        res.render("termbase-config/tbxin.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, configType: "tbxout", uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L});
      });
    }
  });
});
app.get(siteconfig.rootPath+":termbaseID/config/:configType/", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID, true);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(!user.termbaseAccess || (user.level<5 && !user.isAdmin)) {
      db.close();
      res.redirect(req.headers.referer || siteconfig.baseUrl+req.params.termbaseID+"/");
    } else {
      ops.readTermbaseConfigs(db, req.params.dictID, function(configs){
        db.close();
        var uilang=user.uilang || req.cookies.uilang || siteconfig.uilangDefault;
        res.render("termbase-config/editor.ejs", {user: user, termbaseID: req.params.termbaseID, termbaseConfigs: configs, configType: req.params.configType, uilang: uilang, uilangs: siteconfig.uilangs, L: localizer[uilang].L, defaultAbc: siteconfig.defaultAbc, licences: siteconfig.licences});
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
app.post(siteconfig.rootPath+":termbaseID/config/destroy.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(false) {
      db.close();
      res.json({success: false});
    } else {
      db.close(function(){
        ops.destroyTermbase(req.params.termbaseID, function(){
          res.json({success: true});
        });
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/config/move.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(false) {
      db.close();
      res.json({success: false});
    } else {
      db.close(function(){
        ops.renameTermbase(req.params.termbaseID, req.body.url, function(success){
          res.json({success: success});
        });
      });
    }
  });
});
app.post(siteconfig.rootPath+":termbaseID/config/purge.json", function(req, res){
  if(!ops.termbaseExists(req.params.termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.termbaseID);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.termbaseID, function(user){
    if(false) {
      db.close();
      res.json({success: false});
    } else {
      db.close(function(){
        ops.purgeTermbase(req.params.termbaseID, function(){
          res.json({success: true});
        });
      });
    }
  });
});

app.get(siteconfig.rootPath+":termbaseID/config/tbxout/:termbaseID-:min-:max.tbx", function(req, res, next){
  var termbaseID=req.params.termbaseID;
  var min=req.params.min;
  var max=req.params.max;
  var offset=Number(min)-1;
  var limit=1000;
  if(!ops.termbaseExists(termbaseID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(termbaseID, false);
  ops.verifyLoginAndTermbaseAccess(req.cookies.email, req.cookies.sessionkey, db, termbaseID, function(user){
    if(!user.termbaseAccess || user.level<5) {
      res.status(404).render("404.ejs", {siteconfig: siteconfig});
      db.close();
    } else {
      ops.toTBX(db, termbaseID, offset, limit, function(filename){
        db.close();
        res.download(siteconfig.dataDir+"downloads/"+filename, `${termbaseID}-${min}-${max}.tbx`);
      });
    }
  });
});

app.use(function(req, res){ res.status(404).render("404.ejs", {siteconfig: siteconfig}); });
app.listen(PORT);
console.log("Process ID "+process.pid+" is now listening on port number "+PORT+".");
