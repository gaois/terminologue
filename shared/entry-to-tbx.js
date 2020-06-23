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
  return ["ga", "en"];
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
    ret+=`</termGrp>`;
  ret+=`</ntig>`;
  return ret;
}
