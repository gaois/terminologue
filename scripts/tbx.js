const fs=require("fs");
const xmlformatter=require("xml-formatter");
var entryCount=0;

var tbx=fs.readFileSync("/home/mbm/deleteme/terminologue-import-sources/microsoft/microsoft-ga.tbx", "utf8");
// var tbx=fs.readFileSync("/home/mbm/deleteme/terminologue-import-sources/microsoft/microsoft-cs.tbx", "utf8");
// var tbx=fs.readFileSync("/home/mbm/deleteme/terminologue-import-sources/microsoft/microsoft-de.tbx", "utf8");
const START="<termEntry";
const END="</termEntry>";
var buffer="";
for(var i=0; i<tbx.length; i++){
  if(tbx.substr(i, START.length)==START){
    i+=START.length-1;
    buffer=START;
  } else if(tbx.substr(i, END.length)==END) {
    i+=END.length-1;
    buffer+=END;
    doEntry(buffer);
    buffer="";
  } else {
    if(buffer!="") buffer+=tbx[i];
  }
}

function doEntry(xml){
  entryCount++;
  xml=xmlformatter(xml, {collapseContent: true});
  console.log(xml);
}

console.log(entryCount);
