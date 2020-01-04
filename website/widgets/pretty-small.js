var PrettySmall={};

PrettySmall.metadatum=function(metadatum, lingo){
  var ret="";
  if(metadatum.abbr) ret+="<span class='abbr'>"+metadatum.abbr+"</span> ";
  if(typeof(metadatum.title)=="string") {
    ret+=metadatum.title;
  } else if(metadatum.title.$) {
    ret+=metadatum.title.$;
  } else {
    var strings=[];
    lingo.languages.map(lang => {
      if(lang.role=="major" && metadatum.title[lang.abbr]){
        var string=PrettySmall.clean4html(metadatum.title[lang.abbr]);
        if(strings.indexOf(string)==-1){
          if(strings.length>0) ret+="/"
          ret+="<span>"+string+"</span>";
          strings.push(string);
        }
      }
    });
  }
  ret="<span class='prettyMetadatum'>"+ret+"</span>"
  return ret;
}

//---

PrettySmall.entry=function(entry){
  var $ret=$("<div class='prettyEntry small'></div>");

  if(entry.commentCount){
    $ret.append("<span class='commentCount'><span class='num'>"+entry.commentCount+"</span></span>");
  }

  entry.domains.map(obj => {
    $ret.append(PrettySmall.domain(obj));
  });

  var langs=[$(".lineModifiersRight .current").data("value")];
  termbaseConfigs.lingo.languages.map(lang => { if(langs.indexOf(lang.abbr)==-1) langs.push(lang.abbr); });
  var langsDone=[];
  langs.map(lang => {
    entry.desigs.map(desig => {
      if(desig.term.lang==lang && (desig.nonessential || "0")=="0") {
        $ret.append(PrettySmall.desig(desig, (langsDone.indexOf(lang)==-1)));
        langsDone.push(lang);
      }
    });
    if(entry.intros[lang]) $ret.append(PrettySmall.intro(entry.intros[lang], lang));
  });

  var $bin=$("<div class='prettyBin'></div>").appendTo($ret);
  if(entry.definitions && entry.definitions.length>0) $("<span class='boxick'>"+L("DEF")+"</span>").appendTo($bin);
  if(entry.examples && entry.examples.length>0) $("<span class='boxick'>"+L("XMPL")+"</span>").appendTo($bin);
  if(entry.notes && entry.notes.length>0) $("<span class='boxick'>"+L("NOT")+"</span>").appendTo($bin);
  if(entry.collections && entry.collections.length>0) $("<span class='boxick'>"+L("COLL")+"</span>").appendTo($bin);
  if(entry.extranets && entry.extranets.length>0) $("<span class='boxick'>"+L("EXT")+"</span>").appendTo($bin);
  if(entry.xrefs && entry.xrefs.length>0) $("<img class='arrow' src='../../furniture/arrow_right.png'/>").appendTo($bin);

  var $bin=$("<div class='prettyBin'></div>").appendTo($ret);
  if(entry.cStatus=="1") $("<img class='status' src='../../furniture/tick.png'/>").appendTo($bin);
  else                   $("<img class='status' src='../../furniture/cross.png'/>").appendTo($bin);
  if(entry.pStatus=="1") $("<img class='status' src='../../furniture/tick.png'/>").appendTo($bin);
  else                   $("<img class='status' src='../../furniture/cross.png'/>").appendTo($bin);
  if(entry.dStatus=="1" || entry.dStatus==undefined) $("<img class='status' src='../../furniture/tick.png'/>").appendTo($bin);
  else                   $("<img class='status' src='../../furniture/cross.png'/>").appendTo($bin);
  if(entry.dateStamp) $("<span class='date'><img src='../../furniture/date.png'/> "+entry.dateStamp+"</span>").appendTo($bin);
  if(entry.tod)       $("<span class='date'><img src='../../furniture/asterisk_orange.png'/> "+entry.tod+"</span>").appendTo($bin);

  if($ret.text()=="") $ret.html("—");
  return $ret;
}

PrettySmall.desig=function(desig, withLangLabel){
  var $ret=$("<div class='prettyDesig'></div>");
  var lang=Spec.getLang(desig.term.lang); if(lang && lang.role=="minor") $ret.addClass("minor");;
  var acceptLabel=Spec.getAcceptLabel(desig.accept); if(acceptLabel && acceptLabel.level<0) $ret.addClass("grey");
  if(withLangLabel) $ret.append(PrettySmall.lang(desig.term.lang));
  $ret.append(PrettySmall.wording(desig.term.wording, desig.term.annots));
  if(desig.accept) $ret.append(" ").append(PrettySmall.accept(desig.accept));
  if(desig.clarif) $ret.append(" ").append(PrettySmall.clarif(desig.clarif));
  if(desig.term.inflects.length>0){
    var $inflects=$("<div class='inflects'></div>").appendTo($ret);
    desig.term.inflects.map((obj, i) => {
      if(i>0) $inflects.append(", ");
      $inflects.append(PrettySmall.inflect(obj));
    });
  }
  return $ret;
};

