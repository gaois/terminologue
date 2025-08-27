//run me from the "website" folder

const fs=require("fs");
const ops=require("../website/ops.js");
ops.siteconfig=JSON.parse(fs.readFileSync("../data/siteconfig.json", "utf8"));
const propagator=require("../website/propagator.js");
ops.propagator=propagator.withMsSqlConnectionStrings(ops.siteconfig.propagatorMsSqlConnectionStrings);

var termbaseID="vaccination-terminology", termbaseName="Vaccination Terminology";

var languages=["nl", "fr", "en", "ar", "ur", "so", "pa", "da", "fa", "ti"];
var termColumns=[
  "nl",
  "nl",
  "nl",
  "nl",
  "nl",
  "nl",
  "",
  "fr",
  "fr",
  "",
  "en",
  "en",
  "ar",
  "ar",
  "ur",
  "ur",
  "so",
  "so",
  "pa",
  "pa",
  "da",
  "da",
  "fa",
  "fa",
  "ti",
  "ti",
];

var entries=[];

var lineReader=require('readline').createInterface({
  input: require('fs').createReadStream("../temp/"+termbaseID+".txt"),
});

lineReader.on('line', function(line){
  line=line.split("\t");
  if(line.length>1){

    var entry={
      "cStatus": "0",
      "pStatus": "1",
      "dStatus": "1",
      "dateStamp": "",
      "tod": "",
      "domains": [],
      "desigs": [],
      "intros": {},
      "definitions": [],
      "examples": [],
      "notes": [],
      "collections": [],
      "extranets": [],
      "xrefs": []
    };

    //terms:
    for (var iColumn = 0; iColumn < line.length; iColumn++) {
      if(termColumns[iColumn]!=""){
        var lang=termColumns[iColumn];
        var column=line[iColumn];
        column.split(",").map(wording => {
          wording=wording.trim();
          if(/[^\-\\]/.test(wording)){ //if the wording contains at least one normal letter character
            var desig={
              "term": {
                "id": "",
                "lang": lang,
                "wording": wording,
                "annots": [],
                "inflects": []
              },
              "accept": null,
              "clarif": "",
              "sources": [],
              "nonessential": "0"
            };
            entry.desigs.push(desig);
          }
        });
      }
    }

    var definition={
      "texts": {},
      "sources": [],
      "domains": [],
      "nonessential": "0"
    };
    //definition in Dutch:
    if(line[6]){
      var wording=line[6].trim();
      if(/[^\-\\]/.test(wording)){ //if the wording contains at least one normal letter character
        definition.texts["nl"]=wording;
      }
    }
    //definition in French:
    if(line[9]){
      var wording=line[9].trim();
      if(/[^\-\\]/.test(wording)){ //if the wording contains at least one normal letter character
        definition.texts["fr"]=wording;
      }
    }
    if(definition.texts["nl"] || definition.texts["fr"]){
      entry.definitions.push(definition);
    }

    entries.push(entry);
  }
});

lineReader.on('close', function() {
  console.log("entries read");
  createTermbase();
});

var db=null;
function createTermbase(){
  ops.makeTermbase(termbaseID, "blank", termbaseName, "", "valselob@gmail.com", function(){
    console.log("database created");
    db=ops.getDB(termbaseID, false);
    createLanguages();
  });
}

function createLanguages(){
  var lingo={
    "languages": []
  };
  languages.map(langCode => {
    lingo.languages.push({
      "role": "major",
      "abbr": langCode,
      "title": {}
    });
  });
  ops.configUpdate(db, termbaseID, "lingo", JSON.stringify(lingo), function(){
    console.log("languages created");
    createEntries();
  });
}

function createEntries(){
  doOne();
  function doOne(){
    var entry=entries.pop();
    if(entry){
      ops.entrySave(db, termbaseID, null, JSON.stringify(entry), "valselob@gmail.com", {}, function(){
        console.log(" - created entry, "+entries.length+" entries left to do");
        doOne();
      })
    } else {
      console.log("entries created");
      console.log("all done");
    }
  }
}
