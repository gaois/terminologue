var Pretty={};

Pretty.metadatum=function(metadatum, lingo){
  var ret="";
  var strings=[];
  lingo.languages.map(lang => {
    if(lang.role=="major" && metadatum.title[lang.abbr]){
      var string=Pretty.clean4html(metadatum.title[lang.abbr]);
      if(strings.indexOf(string)==-1){
        if(strings.length>0) ret+="/"
        ret+="<span>"+string+"</span>";
        strings.push(string);
      }
    }
  });
  ret="<span class='prettyMetadatum'>"+ret+"</span>"
  return ret;
}

//---

Pretty.entry=function(entry){
  var $ret=$("<div class='prettyEntry'></div>");
  var langs=[$(".lineModifiersRight .current").data("value")];
  termbaseConfigs.lingo.languages.map(lang => { if(langs.indexOf(lang.abbr)==-1) langs.push(lang.abbr); });
  var langsDone=[];
  langs.map(lang => {
    entry.desigs.map(desig => {
      if(desig.term.lang==lang) {
        $ret.append(Pretty.desig(desig, (langsDone.indexOf(lang)==-1)));
        langsDone.push(lang);
      }
    });

  });
  return $ret;
}

Pretty.desig=function(desig, withLangLabel){
  var $ret=$("<div class='prettyDesig'></div>");
  if(withLangLabel) $ret.append(Pretty.lang(desig.term.lang));
  $ret.append(Pretty.wording(desig.term.wording));
  if(desig.accept) $ret.append(" ").append(Pretty.accept(desig.accept));
  if(desig.clarif) $ret.append(" ").append(Pretty.clarif(desig.clarif));
  return $ret;
}

Pretty.lang=function(str){
  var $ret=$("<span class='prettyLang'></span>");
  $ret.append(str.toUpperCase());
  return $ret;
}

Pretty.wording=function(str){
  var $ret=$("<span class='prettyWording'></span>");
  $ret.append(str);
  return $ret;
}

Pretty.clarif=function(str){
  var $ret=$("<span class='clarif'></span>");
  $ret.append("("+str+")");
  return $ret;
}

Pretty.accept=function(str){
  var label=Spec.getAcceptLabel(str);
  if(!label) return $("");
  var $ret=$("<span class='accept'></span>");
  $ret.append(Spec.title(label.title));
  return $ret;
}



//---

Pretty.clean4html=function(str){
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
