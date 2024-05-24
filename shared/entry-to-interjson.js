var termbaseLang="";
var metadata={};

module.exports={
  setTermbaseLang: function(langCode){ termbaseLang=langCode; },
  setMetadata: function(objMetadata){ metadata=objMetadata; },
  doEntry: doEntry,
}

function metadataAbbr(id){
  var ret=id;
  if(metadata[id] && metadata[id].obj.abbr) ret=metadata[id].obj.abbr;
  return ret;
}

function metadataTitle(id, langCode){
  var ret="";
  if(metadata[id]) {
    // ret=(metadata[id].obj.title[langCode] || metadata[id].obj.title.$ || metadata[id].obj.title[termbaseLang]);
    // if(!ret)
    for(var lang in metadata[id].obj.title){ if(!ret) ret=metadata[id].obj.title[lang]; }
  }
  return ret || id;
}

function domainTitle(id){
  var ret="";
  if(metadata[id]){
    ret=(metadata[id].obj.title.$ || metadata[id].obj.title[termbaseLang]);
    if(!ret) for(var lang in metadata[id].obj.title){ if(!ret) ret=metadata[id].obj.title[lang]; }
    if(metadata[id].obj.parentID && metadata[metadata[id].obj.parentID]){
      ret=domainTitle(metadata[id].obj.parentID)+" » "+ret;
    }
  }
  return ret || id;
}

function doEntry(entry){
  delete entry.id;
  delete entry.xrefs;
  delete entry.extranets;
  if(entry.desigs) entry.desigs.map(desig => {
    desig.term.annots.map(annot => {
      if(annot.label.type=="posLabel") annot.label.value="$POSLABEL["+metadataAbbr(annot.label.value)+"]";
      if(annot.label.type=="inflectLabel") annot.label.value="$INFLECTLABEL["+metadataAbbr(annot.label.value)+"]";
    });
    desig.term.inflects.map(inflect => {
      inflect.label="$INFLECTLABEL["+metadataAbbr(inflect.label)+"]";
    });
    if(desig.accept) desig.accept="$ACCEPTLABEL["+metadataTitle(desig.accept)+"]";
    for(var i=0; i<desig.sources.length; i++){
      desig.sources[i]="$SOURCE["+domainTitle(desig.sources[i])+"]";
    }
  });
  if(entry.domains) for(var i=0; i<entry.domains.length; i++){
    entry.domains[i]="$DOMAIN["+domainTitle(entry.domains[i])+"]";
  }
  if(entry.definitions) entry.definitions.map(def => {
    for(var i=0; i<def.domains.length; i++){
      def.domains[i]="$DOMAIN["+domainTitle(def.domains[i])+"]";
    }
    def.sources.map(source => {
      source.id="$SOURCE["+metadataTitle(source.id)+"]";
    });
  });
  if(entry.examples) entry.examples.map(ex => {
    ex.sources.map(source => {
      source.id="$SOURCE["+metadataTitle(source.id)+"]";
    });
  });
  if(entry.notes) entry.notes.map(note => {
    note.type="$NOTETYPE["+metadataTitle(note.type)+"]";
    note.sources.map(source => {
      source.id="$SOURCE["+metadataTitle(source.id)+"]";
    });
  });
  if(entry.collections) for(var i=0; i<entry.collections.length; i++){
    entry.collections[i]="$COLLECTION["+metadataTitle(entry.collections[i])+"]";
  }
  return entry;
}
