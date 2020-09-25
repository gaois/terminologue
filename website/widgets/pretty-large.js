var PrettyLarge={};

PrettyLarge.metadatum=function(metadatum, lingo){
  var ret="";
  var strings=[];
  lingo.languages.map(lang => {
    if(lang.role=="major" && metadatum.title[lang.abbr]){
      var string=PrettyLarge.clean4html(metadatum.title[lang.abbr]);
      if(strings.indexOf(string)==-1){
        if(strings.length>0) ret+="/"
        ret+="<span>"+string+"</span>";
        strings.push(string);
      }
    }
  });
  ret="<span class='prettyMetadatum'>"+ret+"</span>"
  return ret;
};

//---

PrettyLarge.entry=function(entry){
  var $ret=$("<div class='prettyEntry large'></div>");

  //var startlang=window.parent.$(".lineModifiersRight .current").data("value");
  var majorlangs=[]; termbaseConfigs.lingo.languages.map(lang => { if(lang.role=="major" && majorlangs.indexOf(lang.abbr)==-1) majorlangs.push(lang.abbr); });
  var cellWidth=(100/majorlangs.length);
  var minorlangs=[]; termbaseConfigs.lingo.languages.map(lang => { if(lang.role=="minor" && minorlangs.indexOf(lang.abbr)==-1) minorlangs.push(lang.abbr); });

  //domains:
  if(entry.domains && entry.domains.length>0) {
    entry.domains.map(obj => {
      var $row=$("<div class='prettyRow domain'></div>").appendTo($ret);
      majorlangs.map(lang => {
        var $cell=$("<div class='prettyCell' style='width: "+cellWidth+"%'></div>").appendTo($row);
        $cell.append(PrettyLarge.domain(obj, lang));
      });
      $("<div class='clear'></div>").appendTo($row);
    });
  }

  //terms in major languages:
  var langsDone=[];
  var $row=$("<div class='prettyRow majorTerms'></div>");
  majorlangs.map(lang => {
    var $cell=$("<div class='prettyCell' style='width: "+cellWidth+"%'></div>").appendTo($row);
    entry.desigs.map(desig => {
      if(desig.term.lang==lang) {
        $cell.append(PrettyLarge.desig(desig, (langsDone.indexOf(lang)==-1)));
        langsDone.push(lang);
      }
    });
    if(entry.intros[lang]) $cell.append(PrettyLarge.intro(entry.intros[lang], lang));
  });
  $("<div class='clear'></div>").appendTo($row);
  if($row.text()!="") $row.appendTo($ret);

  //terms in minor languages:
  var langsDone=[];
  var $row=$("<div class='prettyRow minorTerms'></div>");
  minorlangs.map(lang => {
    var $cell=$("<div class='prettyCell'></div>");
    entry.desigs.map(desig => {
      if(desig.term.lang==lang) {
        $cell.append(PrettyLarge.desig(desig, (langsDone.indexOf(lang)==-1)));
        langsDone.push(lang);
      }
    });
    if($cell.text()!="") $cell.appendTo($row);
  });
  $("<div class='clear'></div>").appendTo($row);
  if($row.text()!="") $row.appendTo($ret);

  //definitions:
  if(entry.definitions && entry.definitions.length>0) {
    entry.definitions.map(obj => {
      var $row=$("<div class='prettyRow definition'></div>").appendTo($ret);
      var _cellWidth=cellWidth;
        var langCount=0; majorlangs.map(lang => { if(obj.texts[lang]) langCount++ });
        if(langCount<2) _cellWidth=100;
      majorlangs.map(lang => {
        var $cell=$("<div class='prettyCell' style='width: "+_cellWidth+"%'></div>");
        if(obj.texts[lang]) {
          $cell.append(PrettyLarge.definition(obj, lang));
          $cell.append(PrettyLarge.lingySources(obj.sources, lang));
        }
        if(obj.texts[lang] || langCount>1) $cell.appendTo($row);
      });
      $("<div class='clear'></div>").appendTo($row);
    });
  }

  //examples:
  if(entry.examples && entry.examples.length>0) {
    entry.examples.map(obj => {
      var $row=$("<div class='prettyRow example'></div>").appendTo($ret);
      majorlangs.map(lang => {
        var $cell=$("<div class='prettyCell' style='width: "+cellWidth+"%'></div>").appendTo($row);
        if(obj.texts[lang]) {
          $cell.append(PrettyLarge.example(obj, lang));
          $cell.append(PrettyLarge.lingySources(obj.sources, lang));
        }
      });
      $("<div class='clear'></div>").appendTo($row);
    });
  }

  //notes:
  if(entry.notes && entry.notes.length>0) {
    entry.notes.map(obj => {
      var $row=$("<div class='prettyRow note'></div>").appendTo($ret);
      var _cellWidth=cellWidth;
        var langCount=0; majorlangs.map(lang => { if(obj.texts[lang]) langCount++ });
        if(langCount<2) _cellWidth=100;
      var hasNoText=true;
      majorlangs.map(lang => {
        var $cell=$("<div class='prettyCell' style='width: "+_cellWidth+"%'></div>");
        if(obj.texts[lang]) {
          hasNoText=false;
          $cell.append(PrettyLarge.note(obj, lang));
          $cell.append(PrettyLarge.lingySources(obj.sources, lang));
        }
        if(obj.texts[lang] || langCount>1) $cell.appendTo($row);
      });
      if(hasNoText){
        var $cell=$("<div class='prettyCell' style='width: "+_cellWidth+"%'></div>");
        $cell.append(PrettyLarge.note(obj, majorlangs[0]));
        $cell.appendTo($row);
      }
      $("<div class='clear'></div>").appendTo($row);
    });
  }

  //collections:
  if(entry.collections && entry.collections.length>0) {
    var $group=$("<div class='collections'></div>").appendTo($ret);
    entry.collections.map(obj => {
      obj=Spec.getCollection(obj);
      if(obj) {
        var $item=$("<div class='collection'></div>").appendTo($group);
        $item.append(PrettyLarge.title(obj.title));
      }
    });
  }

  if(entry.extranets && entry.extranets.length>0) {
    var $group=$("<div class='extranets'></div>").appendTo($ret);
    entry.extranets.map(obj => {
      obj=Spec.getExtranet(obj);
      if(obj) var $item=$("<div class='prettyExtranet'><a href='../x"+obj.id+"/' target='_blank' class='extranet'><strong>"+L('EXTRANET')+"</strong> "+Spec.title(obj.title, uilang)+"</a></div>").appendTo($group);
    });
  }

  if((entry.xrefs && entry.xrefs.length>0) ){
    var $bin=$("<div class='bin binXrefs'></div>").appendTo($ret);
    //xrefs:
    if(entry.xrefs && entry.xrefs.length>0) {
      var $group=$("<div class='prettyXrefs'></div>").appendTo($bin);
      var $title=$("<div class='title'></div>").appendTo($group);
      $("<span class='title'>"+L("SEE ALSO")+"</span>").appendTo($title);
      $title.append(" ");
      entry.xrefs.map(entryID => {
        var $item=$("<div class='xref'></div>").appendTo($group);
        $("<span class='id'></span>").appendTo($item).on("click", function(e){
          Screenful.Editor.open(e, entryID);
        }).html(Screenful.wyc("./read.json?id="+entryID, function(json){
          if(!json.success){
            return entryID;
          } else {
            var $ret=PrettyLarge.entryOneliner(JSON.parse(json.content));
            if($ret.text()=="") return entryID; else return $ret;
          }
        }));
      });
      $("<span class='link'>"+L("add to worklist")+"</span>").appendTo($title).on("click", function(e){
        var ids=[];
        ids.push(Screenful.Editor.entryID);
        entry.xrefs.map(id => { ids.push(parseInt(id)); });
        Screenful.Editor.addToStarlist(ids);
      });
    }

  }

  if(true){
    var $bin=$("<div class='bin binDateStamp'></div>").appendTo($ret);
    var $group=$("<div class='dateStamp'></div>").appendTo($bin);
    var $title=$("<div class='prettyDateStamp'></div>").appendTo($group);

    if(entry.cStatus=="1") {
      $("<span class='title'><img src='../../furniture/tick.png'/> "+L("CHECKED")+"</span>").appendTo($title);
    } else {
      $("<span class='title'><img src='../../furniture/cross.png'/> "+L("NOT CHECKED")+"</span>").appendTo($title);
    }
    $title.append(" ");

    if(entry.pStatus=="1") {
      $("<span class='title'><img src='../../furniture/tick.png'/> "+L("PUBLISHABLE")+"</span>").appendTo($title);
    } else {
      $("<span class='title'><img src='../../furniture/cross.png'/> "+L("HIDDEN")+"</span>").appendTo($title);
    }
    $title.append(" ");

    if(entry.dStatus=="1" || entry.dStatus===undefined) {
      $("<span class='title'><img src='../../furniture/tick.png'/> "+L("FINISHED")+"</span>").appendTo($title);
    } else {
      $("<span class='title'><img src='../../furniture/cross.png'/> "+L("DRAFT")+"</span>").appendTo($title);
    }
    $title.append(" ");

    //date stamp:
    if(entry.dateStamp){
      $("<span class='title'><img src='../../furniture/date.png'/> "+L("LAST MAJOR UPDATE")+"</span>").appendTo($title);
      $title.append(" ");
      $("<span class='date'>"+entry.dateStamp+"</span>").appendTo($title);
    }

    //term of the day:
    if(entry.tod){
      $("<span class='title'><img src='../../furniture/asterisk_orange.png'/> "+L("TERM OF THE DAY")+"</span>").appendTo($title);
      $title.append(" ");
      $("<span class='date'>"+entry.tod+"</span>").appendTo($title);
    }
  }

  return $ret;
}

