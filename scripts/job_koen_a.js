//run me from the "website" folder

const fs=require("fs");
const ops=require("../website/ops.js");
ops.siteconfig=JSON.parse(fs.readFileSync("../data/siteconfig.json", "utf8"));
const propagator=require("../website/propagator.js");
ops.propagator=propagator.withMsSqlConnectionStrings(ops.siteconfig.propagatorMsSqlConnectionStrings);

//var termbaseID="abuse-terminology", termbaseName="Abuse Terminology";
//var termbaseID="medical-consultation-terminology", termbaseName="Medical Consultation Terminology";
//var termbaseID="parent-meeting-terminology", termbaseName="Parent Meeting Terminology";

var languages=["nl", "cs", "pl", "sk"];
var termColumns=[
  "nl",
  "nl",
  "",
  "",
  "",
  "cs",
  "pl",
  "sk",
];

var sourceIDs={ //name => ID
};
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

    //source of Dutch term and definition:
    var source=line[3] || "";
    if(source.startsWith("http")){ //extract domain name from URL:
      source=source.replace(/^https?\:\/\/([^\/]+)\/?.*$/, function($0, $1){ return $1; });
    }

    //add the source to metadata:
    if(source){
      if(!sourceIDs[source]) sourceIDs[source]=0;
    }

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
            if(lang=="nl" && source) desig.sources.push(source);
            entry.desigs.push(desig);
          }
        });
      }
    }

    //definition:
    if(line[2]){
      var wording=line[2].trim();
      if(/[^\-\\]/.test(wording)){ //if the wording contains at least one normal letter character
        var definition={
          "texts": {
            "nl": wording
          },
          "sources": [],
          "domains": [],
          "nonessential": "0"
        };
        if(source) definition.sources.push({
          "id": source,
          "lang": "nl"
        });
        entry.definitions.push(definition);
      }
    }

    //examples (they call them collocations):
    if(line[4]){
      var wording=line[4].trim();
      if(/[^\-\\\/]/.test(wording)){ //if the wording contains at least one normal letter character
        var example={
          "texts": {
            "nl": [
              wording.replace(/[\[\]]/g, ""),
            ],
          },
          "sources": [],
          "nonessential": "0"
        };
        entry.examples.push(example);
      }
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
    createSources()
  });
}

function createSources(){
  var sourcesToMake=[]; for(var key in sourceIDs) sourcesToMake.push(key);
  doOne();
  function doOne(){
    var sourceTitle=sourcesToMake.pop();
    if(sourceTitle){
      console.log(" - creating source: "+sourceTitle);
      var json={
        "title": {
          "nl": sourceTitle,
        }
      };
      ops.metadataCreate(db, termbaseID, "source", null, JSON.stringify(json), function(id){
        sourceIDs[sourceTitle]=id;
        doOne();
      });
    } else {
      console.log("sources created");
      referToSources();
    }
  }
}

function referToSources(){
  entries.map(entry => {
    entry.desigs.map(desig => {
      for (var i = 0; i < desig.sources.length; i++) {
        desig.sources[i]=sourceIDs[desig.sources[i]].toString();
      }
    });
    entry.definitions.map(def => {
      def.sources.map(s => {
        s.id=sourceIDs[s.id].toString();
      });
    });
  });
  console.log("sources referred to");
  createEntries();
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
