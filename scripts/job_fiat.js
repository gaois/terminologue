/*
1. Rith an t-iarratas seo ar bhunachar fion_lxln in SQL Server (ach athraigh an réimse dátaí ag an deireadh):

  select top 1000 con.ID, con.XmlContent, com.ID, com.XmlContent, usr.ID, usr.XmlContent
  from tblEntries as con
  left outer join tblXrefs as xr1 on xr1.TargetID=con.ID
  left outer join tblEntries as com on com.ID=xr1.SourceID and com.CategoryNickname='extranet.comment'
  left outer join tblXrefs as xr2 on xr2.SourceID=com.ID
  left outer join tblEntries as usr on usr.ID=xr2.TargetID and usr.CategoryNickname='admin.user'
  where con.CategoryNickname='fiatga.concept'
  and (usr.ID is not null or com.ID is null)
  and exists (select * from tblIndex as i where i.EntryID=con.ID and i.Path='concept/note' and i.Attribute='type' and i.ValueNumber in (4156812, 4156811))
  and con.XmlContent.exist('/concept/note[(@type="4156812" or @type="4156811") and @dateTime>="2024-02-01" and @dateTime<"2024-03-01"]')=1
  order by con.ID desc, com.ID desc, usr.ID desc

2. Cópeáil agus greamaigh an t-inneachar go comhad fiat.txt san fhilleán seo (= an fillteán céanna ina bhfuil an comhad seo, job_fiat.js)
   ar fhreastalaí gréasáin Téarma.

3. Ar fhreastalaí gréasáin Téarma, oscail command prompt, téigh go dtí an fillteán seo agus righ an script seo:
   node job_fiat.js
*/

const BNT_EXTRANET_ID="4642136"; //an eislíon in BNT (Terminologue) air ar cheart na hiontrálacha a chur, mar shampla "Liosta IATE - Bealtaine 2024"
const BNT_SOURCE_ID="4424027"; //foinse in BNT (Terminologue) atá le lua le samplaí úsáide a chruthófar as an sonra 'context', mar shampla "Reachtaíocht an AE"
const HISTORIOGRAPHY={"diff":[{"desc":"iompórtáil as Fiat"}]};
const HISTORY_EMAIL="brian.oraghallaigh@dcu.ie";

const xmldom=require("xmldom"); //https://www.npmjs.com/package/xmldom
const domParser=new xmldom.DOMParser();

//starts here
var concepts={}; //conceptID --> {}
var lineReader=require('readline').createInterface({
  input: require('fs').createReadStream('./24.04.30-fiat.txt')
});
lineReader.on('line', function(line) {
  var columns=line.split("\t");
  var conceptID=columns[0];
  if(!concepts[conceptID]){
    var entry=parseConcept(columns[1]);
    concepts[conceptID]=entry;
  }
  if(columns[2]!="NULL"){
    var note=parseExtranetComment(columns[3], columns[5]);
    concepts[conceptID].notes.push(note);
  }
});
lineReader.on("close", function(){
  saveAll();
});
//finishes here

