var Pretty={};

Pretty.metadatum=function(metadatum, lingo){
  if(metadatum.title.$) return metadatum.title.$;
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

  entry.domains.map(obj => {
    $ret.append(Pretty.domain(obj));
  });

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
    if(entry.intros[lang]) $ret.append(Pretty.intro(entry.intros[lang], lang));
  });
  if($ret.text()=="") $ret.html("—");
  return $ret;
}

Pretty.desig=function(desig, withLangLabel){
  var $ret=$("<div class='prettyDesig'></div>");
  var acceptLabel=Spec.getAcceptLabel(desig.accept); if(acceptLabel && acceptLabel.level<0) $ret.addClass("grey");
  if(withLangLabel) $ret.append(Pretty.lang(desig.term.lang));
  $ret.append(Pretty.wording(desig.term.wording, desig.term.annots));
  if(desig.accept) $ret.append(" ").append(Pretty.accept(desig.accept));
  if(desig.clarif) $ret.append(" ").append(Pretty.clarif(desig.clarif));
  if(desig.term.inflects.length>0){
    var $inflects=$("<div class='inflects'></div>").appendTo($ret);
    desig.term.inflects.map((obj, i) => {
      if(i>0) $inflects.append(", ");
      $inflects.append(Pretty.inflect(obj));
    });
  }
  return $ret;
};

Pretty.inflect=function(obj){
  var $ret=$("<span class='inflect'></span>");
  $ret.append("<span class='abbr'>"+Pretty.clean4html(Spec.getInflectLabel(obj.label).abbr)+":</span>")
  $ret.append("&nbsp;")
  $ret.append("<span class='wording'>"+Pretty.clean4html(obj.text)+"</span>")
  return $ret;
};

Pretty.lang=function(str){
  var $ret=$("<span class='prettyLang'></span>");
  $ret.append(str.toUpperCase());
  return $ret;
}

Pretty.wording=function(str, annots){
  var chars=[]; for(var i=0; i<str.length; i++) chars.push({char: str[i], markupBefore: "", markupAfter: "", labelsAfter: ""});
  annots.map((annot, index) => {
    var start=parseInt(annot.start)-1; if(start<0) start=0;
    var stop=parseInt(annot.stop); if(stop>chars.length) stop=chars.length; if(stop==0) stop=chars.length;
    for(var i=start; i<stop; i++){
      if(annot.label.type=="posLabel"){
        chars[i].markupBefore="<span class='char h"+index+"'>"+chars[i].markupBefore;
        chars[i].markupAfter=chars[i].markupAfter+"</span>";
        var label=Spec.getPosLabel(annot.label.value);
        var symbol=(label ? label.abbr : "???");
        if(i==stop-1) chars[i].labelsAfter=chars[i].labelsAfter+"<span class='label "+annot.label.type+"' onmouseover='Pretty.hon(this, "+index+")' onmouseout='Pretty.hoff(this, "+index+")'>"+symbol+"</span>"
      }
      else if(annot.label.type=="inflectLabel"){
        chars[i].markupBefore="<span class='char h"+index+"'>"+chars[i].markupBefore;
        chars[i].markupAfter=chars[i].markupAfter+"</span>";
        var label=Spec.getInflectLabel(annot.label.value);
        var symbol=(label ? label.abbr : "???");
        if(i==stop-1) chars[i].labelsAfter=chars[i].labelsAfter+"<span class='label "+annot.label.type+"' onmouseover='Pretty.hon(this, "+index+")' onmouseout='Pretty.hoff(this, "+index+")'>"+symbol+"</span>"
      }
      else if(annot.label.type=="langLabel"){
        chars[i].markupBefore="<span class='char h"+index+"'>"+chars[i].markupBefore;
        chars[i].markupAfter=chars[i].markupAfter+"</span>";
        var symbol=(annot.label.value ? annot.label.value.toUpperCase() : "???");
        if(i==stop-1) chars[i].labelsAfter=chars[i].labelsAfter+"<span class='label "+annot.label.type+"' onmouseover='Pretty.hon(this, "+index+")' onmouseout='Pretty.hoff(this, "+index+")'>"+symbol+"</span>"
      }
      else if(annot.label.type=="symbol"){
        chars[i].markupBefore="<span class='char h"+index+"'>"+chars[i].markupBefore;
        chars[i].markupAfter=chars[i].markupAfter+"</span>";
        var symbol="???";
        if(annot.label.value=="tm") symbol="<span style='position: relative; top: -5px; font-size: 0.5em'>TM</span>";
        if(annot.label.value=="regtm") symbol="®";
        if(annot.label.value=="proper") symbol="¶";
        if(i==stop-1) chars[i].labelsAfter=chars[i].labelsAfter+"<span class='label "+annot.label.type+"' onmouseover='Pretty.hon(this, "+index+")' onmouseout='Pretty.hoff(this, "+index+")'>"+symbol+"</span>"
      }
      else if(annot.label.type=="formatting"){
        chars[i].markupBefore="<span style='font-style: italic'>"+chars[i].markupBefore;
        chars[i].markupAfter=chars[i].markupAfter+"</span>";
      }
    }
  });

  str=""; chars.map(c => { str+=c.markupBefore+c.char+c.markupAfter+c.labelsAfter; });
  var $ret=$("<span class='prettyWording'>"+str+"</span>");
  return $ret;
}
Pretty.hon=function(label, i){
  $(label).addClass("on").closest(".prettyWording").find(".h"+i).addClass("on");
};
Pretty.hoff=function(label, i){
  $(label).removeClass("on").closest(".prettyWording").find(".h"+i).removeClass("on");
};

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