PrettyLarge.entryOneliner=function(entry){
  var $ret=$("<span class='prettyEntryOneliner'></span>");

  //terms in major languages:
  var majorlangs=[]; termbaseConfigs.lingo.languages.map(lang => { if(lang.role=="major" && majorlangs.indexOf(lang.abbr)==-1) majorlangs.push(lang.abbr); });
  var langsDone=[];
  var count=0;
  majorlangs.map(lang => {
    entry.desigs.map(desig => {
      if(desig.term.lang==lang && langsDone.indexOf(lang)==-1) {
        if(count>0) $ret.append("<span class='divider'>/</span>");
        $ret.append("<span class='term'>"+PrettyLarge.clean4html(desig.term.wording)+"</span>");
        langsDone.push(lang);
        count++;
      }
    });
  });

  return $ret;
};



PrettyLarge.sources=function(sources){
  var $group=$("<div class='prettySources'></div>");
  sources.map(obj => {
    obj=Spec.getSource(obj);
    var $item=$("<div class='source'></div>").appendTo($group);
    $item.append("— "+PrettyLarge.title(obj.title));
  });
  if($group.text()!="") return $group;
  return "";
};

PrettyLarge.lingySources=function(sources, lang){
  var $group=$("<div class='prettySources'></div>");
  sources.map(obj => {
    if(obj.lang==lang || obj.lang=="") {
      obj=Spec.getSource(obj.id);
      var $item=$("<div class='source'></div>").appendTo($group);
      if(obj) $item.append("— "+PrettyLarge.title(obj.title));
    }
  });
  if($group.text()!="") return $group;
  return "";
};

