const DOMParser=require("@xmldom/xmldom").DOMParser;
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
  var langCode="xx"; if(entry.desigs.length>0) langCode=entry.desigs[0].term.lang;
  var elDescrips=doc.documentElement.getElementsByTagName("descrip");
  for (var i=0; i<elDescrips.length; i++) {
    var elDescrip=elDescrips[i];
    var elTig=closest(elDescrip, ["tig", "ntig"]);
    if(!elTig){ //this <descrip> is not under a <tig> or <ntig>:
      var tbxType=elDescrip.getAttribute("type");
      var tbxValue=elDescrip.textContent;
      var elLangSet=closest(elDescrip, ["langSet"]); if(elLangSet) langCode=elLangSet.getAttribute("xml:lang") || langCode;
      if(
        tbxType=="context" || tbxType=="Context" ||
        tbxType=="example" ||
        tbxType=="sampleSentence"
      ){
        //example:
        var obj={texts: {}, sources: [], nonessential: "0"};
        obj.texts[langCode]=[tbxValue];
        entry.examples.push(obj);
      } else if(
        tbxType=="definition" ||
        tbxType=="explanation"
      ){
        //definition:
        var obj={texts: {}, domains: [], sources: [], nonessential: "0"};
        obj.texts[langCode]=tbxValue;
        entry.definitions.push(obj);
      } else if(
        tbxType=="subjectField" ||
        tbxType=="domain" ||  tbxType=="Domain"
      ){
        //domain:
        entry.domains.push("$DOMAIN["+tbxValue+"]");
      }
    }
  }
  return entry;
}

function doTerms(elTerms){
  var desigs=[];
  for(var iTerms=0; iTerms<elTerms.length; iTerms++) {
    var elTerm=elTerms[iTerms];
    var elLangSet=closest(elTerm, ["langSet"]);
    var langCode=elLangSet.getAttribute("xml:lang");
    var desig=JSON.parse(JSON.stringify(DESIG));
    desig.term.lang=langCode;
    desig.term.wording=elTerm.textContent;
    desigs.push(desig);
    //Do the <term>'s <termNote>s and <descrip>s, if any:
    var elTermGrp=closest(elTerm, ["termGrp", "tig"]);
    var elTermDescribers=[];
      var elTermNotes=elTermGrp.getElementsByTagName("termNote");
        for(var i=0; i<elTermNotes.length; i++) elTermDescribers.push(elTermNotes[i]);
      var elDescrips=elTermGrp.getElementsByTagName("descrip");
        for(var i=0; i<elDescrips.length; i++) elTermDescribers.push(elDescrips[i]);
    for(var iTermDescribers=0; iTermDescribers<elTermDescribers.length; iTermDescribers++){
      var elTermDescriber=elTermDescribers[iTermDescribers];
      var tbxType=elTermDescriber.getAttribute("type");
      var tbxValue=elTermDescriber.textContent;
      if(
        tbxType=="transferComment" ||
        tbxType=="usageNote"
      ){
        desig.clarif=tbxValue;
      }
      else if(
        tbxType=="normativeAuthorization" ||
        tbxType=="administrativeStatus" ||
        tbxType=="language-planningQualifier" ||
        tbxType=="register" ||
        tbxType=="temporalQualifier" ||
        tbxType=="status" || tbxType=="Status"
      ){
        desig.accept="$ACCEPTLABEL["+tbxValue+"]";
      }
      else if(tbxType=="proprietaryRestriction"){
        desig.term.annots.push({start: 1, stop: desig.term.wording.length, label: {type: "symbol", value: "tm"}});
      }
      else if(
        tbxType=="partOfSpeech" && tbxValue=="properNoun"){
        desig.term.annots.push({start: 1, stop: desig.term.wording.length, label: {type: "symbol", value: "proper"}});
      }
      else if(
        tbxType=="partOfSpeech" ||
        tbxType=="animacy" ||
        tbxType=="grammaticalGender" ||
        tbxType=="grammaticalNumber" ||
        tbxType=="termType"
      ){
        desig.term.annots.push({start: 1, stop: desig.term.wording.length, label: {type: "posLabel", value: "$POSLABEL["+tbxValue+"]"}});
      }
    }
  }
  return desigs;
}

function closest(el, tagNames){
  while(el.parentNode && tagNames.indexOf(el.parentNode.tagName)==-1) el=el.parentNode;
  return el.parentNode;
}
