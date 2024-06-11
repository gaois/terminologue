module.exports=function(spec, columns){
  return doEntry(spec, columns);
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
const DEFINITION={
  "texts": {},
  "sources": [],
  "domains": [],
  "nonessential": "0"
};
const DEFINITION_SOURCE={
  "id": "",
  "lang": ""
};
const NOTE={
  "type": "",
  "texts": {},
  "sources": [],
  "nonessential": "0"
};

function doEntry(spec, columns){
  columns.map(s => s.trim());

  const entry=JSON.parse(JSON.stringify(ENTRY));
  (spec.collectionIDs || []).map(id => {
    entry.collections.push(id.toString());
  });
  (spec.domainIDs || []).map(id => {
    entry.domains.push(id.toString());
  });

  const objects=[];
  spec.columns.map((columnSpec, iColumn) => {
    if(columns.length>iColumn && columns[iColumn]!=""){
      
      if(columnSpec.as=="term"){
        const desig=JSON.parse(JSON.stringify(DESIG));
        desig.term.wording=columns[iColumn];
        desig.term.lang=columnSpec.lang;
        entry.desigs.push(desig);
        objects[iColumn]=desig;
      }

      if(columnSpec.as=="definition" && columnSpec.continues===undefined){
        const def=JSON.parse(JSON.stringify(DEFINITION));
        def.texts[columnSpec.lang]=columns[iColumn];
        entry.definitions.push(def);
        objects[iColumn]=def;
      }

      if(columnSpec.as=="definition" && columnSpec.continues!==undefined){
        const def=objects[columnSpec.continues];
        def.texts[columnSpec.lang]=columns[iColumn];
      }

      if(columnSpec.as=="definitionSource" && columnSpec.continues!==undefined){
        const defSrc=JSON.parse(JSON.stringify(DEFINITION_SOURCE));
        defSrc.id=`$SOURCE[${columns[iColumn]}]`;
        defSrc.lang=columnSpec.lang || "";
        objects[columnSpec.continues].sources.push(defSrc);
      }

      if(columnSpec.as=="note" && columnSpec.continues===undefined){
        const note=JSON.parse(JSON.stringify(NOTE));
        note.type=columnSpec.type.toString();
        note.texts[columnSpec.lang]=columns[iColumn];
        entry.notes.push(note);
        objects[iColumn]=note;
      }

    }
  });
  return entry;
}