PrettyLarge.example=function(ex, lang){
  var $ret=$("<div class='prettyExample'></div>");
  ex.texts[lang].map((sen, i) => {
    $ret.append(" ");
    $ret.append("<div class='sentence'>"+PrettyLarge.clean4html(sen)+"</div>");
  });
  return $ret;
};

PrettyLarge.definition=function(def, lang){
  var $ret=$("<span class='prettyDefinition'></span>");
  def.domains.map(dom => {
    $("<span class='domain'></span>").html(PrettyLarge.domain(dom, lang)).appendTo($ret);
    $ret.append(" ");
  });
  $ret.append("<span class='text'>"+PrettyLarge.clean4html(def.texts[lang])+"</span>");
  return $ret;
};

PrettyLarge.note=function(note, lang){
  var $ret=$("<span class='prettyNote'></span>");
  if(note.type){
    var metadatum=Spec.getNoteType(note.type);
    if(metadatum){
      $("<span class='type'></span>").html(PrettyLarge.type(metadatum, lang)).appendTo($ret);
      $ret.append(" ");
    }
  }
  $ret.append("<span class='text'>"+PrettyLarge.clean4html(note.texts[lang])+"</span>");
  return $ret;
};

PrettyLarge.desig=function(desig, withLangLabel){
  var $ret=$("<div class='prettyDesig'></div>");
  var acceptLabel=Spec.getAcceptLabel(desig.accept); if(acceptLabel && acceptLabel.level<0) $ret.addClass("grey");
  if(withLangLabel) $ret.append(PrettyLarge.lang(desig.term.lang));
  $ret.append(PrettyLarge.wording(desig.term.wording, desig.term.annots));
  if(desig.accept) $ret.append(" ").append(PrettyLarge.accept(desig.accept));
  if(desig.clarif) $ret.append(" ").append(PrettyLarge.clarif(desig.clarif));
  if(desig.term.inflects.length>0){
    var $inflects=$("<div class='inflects'></div>").appendTo($ret);
    desig.term.inflects.map((obj, i) => {
      if(i>0) $inflects.append(", ");
      $inflects.append(PrettyLarge.inflect(obj));
    });
  }
  if(desig.sources) $ret.append(PrettyLarge.sources(desig.sources));
  return $ret;
};

