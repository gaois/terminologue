var termbaseLang="";
var metadata={};
var spec={};

module.exports={
  setTermbaseLang: function(langCode){ termbaseLang=langCode; },
  setMetadata: function(objMetadata){ metadata=objMetadata; },
  setSpec: function(objSpec){ spec=objSpec; },
  doEntry: doEntry,
}

function metadataAbbr(id){
  var ret=id;
  if(id=="proper") ret="¶";
  if(id=="tm") ret="™";
  if(id=="regtm") ret="®";
  if(metadata[id] && metadata[id].obj.abbr) ret=metadata[id].obj.abbr;
  return ret;
}

function metadataTitle(id, langCode){
  var ret="";
  if(metadata[id]) ret=(metadata[id].obj.title[langCode] || metadata[id].obj.title.$ || metadata[id].obj.title[termbaseLang]);
  return (ret || id);
}

function domainTitle(id, langCode){
  var ret="";
  if(metadata[id]){
    ret=(metadata[id].obj.title.$ || metadata[id].obj.title[langCode]);
    if(metadata[id].obj.parentID && metadata[metadata[id].obj.parentID]){
      ret=domainTitle(metadata[id].obj.parentID, langCode)+" » "+ret;
    }
  }
  return (ret || id);
}

function doEntry(entry){
  var line="";
  spec.columns.map((colSpec, iCol) => {
    if(colSpec.what=="id") line+=doID(entry, colSpec).replace(spec.separator, spec.separatorEscape);
    if(colSpec.what=="domains") line+=doDomains(entry, colSpec).replace(spec.separator, spec.separatorEscape);
    if(colSpec.what=="terms") line+=doTerms(entry, colSpec).replace(spec.separator, spec.separatorEscape);
    if(colSpec.what=="intro") line+=doIntro(entry, colSpec).replace(spec.separator, spec.separatorEscape);
    if(colSpec.what=="definitions") line+=doDefinitions(entry, colSpec).replace(spec.separator, spec.separatorEscape);
    if(colSpec.what=="examples") line+=doExamples(entry, colSpec).replace(spec.separator, spec.separatorEscape);
    if(colSpec.what=="notes") line+=doNotes(entry, colSpec).replace(spec.separator, spec.separatorEscape);
    if(iCol<spec.columns.length-1) line+=spec.separator;
  });
  return line.trim();
}

function doID(entry, colSpec){
  return entry.id.toString();
}

function doDomains(entry, colSpec){
  var ret="";
  entry.domains.map(domainID => {
    if(ret!="") ret+=spec.joiner;
    ret+=domainTitle(domainID, colSpec.lang).replace(/\r?\n/g, spec.linebreakEscape).replace(spec.joiner, spec.joinerEscape);
  });
  return ret;
}

function doIntro(entry, colSpec){
  var ret="";
  if(entry.intros[colSpec.lang]){
    ret+=entry.intros[colSpec.lang].replace(/\r?\n/g, spec.linebreakEscape).replace(spec.joiner, spec.joinerEscape);
  }
  return ret;
}

function doDefinitions(entry, colSpec){
  var ret="";
  entry.definitions.map(def => {
    if(def.texts[colSpec.lang]){
      if(ret!="") ret+=spec.joiner;
      ret+=def.texts[colSpec.lang].replace(/\r?\n/g, spec.linebreakEscape).replace(spec.joiner, spec.joinerEscape);
    }
  });
  return ret;
}

function doExamples(entry, colSpec){
  var ret="";
  entry.examples.map(ex => {
    ex.texts[colSpec.lang].map(txt => {
      if(ret!="") ret+=spec.joiner;
      ret+=txt.replace(/\r?\n/g, spec.linebreakEscape).replace(spec.joiner, spec.joinerEscape);
    });
  });
  return ret;
}

function doNotes(entry, colSpec){
  var ret="";
  entry.notes.map(note => {
    if(note.type==colSpec.type){
      if(note.texts[colSpec.lang]){
        if(ret!="") ret+=spec.joiner;
        ret+=note.texts[colSpec.lang].replace(/\r?\n/g, spec.linebreakEscape).replace(spec.joiner, spec.joinerEscape);
      }
    }
  });
  return ret;
}

function doTerms(entry, colSpec){
  var ret="";
  entry.desigs.map(desig => {
    if(desig.term.lang==colSpec.lang){
      if(ret!="") ret+=spec.joiner;
      var s="";
      if(!colSpec.includeAnnotations) {
        s=desig.term.wording.replace(/\(/g, spec.openBracketEscape).replace(/\)/g, spec.closeBracketEscape);
      } else {
        desig.term.wording.split("").map((c, i) => {
          if(c=="(") c=spec.openBracketEscape;
          if(c==")") c=spec.closeBracketEscape;
          s+=c;
          desig.term.annots.map(annot => {
            if(annot.label.value){
              var stop=parseInt(annot.stop); if(stop>desig.term.wording.length) stop=desig.term.wording.length; if(stop==0) stop=desig.term.wording.length;
              if(stop==(i+1)){
                s+=" ("+metadataAbbr(annot.label.value)+")";
              }
            }
          });
        });
      }
      s=s.trim();
      var inbracket="";
      if(colSpec.includeAcceptability){
        if(desig.accept){
          if(inbracket!="") inbracket+=", ";
          inbracket+=metadataTitle(desig.accept, colSpec.lang).replace(/\,/g, spec.commaEscape);
        }
      }
      if(colSpec.includeClarification){
        if(desig.clarif){
          if(inbracket!="") inbracket+=", ";
          inbracket+=desig.clarif.replace(/\,/g, spec.commaEscape);
        }
      }
      if(colSpec.includeInflectedForms){
        desig.term.inflects.map(inflect => {
          if(inbracket!="") inbracket+=", ";
          inbracket+=(metadataAbbr(inflect.label)+": "+inflect.text).replace(/\,/g, spec.commaEscape);
        });
      }
      if(inbracket) s+=" ("+inbracket.trim().replace(/\(/g, spec.openBracketEscape).replace(/\)/g, spec.closeBracketEscape)+")";
      ret+=s.replace(spec.joiner, spec.joinerEscape);
    }
  });
  return ret.replace(/\) \(/g, ", ");
}
