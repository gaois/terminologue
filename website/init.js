const path=require("path");
const fs=require("fs-extra");
const sqlite3 = require('sqlite3').verbose(); //https://www.npmjs.com/package/sqlite3
const sha1 = require('sha1'); //https://www.npmjs.com/package/sha1
var siteconfig=JSON.parse(fs.readFileSync("../data/siteconfig.json", "utf8"));
var dbFile = path.join(siteconfig.dataDir, "terminologue.sqlite");

var db=new sqlite3.Database(dbFile, function(err){
  if(err){ console.log(err); return; }
  var password=Math.random().toString(36).slice(-10);
  var passwordHash=sha1(password);
  for(var i=0; i<siteconfig.admins.length; i++){
    var email=siteconfig.admins[i];
    insertUser(db, email, password, passwordHash);
  }
  db.close();
});

var insertUser=function(db, email, password, passwordHash){
  db.run("insert into users(email, passwordHash, uilang) values($email, $passwordHash, 'en')", {
    $email: email,
    $passwordHash: passwordHash,
  }, function(err){
    if(err) {
      console.log("Creating a user account for "+email+" has failed.");
      console.log(err);
    } else {
      console.log("I have created a user account for "+email+". The password is: "+password);
    }
  });
};
