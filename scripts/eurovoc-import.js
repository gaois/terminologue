const fs=require("fs");
const ops=require("../website/ops.js");
ops.siteconfig=JSON.parse(fs.readFileSync("../website/siteconfig.json", "utf8"));
const propagator=require("../website/propagator.js");
ops.propagator=propagator.withMsSqlConnectionStrings(ops.siteconfig.propagatorMsSqlConnectionStrings);

//READ THE CONCEPTS:
var concepts={}; //URI => {...}
fs.readFileSync("/home/michmech/Downloads/001/All_results_GA_EN.csv", "utf8").split("\n").map((line, iLine) => {
  if(iLine>0 && line.trim()!=""){
    var cols=line.split("\t");
    var concept={
      uri: cols[0],
      prefLabelsEN: [], prefLabelsGA: [],
      altLabelsEN: [], altLabelsGA: [],
      definitionsEN: [], definitionsGA: [],
      scopeNotesEN: [], scopeNotesGA: [],
      historyNotesEN: [], historyNotesGA: [],
    };
    {
      function pine(x, arr){ if(x) arr.push(x); } //push if not empty
      pine(cols[1], concept.prefLabelsEN); //B
      pine(cols[2], concept.prefLabelsGA); //C
      pine(cols[3], concept.definitionsEN); //D
      pine(cols[4], concept.definitionsGA); //E
      pine(cols[5], concept.historyNotesEN); //F
      pine(cols[6], concept.scopeNotesGA); //G
      pine(cols[7], concept.historyNotesGA); //H
      pine(cols[8], concept.altLabelsEN); //I
      pine(cols[9], concept.altLabelsEN); //J
      pine(cols[10], concept.altLabelsEN); //K
      pine(cols[11], concept.altLabelsEN); //L
      pine(cols[12], concept.altLabelsEN); //M
      pine(cols[13], concept.altLabelsEN); //N
      pine(cols[14], concept.altLabelsEN); //O
      pine(cols[15], concept.altLabelsEN); //P
      pine(cols[16], concept.altLabelsEN); //Q
      pine(cols[17], concept.altLabelsEN); //R
      pine(cols[18], concept.altLabelsEN); //S
      pine(cols[19], concept.altLabelsEN); //T
      pine(cols[20], concept.altLabelsEN); //U
      pine(cols[21], concept.altLabelsEN); //V
      pine(cols[22], concept.altLabelsEN); //W
      pine(cols[23], concept.altLabelsEN); //X
      pine(cols[24], concept.altLabelsEN); //Y
      pine(cols[25], concept.altLabelsEN); //Z
      pine(cols[26], concept.altLabelsEN); //AA
      pine(cols[27], concept.altLabelsEN); //AB
      pine(cols[28], concept.scopeNotesEN); //AC
      pine(cols[29], concept.scopeNotesEN); //AD
      pine(cols[30], concept.altLabelsGA); //AE
      pine(cols[31], concept.altLabelsGA); //AF
      pine(cols[32], concept.altLabelsGA); //AG
      pine(cols[33], concept.altLabelsGA); //AH
      pine(cols[34], concept.altLabelsGA); //AI
      pine(cols[35], concept.altLabelsGA); //AJ
      pine(cols[36], concept.altLabelsGA); //AK
      pine(cols[37], concept.altLabelsGA); //AL
      pine(cols[38], concept.altLabelsGA); //AM
      pine(cols[39], concept.altLabelsGA); //AN
      pine(cols[40], concept.altLabelsGA); //AO
      pine(cols[41], concept.altLabelsGA); //AP
      pine(cols[42], concept.altLabelsGA); //AQ
      pine(cols[43], concept.altLabelsGA); //AR
      pine(cols[44], concept.altLabelsGA); //AS
      pine(cols[45], concept.altLabelsGA); //AU
      pine(cols[46], concept.altLabelsGA); //AV
    }
    concepts[concept.uri]=concept;
  }
});

//CONVERT CONCEPTS INTO TERMINOLOGUE ENTRIES:
var entries=[];
for(var uri in concepts){
  var entry={
    "cStatus": "0",
    "pStatus": "0",
    "dStatus": "0",
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
  entry.notes.push({
    "type": "6",
    "texts": {
      "en": uri,
      "ga": "",
    },
    "nonessential": "0",
    "sources": []
  });
  concepts[uri].prefLabelsEN.map(x => {
    entry.desigs.push({
      "term": {"id": "", "lang": "en", "wording": x, "annots": [], "inflects": []},
      "accept": "2", "clarif": "", "sources": [], "nonessential": "0"
    });
  });
  concepts[uri].prefLabelsGA.map(x => {
    entry.desigs.push({
      "term": {"id": "", "lang": "ga", "wording": x, "annots": [], "inflects": []},
      "accept": "2", "clarif": "", "sources": [], "nonessential": "0"
    });
  });
  concepts[uri].altLabelsEN.map(x => {
    entry.desigs.push({
      "term": {"id": "", "lang": "en", "wording": x, "annots": [], "inflects": []},
      "accept": "3", "clarif": "", "sources": [], "nonessential": "0"
    });
  });
  concepts[uri].altLabelsGA.map(x => {
    entry.desigs.push({
      "term": {"id": "", "lang": "ga", "wording": x, "annots": [], "inflects": []},
      "accept": "3", "clarif": "", "sources": [], "nonessential": "0"
    });
  });
  if(concepts[uri].definitionsEN.length>0 || concepts[uri].definitionsGA.length>0){
    entry.definitions.push({
      "texts": {
        "en": concepts[uri].definitionsEN[0] || "",
        "ga": concepts[uri].definitionsGA[0] || "",
      },
      "sources": [],
      "domains": [],
      "nonessential": "0"
    });
  }
  for(var i=0; i<Math.max(concepts[uri].scopeNotesEN.length, concepts[uri].scopeNotesGA.length); i++) {
    entry.notes.push({
      "type": "4",
      "texts": {
        "en": concepts[uri].scopeNotesEN[i] || "",
        "ga": concepts[uri].scopeNotesGA[i] || "",
      },
      "nonessential": "0",
      "sources": []
    });
  }
  for(var i=0; i<Math.max(concepts[uri].historyNotesEN.length, concepts[uri].historyNotesGA.length); i++) {
    entry.notes.push({
      "type": "5",
      "texts": {
        "en": concepts[uri].historyNotesEN[i] || "",
        "ga": concepts[uri].historyNotesGA[i] || "",
      },
      "nonessential": "0",
      "sources": []
    });
  }
  entries.push(entry);
}

//SAVE ENTRIES INTO SQLITE DATABASE:
var db=ops.getDB("eurovoc", false);
saveOneEntry();
function saveOneEntry(){
  var entry=entries.pop();
  if(entry){
    ops.entrySave(db, "eurovoc", null, JSON.stringify(entry), "valselob@gmail.com", {}, function(){
      console.log(" - created entry, "+entries.length+" entries left to do");
      saveOneEntry();
    })
  } else {
    console.log("entries created");
    console.log("all done");
  }
}
