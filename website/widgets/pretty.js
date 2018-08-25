var Pretty={};

Pretty.entry=function(entry){
  var $ret=$("<div class='prettyEntry'></div>");
  entry.desigs.map(desig => { $ret.append(Pretty.desig(desig)) });
  return $ret;
}

Pretty.desig=function(desig){
  var $ret=$("<div class='prettyDesig'></div>");
  $ret.append(Pretty.term(desig.term));
  return $ret;
}

Pretty.term=function(term){
  var $ret=$("<span class='prettyTerm'></span>");
  $ret.append(Pretty.lang(term.lang));
  $ret.append(" ");
  $ret.append(Pretty.wording(term.wording));
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
