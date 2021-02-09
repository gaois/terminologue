var termbaseLang="";
var metadata={};

module.exports={
  setTermbaseLang: function(langCode){ termbaseLang=langCode; },
  setMetadata: function(objMetadata){ metadata=objMetadata; },
  doEntry: doEntry,
}

function clean4xml(s){
  s=s.replace(/\&/g, "&amp;");
  s=s.replace(/\"/g, "&quot;");
  s=s.replace(/\'/g, "&apos;");
  s=s.replace(/\</g, "&lt;");
  s=s.replace(/\>/g, "&gt;");
  return s;
}

function metadataAbbr(id){
  var ret=id;
  if(metadata[id] && metadata[id].obj.abbr) ret=metadata[id].obj.abbr;
  return ret;
}

function metadataTitle(id, langCode){
  var ret="";
  if(metadata[id]) ret=(metadata[id].obj.title[langCode] || metadata[id].obj.title.$ || metadata[id].obj.title[termbaseLang]);
  return (ret || id);
}

function domainTitle(id){
  var ret="";
  if(metadata[id]){
    ret=(metadata[id].obj.title.$ || metadata[id].obj.title[termbaseLang]);
    if(metadata[id].obj.parentID && metadata[metadata[id].obj.parentID]){
      ret=domainTitle(metadata[id].obj.parentID)+" » "+ret;
    }
  }
  return (ret || id);
}

/*
<termEntry>
  <descrip type="subjectField"> = domain
    <langSet>
      <ntig>
        <termGrp>
          <term>
          <termNote>
      <descrip type="explanation"> = intro
      <descrip type="definition">
      <descrip type="example">
*/

function doEntry(entry){
  var langCodes=discoverLangs(entry);
  var ret=`<termEntry id="eid-${entry.id}">`;
  entry.domains.map(domainID => {
    ret+=`<descrip type="subjectField">${domainTitle(domainID)}</descrip>`;
  });
  langCodes.map(langCode => {
    ret+=doLangset(entry, langCode);
  });
  ret+=`</termEntry>`;
  return ret;
}

function discoverLangs(entry){
  var ret=[];
  entry.desigs.map(desig => {
    if(ret.indexOf(desig.term.lang)==-1) ret.push(desig.term.lang);
  });
  return ret;
}

function doLangset(entry, langCode){
  var empty=true;
  var ret=`<langSet xml:lang="${langCode}">`;
  entry.desigs.map(desig => {
    if(desig.term.lang==langCode){
      ret+=doDesig(desig);
      empty=false;
    }
  });
  if(entry.intros[langCode]){
    ret+=`<descrip type="explanation">${clean4xml(entry.intros[langCode])}</descrip>`;
  }
  entry.definitions.map(def => {
    if(def.texts[langCode]){
      ret+=`<descrip type="definition">${clean4xml(def.texts[langCode])}</descrip>`;
    }
  });
  entry.examples.map(ex => {
    if(ex.texts[langCode]){
      ex.texts[langCode].map(txt => {
        ret+=`<descrip type="example">${clean4xml(txt)}</descrip>`;
      });
    }
  });
  ret+=`</langSet>`;
  if(!empty) return ret;
  return "";
}

function doDesig(desig){
  var ret=`<ntig>`;
    ret+=`<termGrp>`;
      ret+=`<term>${clean4xml(desig.term.wording)}</term>`;
      //the desig's term's annotations:
      desig.term.annots.map(annot => {
        var type="";
        var value="";
        if(annot.label.type=="posLabel" || annot.label.type=="inflectLabel"){
          type="partOfSpeech";
          value=metadataAbbr(annot.label.value);
        }
        if(annot.label.type=="langLabel"){
          type="etymology";
          value=annot.label.value;
        }
        if(annot.label.type=="symbol" && (annot.label.value=="tm" || annot.label.value=="regtm")){
          type="proprietaryRestriction";
          value="trademark";
        };
        if(annot.label.type=="symbol" && annot.label.value=="proper"){
          type="partOfSpeech";
          value="properNoun";
        };
        if(type!="") ret+=`<termNote type="${type}">${clean4xml(value)}</termNote>`;
      });
      //the desig's clarification:
      if(desig.clarif){
        ret+=`<termNote type="transferComment">${clean4xml(desig.clarif)}</termNote>`;
      }
      //the desig's acceptability:
      if(desig.accept){
        ret+=`<termNote type="normativeAuthorization">${metadataTitle(desig.accept, desig.term.lang)}</termNote>`;
      }
    ret+=`</termGrp>`;
  ret+=`</ntig>`;
  return ret;
}
