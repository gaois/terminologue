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

Pretty.clean4html=function(str){
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
