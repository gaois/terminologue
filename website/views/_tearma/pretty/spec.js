var Spec={
  templates: {},
};
Spec.title=function(title){
  var ret="";
  var done=[];
  termbaseConfigs.lingo.languages.map(lang => {
    if(lang.role=="major" && title[lang.abbr] && done.indexOf(title[lang.abbr])==-1) {
      if(ret+="") ret+="/";
      ret+=title[lang.abbr];
      done.push(title[lang.abbr]);
    }
  });
  return ret;
};
Spec.getDomain=function(id){
  var ret=null;
  termbaseMetadata.domain.map(datum => {  if(!ret && datum.id==id) ret=datum; });
  return ret;
};
Spec.getAcceptLabel=function(id){
  var ret=null;
  termbaseMetadata.acceptLabel.map(datum => {  if(!ret && datum.id==id) ret=datum; });
  return ret;
};
Spec.getLangRole=function(abbr){
  var ret=null;
  termbaseConfigs.lingo.languages.map(lang => { if(!ret && lang.abbr==abbr) ret=lang.role; });
  return ret;
};
Spec.getInflectLabel=function(id){
  var ret=null;
  termbaseMetadata.inflectLabel.map(datum => {  if(!ret && datum.id==id) ret=datum; });
  return ret;
};
Spec.getPosLabel=function(id){
  var ret=null;
  termbaseMetadata.posLabel.map(datum => {  if(!ret && datum.id==id) ret=datum; });
  return ret;
};

Spec.sharEnquire=function($term, termID, lang, wording){
  var $bubble=$term.find(".fy_bubble").hide().removeClass("fullon").removeClass("sublime").removeClass("invisible").html("");
  $.ajax({url: "./sharEnquire.json", dataType: "json", method: "POST", data: {termID: termID, lang: lang, wording: wording}}).done(function(data){
    if(data.sharedBy.length>1){
      $bubble.addClass("fullon").html(data.sharedBy.length).show();
    } else if(data.similarTo.length>0){
      $bubble.addClass("sublime").html(data.similarTo.length).show();
    }
  });
};
