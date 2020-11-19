const DOMParser=require("xmldom").DOMParser;
const domParser=new DOMParser();

module.exports=function(tbx){
  var doc=domParser.parseFromString(tbx, "text/xml");
  return doEntry(doc);
}

const ENTRY={
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
const DESIG={
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

function doEntry(doc){
  var entry=JSON.parse(JSON.stringify(ENTRY));
  entry.desigs=doTerms(doc.documentElement.getElementsByTagName("term"));
  return entry;
}

function doTerms(elTerms){
  var desigs=[];
  for(var iTerms=0; iTerms<elTerms.length; iTerms++) {
    var elTerm=elTerms[iTerms];
    var elLangSet=closest(elTerm, "langSet");
    var langCode=elLangSet.getAttribute("xml:lang");
    var desig=JSON.parse(JSON.stringify(DESIG));
    desig.term.lang=langCode;
    desig.term.wording=elTerm.textContent;
    desigs.push(desig);
    //Do the <term>'s <termNote>s, if any:
    var elTermGrp=closest(elTerm, "termGrp");
    var elTermNotes=elTermGrp.getElementsByTagName("termNote");
    for(var iTermNotes=0; iTermNotes<elTermNotes.length; iTermNotes++){
      var elTermNote=elTermNotes[iTermNotes];
      var tbxType=elTermNote.getAttribute("type");
      var tbxValue=elTermNote.textContent;
      if(tbxType=="transferComment" || tbxType=="usageNote"){
        desig.clarif=tbxValue;
      }
      else if(tbxType=="normativeAuthorization" || tbxType=="administrativeStatus" || tbxType=="language-planningQualifier" || tbxType=="register" || tbxType=="temporalQualifier"){
        desig.accept="$ACCEPTLABEL["+tbxValue+"]";
      }
      else if(tbxType=="proprietaryRestriction"){
        desig.term.annots.push({start: 1, stop: desig.term.wording.length, label: {type: "symbol", value: "tm"}});
      }
      else if(tbxType=="partOfSpeech" && tbxValue=="proper noun"){
        desig.term.annots.push({start: 1, stop: desig.term.wording.length, label: {type: "symbol", value: "proper"}});
      }
      else if(tbxType=="partOfSpeech" || tbxType=="animacy" || tbxType=="grammaticalGender" || tbxType=="grammaticalNumber" || tbxType=="termType"){
        desig.term.annots.push({start: 1, stop: desig.term.wording.length, label: {type: "posLabel", value: "$POSLABEL["+tbxValue+"]"}});
      }
    }
  }
  return desigs;
}

function closest(el, tagName){
  while(el.parentNode && el.parentNode.tagName!=tagName) el=el.parentNode;
  return el.parentNode;
}