PrettySmall.inflect=function(obj){
  var $ret=$("<span class='inflect'></span>");
  if(Spec.getInflectLabel(obj.label)){
    $ret.append("<span class='abbr'>"+PrettySmall.clean4html(Spec.getInflectLabel(obj.label).abbr)+":</span>")
    $ret.append("&nbsp;")
  }
  $ret.append("<span class='wording'>"+PrettySmall.clean4html(obj.text)+"</span>")
  return $ret;
};

PrettySmall.lang=function(str){
  var $ret=$("<span class='prettyLang'></span>");
  $ret.append(str.toUpperCase());
  return $ret;
}

PrettySmall.wording=function(str, annots){
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
        if(i==stop-1) chars[i].labelsAfter=chars[i].labelsAfter+"<span class='label "+annot.label.type+"' onmouseover='PrettySmall.hon(this, "+index+")' onmouseout='PrettySmall.hoff(this, "+index+")'>"+symbol+"</span>"
      }
      else if(annot.label.type=="inflectLabel"){
        chars[i].markupBefore="<span class='char h"+index+"'>"+chars[i].markupBefore;
        chars[i].markupAfter=chars[i].markupAfter+"</span>";
        var label=Spec.getInflectLabel(annot.label.value);
        var symbol=(label ? label.abbr : "???");
        if(i==stop-1) chars[i].labelsAfter=chars[i].labelsAfter+"<span class='label "+annot.label.type+"' onmouseover='PrettySmall.hon(this, "+index+")' onmouseout='PrettySmall.hoff(this, "+index+")'>"+symbol+"</span>"
      }
      else if(annot.label.type=="langLabel"){
        chars[i].markupBefore="<span class='char h"+index+"'>"+chars[i].markupBefore;
        chars[i].markupAfter=chars[i].markupAfter+"</span>";
        var symbol=(annot.label.value ? annot.label.value.toUpperCase() : "???");
        if(i==stop-1) chars[i].labelsAfter=chars[i].labelsAfter+"<span class='label "+annot.label.type+"' onmouseover='PrettySmall.hon(this, "+index+")' onmouseout='PrettySmall.hoff(this, "+index+")'>"+symbol+"</span>"
      }
      else if(annot.label.type=="symbol"){
        chars[i].markupBefore="<span class='char h"+index+"'>"+chars[i].markupBefore;
        chars[i].markupAfter=chars[i].markupAfter+"</span>";
        var symbol="???";
        if(annot.label.value=="tm") symbol="<span style='position: relative; top: -5px; font-size: 0.5em'>TM</span>";
        if(annot.label.value=="regtm") symbol="®";
        if(annot.label.value=="proper") symbol="¶";
        if(i==stop-1) chars[i].labelsAfter=chars[i].labelsAfter+"<span class='label "+annot.label.type+"' onmouseover='PrettySmall.hon(this, "+index+")' onmouseout='PrettySmall.hoff(this, "+index+")'>"+symbol+"</span>"
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
PrettySmall.hon=function(label, i){
  $(label).addClass("on").closest(".prettyWording").find(".h"+i).addClass("on");
};
PrettySmall.hoff=function(label, i){
  $(label).removeClass("on").closest(".prettyWording").find(".h"+i).removeClass("on");
};

PrettySmall.clarif=function(str){
  var $ret=$("<span class='clarif'></span>");
  $ret.append("("+str+")");
  return $ret;
}

PrettySmall.accept=function(str){
  var label=Spec.getAcceptLabel(str);
  if(!label) return $("");
  var $ret=$("<span class='accept'></span>");
  $ret.append(Spec.title(label.title));
  return $ret;
}

PrettySmall.domain=function(domainID){
  var $ret=$("<div class='prettyDomain'></div>");
  var domain=Spec.getDomain(domainID);
  if(domain){
    $ret.append("<span class='step'>"+PrettySmall.title(domain.title)+"</span>");
    var parentID=domain.parentID;
    var depth=0;
    while(parentID && depth<10){
      var domain=Spec.getDomain(parentID);
      parentID=null;
      depth++;
      if(domain){
        $ret.prepend("&nbsp; »&nbsp; ");
        $ret.prepend("<span class='step'>"+PrettySmall.title(domain.title)+"</span>");
        parentID=domain.parentID;
      }
    }
  }
  return $ret;
};

PrettySmall.intro=function(str, lang){
  var $ret=$("<div class='prettyIntro' lang='"+lang+"'></div>");
  $ret.append("("+str+")");
  return $ret;
};


//---

PrettySmall.clean4html=function(str){
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

PrettySmall.title=function(title){
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

PrettySmall.findSubdomain=function(domain, subdomainID){
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