function parseConcept(xml){
  var doc=domParser.parseFromString(xml, 'text/xml');
  var entry={
    "cStatus": "0",
    "pStatus": "0",
    "dStatus": "1",
    "dateStamp": "",
    "tod": "",
    "domains": [],
    "desigs": [],
    "intros": {
      "ga": "",
      "en": ""
    },
    "definitions": [],
    "examples": [],
    "notes": [],
    "collections": [],
    "extranets": [BNT_EXTRANET_ID],
    "xrefs": []
  };
  //parse terms in English and Latin:
  var elsTerm=doc.getElementsByTagName("termOrig");
  for(var iTerm=0; iTerm<elsTerm.length; iTerm++){
    var elTerm=elsTerm[iTerm];
    if(elTerm.getAttribute("langID")=="4156798" || elTerm.getAttribute("langID")=="4156801"){
      var desig={
        "term": {
          "id": "",
          "lang": "",
          "wording": "",
          "annots": [],
          "inflects": []
        },
        "accept": null,
        "clarif": "",
        "sources": [],
        "nonessential": "0"
      };
      if(elTerm.getAttribute("langID")=="4156798") desig.term.lang="en";
      if(elTerm.getAttribute("langID")=="4156801") desig.term.lang="la";
      desig.term.wording=cleanWording(elTerm.getAttribute("wording"));
      entry.desigs.push(desig);
    }
  }
  //parse terms in Irish:
  var elsTerm=doc.getElementsByTagName("termTarget");
  for(var iTerm=0; iTerm<elsTerm.length; iTerm++){
    var elTerm=elsTerm[iTerm];
    if(elTerm.getAttribute("wording")){
      var desig={
        "term": {
          "id": "",
          "lang": "",
          "wording": "",
          "annots": [],
          "inflects": []
        },
        "accept": null,
        "clarif": "",
        "sources": [],
        "nonessential": "0"
      };
      desig.term.lang="ga";
      desig.term.wording=cleanWording(elTerm.getAttribute("wording") || elTerm.getAttribute("origWording"));
      entry.desigs.push(desig);
      //parse context in Irish:
      if(elTerm.getAttribute("context")){
        var example={
          texts: {ga: [cleanWording(elTerm.getAttribute("context"))], en: []},
          sources: [{id: BNT_SOURCE_ID, lang: "ga"}],
          nonessential: "0",
        };
        entry.examples.push(example);
      }
    }
  }
  //parse definitions in English and Irish:
  var elsDef=doc.getElementsByTagName("definition");
  for(var iDef=0; iDef<elsDef.length; iDef++){
    var elDef=elsDef[iDef];
    if((elDef.getAttribute("lang")=="en" || elDef.getAttribute("lang")=="ga") && elDef.getAttribute("text")){
      var definition={
        "texts": {
          "ga": "",
          "en": ""
        },
        "sources": [],
        "domains": [],
        "nonessential": "0"
      };
      definition.texts[elDef.getAttribute("lang")]=cleanWording(elDef.getAttribute("text"));
      entry.definitions.push(definition);
    }
  }
  //parse ll comments:
  var elsComment=doc.getElementsByTagName("llComment");
  for(var iComment=0; iComment<elsComment.length; iComment++){
    var elComment=elsComment[iComment];
    if(elComment.getAttribute("default")){
      var note={
        "type": "4626832", //"IATE LLComment"
        "texts": {
          "ga": "",
          "en": cleanWording(elComment.getAttribute("default"))
        },
        "sources": [],
        "nonessential": "0"
      };
      entry.notes.push(note);
    }
  }
  //parse "Nóta faoi na foinsí":
  var elsNote=doc.getElementsByTagName("note");
  for(var iNote=0; iNote<elsNote.length; iNote++){
    var elNote=elsNote[iNote];
    if(elNote.getAttribute("default") && elNote.getAttribute("type")=="4156847"){
      var note={
        "type": "4626833", //"IATE Nóta faoi na foinsí"
        "texts": {
          "ga": cleanWording(elNote.getAttribute("default")),
          "en": ""
        },
        "sources": [],
        "nonessential": "0"
      };
      entry.notes.push(note);
    }
  }
  return entry;
}
function parseExtranetComment(xmlComment, xmlUser){
  var docComment=domParser.parseFromString(xmlComment, 'text/xml');
  var docUser=domParser.parseFromString(xmlUser, 'text/xml');
  var wording=docComment.documentElement.getAttribute("body");
  var author=docUser.getElementsByTagName("realname")[0].getAttribute("default");
  var note={
    "type": "4626834", //"IATE Tráchtaireacht ó eislíon Fiat"
    "texts": {
      "ga": cleanWording(wording)+" - "+author,
      "en": ""
    },
    "sources": [],
    "nonessential": "0"
  };
  return note;
}
function cleanWording(str){
  str=str.replace(/\<[^\<\>]*\>/g, "");
  return str
}

const ops=require("../website/ops");
ops.propagator=require("../website/propagator.js");
const fs=require("fs");
ops.siteconfig=JSON.parse(fs.readFileSync("../website/siteconfig.json", "utf8"));
var entries=[];
function saveAll(){
  for(conceptID in concepts) entries.push(concepts[conceptID]);
  concepts=null;
  var db=ops.getDB("bnt", false);
  console.log(`we have ${entries.length} entries to save`);
  saveOne(db);
}
function saveOne(db){
  var entry=entries.pop();
  if(entry){
    var json=JSON.stringify(entry);
    ops.entrySave(db, "bnt", null, json, HISTORY_EMAIL, HISTORIOGRAPHY, function(entryID){
      console.log(`saved entry ID ${entryID}, we have ${entries.length} entries left to save`);
      saveOne(db);
    });
  } else {
    db.close();
    console.log(`all done`);
  }
}
