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
      fiontarNotes1: [], fiontarNotes2: [],
      entry: null,
    };
    {
      function pine(x, arr){ if(x) arr.push(x); } //push if not empty
      pine(cols[1], concept.prefLabelsEN); //B
      pine(cols[2], concept.prefLabelsGA); //C
      pine(cols[3], concept.fiontarNotes1);
      pine(cols[4], concept.fiontarNotes2);
      pine(cols[5], concept.definitionsEN); //D
      pine(cols[6], concept.definitionsGA); //E
      pine(cols[7], concept.historyNotesEN); //F
      pine(cols[8], concept.scopeNotesGA); //G
      pine(cols[9], concept.historyNotesGA); //H
      pine(cols[10], concept.altLabelsEN); //I
      pine(cols[11], concept.altLabelsEN); //J
      pine(cols[12], concept.altLabelsEN); //K
      pine(cols[13], concept.altLabelsEN); //L
      pine(cols[14], concept.altLabelsEN); //M
      pine(cols[15], concept.altLabelsEN); //N
      pine(cols[16], concept.altLabelsEN); //O
      pine(cols[17], concept.altLabelsEN); //P
      pine(cols[18], concept.altLabelsEN); //Q
      pine(cols[19], concept.altLabelsEN); //R
      pine(cols[20], concept.altLabelsEN); //S
      pine(cols[21], concept.altLabelsEN); //T
      pine(cols[22], concept.altLabelsEN); //U
      pine(cols[23], concept.altLabelsEN); //V
      pine(cols[24], concept.altLabelsEN); //W
      pine(cols[25], concept.altLabelsEN); //X
      pine(cols[26], concept.altLabelsEN); //Y
      pine(cols[27], concept.altLabelsEN); //Z
      pine(cols[28], concept.altLabelsEN); //AA
      pine(cols[29], concept.altLabelsEN); //AB
      pine(cols[30], concept.scopeNotesEN); //AC
      pine(cols[31], concept.scopeNotesEN); //AD
      pine(cols[32], concept.altLabelsGA); //AE
      pine(cols[33], concept.altLabelsGA); //AF
      pine(cols[34], concept.altLabelsGA); //AG
      pine(cols[35], concept.altLabelsGA); //AH
      pine(cols[36], concept.altLabelsGA); //AI
      pine(cols[37], concept.altLabelsGA); //AJ
      pine(cols[38], concept.altLabelsGA); //AK
      pine(cols[39], concept.altLabelsGA); //AL
      pine(cols[40], concept.altLabelsGA); //AM
      pine(cols[41], concept.altLabelsGA); //AN
      pine(cols[42], concept.altLabelsGA); //AO
      pine(cols[43], concept.altLabelsGA); //AP
      pine(cols[44], concept.altLabelsGA); //AQ
      pine(cols[45], concept.altLabelsGA); //AR
      pine(cols[46], concept.altLabelsGA); //AS
      pine(cols[47], concept.altLabelsGA); //AU
      pine(cols[48], concept.altLabelsGA); //AV
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
  concepts[uri].entry=entry;
  entry.notes.push({
    "type": "6",
    "texts": {
      "en": uri,
      "ga": "",
    },
    "nonessential": "0",
    "sources": []
  });
  entry.notes.push({
    "type": "32",
    "texts": {
      "en": "https://op.europa.eu/en/web/eu-vocabularies/concept/-/resource?uri="+uri,
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
  for(var i=0; i<concepts[uri].fiontarNotes1.length; i++) {
    entry.notes.push({
      "type": "30",
      "texts": {
        "en": "",
        "ga": concepts[uri].fiontarNotes1[i] || "",
      },
      "nonessential": "0",
      "sources": []
    });
  }
  for(var i=0; i<concepts[uri].fiontarNotes2.length; i++) {
    entry.notes.push({
      "type": "31",
      "texts": {
        "en": "",
        "ga": concepts[uri].fiontarNotes2[i] || "",
      },
      "nonessential": "0",
      "sources": []
    });
  }
  entries.push(entry);
}

//READ THE HIERARCHY:
var domains={}; //{"04 POLITICS" => [uri]}
var supertrees={}; //{"uri" => ["supertree"]}
var subtrees={}; //{"uri" => ["sublabel"]}
fs.readdirSync("/home/michmech/Downloads/002").map(filename => {
  if(filename.endsWith("_concept_tree.csv")){
    var toplabel=filename.replace(/_concept_tree\.csv$/, "");
    var members=[];
    var urisByLevel=[];
    fs.readFileSync("/home/michmech/Downloads/002/"+filename, "utf8").split("\n").map((line, iLine) => {
      if(line.trim()!="" && iLine>0){ //the first row are column labels
        line=line.split("\t");
        var uri="", level=0;
        for(var i=0; i<line.length; i++){
          var val=line[i].trim();
          if(val!=""){
            if(members.indexOf(val)==-1) members.push(val);
            uri=val;
            level=i;
          }
        }
        urisByLevel[level]=uri;

        var supertree=toplabel;
        for(var i=0; i<level; i++){
          supertree+=" » ";
          if(concepts[urisByLevel[i]]){
            supertree+=concepts[urisByLevel[i]].prefLabelsEN[0];
          } else {
            console.log("missing label for uri: "+urisByLevel[i]);
            supertree+=urisByLevel[i];
          }
        }
        if(!supertrees[uri]) supertrees[uri]=[];
        supertrees[uri].push(supertree);

        if(level>0){
          var selflabel=uri;
          if(concepts[uri]){
            selflabel=concepts[uri].prefLabelsEN[0];
          } else {
            console.log("missing label for uri: "+uri);
          }
          var parentUri=urisByLevel[level-1];
          if(!subtrees[parentUri]) subtrees[parentUri]=[];
          if(subtrees[parentUri].indexOf(selflabel)==-1) subtrees[parentUri].push(selflabel)
        }

      }
    });
    domains[toplabel]=members;
  }
});
// var count=0; for(var lab in domains) count++; console.log("domains:", count);
// var count=0; for(var uri in supertrees) count++; console.log("supertrees:", count);

//ADD SUPERTREES AND SUBTRESS AS NOTES TO ENTRIES:
for(var uri in supertrees){
  var entry=concepts[uri].entry;
  supertrees[uri].map(supertree => {
    entry.notes.push({
      "type": "7",
      "texts": {
        "en": supertree,
        "ga": "",
      },
      "nonessential": "0",
      "sources": []
    });
  });
}
for(var uri in subtrees){
  var entry=concepts[uri].entry;
  entry.notes.push({
    "type": "8",
    "texts": {
      "en": subtrees[uri].join(" | "),
      "ga": "",
    },
    "nonessential": "0",
    "sources": []
  });
}

//ADD DOMANS TO ENTRIES:
const domainIDs={
  "04 POLITICS": 9,
  "08 INTERNATIONAL RELATIONS": 10,
  "10 EUROPEAN UNION": 11,
  "12 LAW": 12,
  "16 ECONOMICS": 13,
  "20 TRADE": 14,
  "24 FINANCE": 15,
  "28 SOCIAL QUESTIONS": 16,
  "32 EDUCATION AND COMMUNICATIONS": 17,
  "36 SCIENCE": 18,
  "40 BUSINESS AND COMPETITION": 19,
  "44 EMPLOYMENT AND WORKING CONDITIONS": 20,
  "48 TRANSPORT": 21,
  "52 ENVIRONMENT": 22,
  "56 AGRICULTURE, FORESTRY AND FISHERIES": 23,
  "60 AGRI-FOODSTUFFS": 24,
  "64 PRODUCTION, TECHNOLOGY AND RESEARCH": 25,
  "66 ENERGY": 26,
  "68 INDUSTRY": 27,
  "72 GEOGRAPHY": 28,
  "76 INTERNATIONAL ORGANISATIONS": 29,
};
for(var key in domains){
  var domainID=domainIDs[key];
  domains[key].map(uri => {
    if(concepts[uri]){
      var entry=concepts[uri].entry;
      entry.domains.push(domainID.toString());
    }
  });
}
// console.log(JSON.stringify(entries, null, "  "));

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
