function L(s){
  if(s=="only") return function(s){
    return "only "+s;
  };
  if(s=="trigger_dateStampChange") return "datestamp changed";
  if(s=="trigger_domainAdd") return "domain added";
  if(s=="trigger_domainRemove") return "domain removed";
  if(s=="trigger_domainReorder") return "domains reordered";
  if(s=="trigger_domainChange") return "domain changed";
  if(s=="trigger_desigAdd") return "term added";
  if(s=="trigger_desigRemove") return "term removed";
  if(s=="trigger_desigReorder") return "terms reordered";
  if(s=="trigger_desigClarifChange") return "clarification changed";
  if(s=="trigger_desigAcceptChange") return "acceptability changed";
  if(s=="trigger_termLangChange") return "term language changed";
  if(s=="trigger_termWordingChange") return "term wording changed";
  if(s=="trigger_termInflectAdd") return "inlected form added";
  if(s=="trigger_termInflectRemove") return "inflected form removed";
  if(s=="trigger_termInflectReorder") return "inflected forms reordered";
  if(s=="trigger_termInflectLabelChange") return "inflected form label changed";
  if(s=="trigger_termInflectTextChange") return "inflected form wording changed";
  if(s=="trigger_termAnnotAdd") return "term annotation added";
  if(s=="trigger_termAnnotRemove") return "term annotaion removed";
  if(s=="trigger_termAnnotReorder") return "term annotations reordered";
  if(s=="trigger_termAnnotPositionChange") return "term annotation position changed";
  if(s=="trigger_termAnnotLabelChange") return "term annotation label changed";
  if(s=="trigger_introChange") return "intro changed";
  if(s=="trigger_definitionAdd") return "definition added";
  if(s=="trigger_definitionRemove") return "definition removed";
  if(s=="trigger_definitionReorder") return "definitions reordered";
  if(s=="trigger_definitionTextChange") return "definition text changed";
  if(s=="trigger_exampleAdd") return "example added";
  if(s=="trigger_exampleRemove") return "example removed";
  if(s=="trigger_exampleReorder") return "examples reordered";
  if(s=="trigger_exampleTextAdd") return "example sentence added";
  if(s=="trigger_exampleTextRemove") return "example sentence removed";
  if(s=="trigger_exampleTextReorder") return "example sentences reordered";
  if(s=="trigger_exampleTextChange") return "example sentence wording changed";
  if(s=="trigger_collectionAdd") return "collection added";
  if(s=="trigger_collectionRemove") return "collection removed";
  if(s=="trigger_collectionReorder") return "collections reordered";
  if(s=="trigger_collectionChange") return "collection changed";
  if(s=="trigger_extranetAdd") return "extranet added";
  if(s=="trigger_extranetRemove") return "extranet removed";
  if(s=="trigger_extranetReorder") return "extranets reordered";
  if(s=="trigger_extranetChange") return "extranet changed";
  if(s=="trigger_sourceAdd") return "source added";
  if(s=="trigger_sourceRemove") return "source removed";
  if(s=="trigger_sourceReorder") return "source reordered";
  if(s=="trigger_sourceChange") return "source changed";
  if(s=="trigger_nonessentialChange") return "non-essentiality changed";
  return s;
}

try {
  module.exports={
    L: L,
  }
} catch(e){}