Pretty.domain=function(obj){
  var $ret=$("<div class='prettyDomain'></div>");
  var domain=Spec.getDomain(obj.superdomain);
  if(domain){
    $ret.append("<span class='step'>"+Pretty.title(domain.title)+"</span>");
    if(obj.subdomain){
      var subdomain=Pretty.findSubdomain(domain, obj.subdomain);
      subdomain._parents.map(d => {
        $ret.append("&nbsp; »&nbsp; ");
        $ret.append("<span class='step'>"+Pretty.title(d.title)+"</span>");
      });
      $ret.append("&nbsp; »&nbsp; ");
      $ret.append("<span class='step'>"+Pretty.title(subdomain.title)+"</span>");
    }
  }
  return $ret;
};

Pretty.intro=function(str, lang){
  var $ret=$("<div class='prettyIntro' lang='"+lang+"'></div>");
  $ret.append("("+str+")");
  return $ret;
};


//---

Pretty.clean4html=function(str){
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

Pretty.title=function(title){
  var ret="";
  var done=[];
  termbaseConfigs.lingo.languages.map(lang => {
    if(lang.role=="major" && title[lang.abbr] && done.indexOf(title[lang.abbr])==-1) {
      if(ret+="") ret+="/";
      ret+="<span>"+title[lang.abbr]+"</span>";
      done.push(title[lang.abbr]);
    }
  });
  return ret;
};

Pretty.findSubdomain=function(domain, subdomainID){
  if(!domain._reverseSubdomains) {
    domain._reverseSubdomains={}; //lid => {_parents: [{...}], ...},
    go(null, domain.subdomains)
    function go(parentSubdomain, subdomains){
      for(var i=0; i<subdomains.length; i++){
        var sd=subdomains[i];
        domain._reverseSubdomains[sd.lid]=sd;
        sd._parents=[];
        if(parentSubdomain){
          parentSubdomain._parents.map(p => {sd._parents.push(p)});
          sd._parents.push(parentSubdomain);
        }
        go(sd, sd.subdomains);
      }
    }
  }
  return domain._reverseSubdomains[subdomainID];
};