PrettyLarge.inflect=function(obj){
  var $ret=$("<span class='inflect'></span>");
  var metadatum=Spec.getInflectLabel(obj.label);
  if(metadatum){
    $ret.append("<span class='abbr hintable' title='"+PrettyLarge.clean4html(PrettyLarge.title(metadatum.title))+"'>"+PrettyLarge.clean4html(metadatum.abbr)+":</span>")
    $ret.append("&nbsp;");
  }
  $ret.append("<span class='wording'>"+PrettyLarge.clean4html(obj.text)+"</span>")
  return $ret;
};

PrettyLarge.lang=function(str){
  var $ret=$("<span class='prettyLang hintable'></span>");
  $ret.append(str.toUpperCase());
  var lang=Spec.getLang(str); if(lang) $ret.attr("title", PrettyLarge.title(lang.title));
  return $ret;
}

PrettyLarge.wording=function(str, annots){
  var chars=[]; for(var i=0; i<str.length; i++) chars.push({char: str[i], markupBefore: "", markupAfter: "", labelsAfter: ""});
  annots.map((annot, index) => {
    var start=parseInt(annot.start)-1; if(start<0) start=0;
    var stop=parseInt(annot.stop); if(stop>chars.length) stop=chars.length; if(stop==0) stop=chars.length;
    for(var i=start; i<stop; i++){
      if(annot.label.type=="posLabel"){
        chars[i].markupBefore="<span class='char h"+index+"'>"+chars[i].markupBefore;
        chars[i].markupAfter=chars[i].markupAfter+"</span>";
        var label=Spec.getPosLabel(annot.label.value);
        if(label){
          var symbol=label.abbr;
          if(i==stop-1) chars[i].labelsAfter=chars[i].labelsAfter+"<span class='label hintable "+annot.label.type+"' title='"+PrettyLarge.clean4html(PrettyLarge.title(label.title))+"' onmouseover='PrettyLarge.hon(this, "+index+")' onmouseout='PrettyLarge.hoff(this, "+index+")'>"+symbol+"</span>"
        }
      }
      else if(annot.label.type=="inflectLabel"){
        chars[i].markupBefore="<span class='char h"+index+"'>"+chars[i].markupBefore;
        chars[i].markupAfter=chars[i].markupAfter+"</span>";
        var label=Spec.getInflectLabel(annot.label.value);
        if(label){
          var symbol=label.abbr;
          if(i==stop-1) chars[i].labelsAfter=chars[i].labelsAfter+"<span class='label hintable "+annot.label.type+"' title='"+PrettyLarge.clean4html(PrettyLarge.title(label.title))+"' onmouseover='PrettyLarge.hon(this, "+index+")' onmouseout='PrettyLarge.hoff(this, "+index+")'>"+symbol+"</span>"
        }
      }
      else if(annot.label.type=="langLabel"){
        chars[i].markupBefore="<span class='char h"+index+"'>"+chars[i].markupBefore;
        chars[i].markupAfter=chars[i].markupAfter+"</span>";
        var label=Spec.getLang(annot.label.value);
        if(label){
          var symbol=annot.label.value.toUpperCase();
          if(i==stop-1) chars[i].labelsAfter=chars[i].labelsAfter+"<span class='label hintable "+annot.label.type+"' title='"+PrettyLarge.clean4html(PrettyLarge.title(label.title))+"' onmouseover='PrettyLarge.hon(this, "+index+")' onmouseout='PrettyLarge.hoff(this, "+index+")'>"+symbol+"</span>"
        }
      }
      else if(annot.label.type=="symbol"){
        chars[i].markupBefore="<span class='char h"+index+"'>"+chars[i].markupBefore;
        chars[i].markupAfter=chars[i].markupAfter+"</span>";
        var symbol="???"; var title="";
        if(annot.label.value=="tm") {symbol="<span style='position: relative; top: -5px; font-size:  0.5em'>TM</span>"; title=L("trademark");}
        if(annot.label.value=="regtm") {symbol="®"; title=L("registered trademark");}
        if(annot.label.value=="proper") {symbol="¶"; title=L("proper noun");}
        if(i==stop-1) chars[i].labelsAfter=chars[i].labelsAfter+"<span class='label hintable "+annot.label.type+"' title='"+title+"' onmouseover='PrettyLarge.hon(this, "+index+")' onmouseout='PrettyLarge.hoff(this, "+index+")'>"+symbol+"</span>"
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
PrettyLarge.hon=function(label, i){
  $(label).addClass("on").closest(".prettyWording").find(".h"+i).addClass("on");
};
PrettyLarge.hoff=function(label, i){
  $(label).removeClass("on").closest(".prettyWording").find(".h"+i).removeClass("on");
};

PrettyLarge.clarif=function(str){
  var $ret=$("<span class='clarif'></span>");
  $ret.append("("+str+")");
  return $ret;
}

PrettyLarge.accept=function(str){
  var label=Spec.getAcceptLabel(str);
  if(!label) return $("");
  var $ret=$("<span class='accept'></span>");
  $ret.append(Spec.title(label.title));
  return $ret;
}

PrettyLarge.domain=function(domainID, lang){
  var $ret=$("<span></span>");
  var domain=Spec.getDomain(domainID);
  if(domain){
    $ret.append("<span class='step'>"+PrettyLarge.titleInLang(domain.title, lang)+"</span>");
    var parentID=domain.parentID;
    var depth=0;
    while(parentID && depth<10){
      var domain=Spec.getDomain(parentID);
      parentID=null;
      depth++;
      if(domain){
        $ret.prepend("&nbsp; »&nbsp; ");
        $ret.prepend("<span class='step'>"+PrettyLarge.title(domain.title, lang)+"</span>");
        parentID=domain.parentID;
      }
    }
  }
  return $ret;
};

PrettyLarge.type=function(obj, lang){
  var $ret=$("<span></span>");
  $ret.append("<span class='step'>"+PrettyLarge.titleInLang(obj.title, lang)+"</span>");
  return $ret;
};

PrettyLarge.intro=function(str, lang){
  var $ret=$("<div class='prettyIntro' lang='"+lang+"'></div>");
  $ret.append("("+str+")");
  return $ret;
};


//---

PrettyLarge.clean4html=function(str){
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

PrettyLarge.title=function(title){
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
PrettyLarge.titleInLang=function(title, lang){
  var ret="";
  var done=[];
  if(title[lang]) ret+="<span>"+title[lang]+"</span>";
  else if(title.$) ret+="<span>"+title.$+"</span>";
  else {
    for(var key in title) if(title[key]){ ret+="<span>"+title[key]+"</span>"; break; }
  }
  return ret;
};

PrettyLarge.findSubdomain=function(domain, subdomainID){
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
