module.exports=function(entry){
  if(typeof(entry)=="string") entry=JSON.parse(entry);
  return doEntry(entry);
}

function clean4xml(s){
  s=s.replace(/\&/g, "&amp;");
  s=s.replace(/\"/g, "&quot;");
  s=s.replace(/\'/g, "&apos;");
  s=s.replace(/\</g, "&lt;");
  s=s.replace(/\>/g, "&gt;");
  return s;
}

function doEntry(entry){
  var langCodes=discoverLangs(entry);
  var ret=`<termEntry id="eid-${entry.id}">`;
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
  ret+=`</langSet>`;
  if(!empty) return ret;
  return "";
}

function doDesig(desig){
  var ret=`<ntig>`;
    ret+=`<termGrp>`;
      ret+=`<term id="tid-${desig.term.id}">${clean4xml(desig.term.wording)}</term>`;
      //the desig's term's annotations:
      desig.term.annots.map(annot => {
        var type="";
        var value="";
        if(annot.label.type=="posLabel" || annot.label.type=="inflectLabel"){
          type="partOfSpeech";
          value="$["+annot.label.value+"]";
        }
        if(annot.label.type=="langLabel"){
          type="etymology";
          value="$["+annot.label.value+"]";
        }
        if(annot.label.type=="symbol" && (annot.label.value=="tm" || annot.label.value=="regtm")){
          type="proprietaryRestriction";
          value="trademark";
        };
        if(annot.label.type=="symbol" && annot.label.value=="proper"){
          type="partOfSpeech";
          value="proper noun";
        };
        ret+=`<termNote type="${type}">${clean4xml(value)}</termNote>`;
      });
      //the desig's clarification:
      if(desig.clarif){
        ret+=`<termNote type="transferComment">${clean4xml(desig.clarif)}</termNote>`;
      }
      //the desig's acceptability:
      if(desig.accept){
        ret+=`<termNote type="normativeAuthorization">$[${desig.accept}]</termNote>`;
      }
    ret+=`</termGrp>`;
  ret+=`</ntig>`;
  return ret;
}
