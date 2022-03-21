module.exports={
  renderEntry: function(entryID, json, md, cg){
    return Entry(entryID, json, md, cg);
  },
  renderTitleSmart: function(title, cg){
    return TitleSmart(title, cg);
  }
};

//---
function GetMetadatum(md, type, id){
  for (var i=0; i<md[type].length; i++) if(md[type][i].id==id) return md[type][i];
  return null;
}
function GetLang(cg, abbr){
  for(var i=0; i<cg.lingo.languages.length; i++) if(cg.lingo.languages[i].abbr==abbr) return cg.lingo.languages[i];
  return null;
}
function Title(title, cg){
  var ret="";
  var done=[];
  cg.lingo.languages.map(lang => {
    if(lang.role=="major" && title[lang.abbr] && done.indexOf(title[lang.abbr])==-1) {
      if(ret+="") ret+="/";
      ret+=title[lang.abbr];
      done.push(title[lang.abbr]);
    }
  });
  return ret;
};
function TitleSmart(title, cg){
  var ret="";
  var done=[];
  cg.lingo.languages.map(lang => {
    if(lang.role=="major" && title[lang.abbr] && done.indexOf(title[lang.abbr])==-1) {
      if(ret+="") ret+="/";
      if(done.length==0) ret+="<b>";
      ret+=title[lang.abbr];
      if(done.length==0) ret+="</b>";
      done.push(title[lang.abbr]);
    }
  });
  return ret;
};
function TitleInLang(title, lang){
  var ret="";
  var done=[];
  if(title[lang]) ret+="<span>"+title[lang]+"</span>";
  else if(title.$) ret+="<span>"+title.$+"</span>";
  else {
    for(var key in title) if(title[key]){ ret+="<span>"+title[key]+"</span>"; break; }
  }
  return ret;
}
function FindSubdomain(domain, subdomainID){
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
function Clean4Html(str){
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function LingySources(sources, lang, md, cg){
  var ret=`<div class='prettySources'>`;
  sources.map(obj => {
    if(obj.lang==lang || obj.lang=="") {
      obj=GetMetadatum(md, "source", obj.id);
      ret+=`<div class='source'>`;
      if(obj) ret+=`— ${Title(obj.title, cg)}`;
      ret+=`</div>`;
    }
  });
  ret+=`</div>`;
  return ret;
};
function Type(obj, lang){
  var ret=`<span><span class='step'>${TitleInLang(obj.title, lang)}</span></span>`;
  return ret;
};
//---

function Entry(entryID, json, md, cg){
  var entry=JSON.parse(json);
  var ret=`<div class='prettyEntry large'>`;

  var majorlangs=[]; cg.lingo.languages.map(lang => { if(lang.role=="major" && majorlangs.indexOf(lang.abbr)==-1) majorlangs.push(lang.abbr); });
  var cellWidth=(100/majorlangs.length);
  var minorlangs=[]; cg.lingo.languages.map(lang => { if(lang.role=="minor" && minorlangs.indexOf(lang.abbr)==-1) minorlangs.push(lang.abbr); });

  //anchor:
  ret+=`<a class="prettyAnchor" href="./?id=${entryID}">#</a>`;

  //domains:
  if(entry.domains && entry.domains.length>0) {
    entry.domains.map(obj => {
      ret+=`<div class='prettyRow domain'>`;
      majorlangs.map(lang => {
        ret+=`<div class='prettyCell' style='width: ${cellWidth}%'>`;
        ret+=Domain(obj, lang, md);
        ret+=`</div>`;
      });
      ret+=`<div class='clear'></div>`;
      ret+=`</div>`;
    });
  }

  //terms in major languages:
  var langsDone=[];
  var row=`<div class='prettyRow majorTerms'>`;
  majorlangs.map(lang => {
    row+=`<div class='prettyCell' style='width: ${cellWidth}%'>`;
    entry.desigs.map(desig => {
      if(desig.term.lang==lang) {
        row+=Desig(desig, lang, md, cg, (langsDone.indexOf(lang)==-1));
        langsDone.push(lang);
      }
    });
    if(entry.intros[lang]) row+=Intro(entry.intros[lang], lang);
    row+=`</div>`;
  });
  row+=`<div class='clear'></div>`;
  row+=`</div>`;
  if(langsDone.length>0) ret+=row;

  //terms in minor languages:
  var langsDone=[];
  var row=`<div class='prettyRow minorTerms'>`;
  minorlangs.map(lang => {
    var cell=`<div class='prettyCell'>`;
    var cellIsEmpty=true;
    entry.desigs.map(desig => {
      if(desig.term.lang==lang) {
        cell+=Desig(desig, lang, md, cg, (langsDone.indexOf(lang)==-1));
        langsDone.push(lang);
        cellIsEmpty=false;
      }
    });
    if(entry.intros[lang]) cell+=Intro(entry.intros[lang], lang);
    cell+=`</div>`;
    if(!cellIsEmpty) row+=cell;
  });
  row+=`<div class='clear'></div>`;
  row+=`</div>`;
  if(langsDone.length>0) ret+=row;

  //definitions:
  if(entry.definitions && entry.definitions.length>0) {
    entry.definitions.map(obj => {
      ret+=`<div class='prettyRow definition'>`;
      var _cellWidth=cellWidth;
        var langCount=0; majorlangs.map(lang => { if(obj.texts[lang]) langCount++ });
        if(langCount<2) _cellWidth=100;
      majorlangs.map(lang => {
        ret+=`<div class='prettyCell' style='width: ${_cellWidth}%'>`;
        if(obj.texts[lang]) {
          ret+=Definiton(obj, lang, md);
          ret+=LingySources(obj.sources, lang, md, cg)
        }
        ret+=`</div>`;
      });
      ret+=`<div class='clear'></div>`;
      ret+=`</div>`;
    });
  }

  //examples:
  if(entry.examples && entry.examples.length>0) {
    entry.examples.map(obj => {
      ret+=`<div class='prettyRow example'>`;
      majorlangs.map(lang => {
        ret+=`<div class='prettyCell' style='width: ${cellWidth}%'>`;
        if(obj.texts[lang]) {
          ret+=Example(obj, lang, md);
          ret+=LingySources(obj.sources, lang, md, cg)
        }
        ret+=`</div>`;
      });
      ret+=`<div class='clear'></div>`;
      ret+=`</div>`;
    });
  }

  //remove non-public notes:
  var _notes=entry.notes || [];
  entry.notes=[];
  _notes.map(note => {
    var type=GetMetadatum(md, "noteType", note.type);
    if(type && type.level=="2") entry.notes.push(note);
  });
  //notes:
  if(entry.notes && entry.notes.length>0) {
    entry.notes.map(obj => {
      ret+=`<div class='prettyRow note'>`;
      var _cellWidth=cellWidth;
        var langCount=0; majorlangs.map(lang => { if(obj.texts[lang]) langCount++ });
        if(langCount<2) _cellWidth=100;
      majorlangs.map(lang => {
        ret+=`<div class='prettyCell' style='width: ${cellWidth}%'>`;
        if(obj.texts[lang]) {
          ret+=Note(obj, lang, md);
          ret+=LingySources(obj.sources, lang, md, cg)
        }
        ret+=`</div>`;
      });
      ret+=`<div class='clear'></div>`;
      ret+=`</div>`;
    });
  }

  //collections:
  if(entry.collections && entry.collections.length>0) {
    ret+=`<div class='collections'>`;
    entry.collections.map(obj => {
      obj=GetMetadatum(md, "collection", obj);
      if(obj) {
        ret+=`<div class='collection'>${Title(obj.title, cg)}</div>`;
      }
    });
    ret+=`</div>`;
  }

  ret+=`</div>`;
  return ret;
}

function Domain(domainID, lang, md){
  var ret=`<span>`;
  var domain=GetMetadatum(md, "domain", domainID);
  if(domain){
    ret+=`<a href="?dom=${domain.id}" class='step'>${TitleInLang(domain.title, lang)}</a>`;
    var parentID=domain.parentID;
    var depth=0;
    while(parentID && depth<10){
      var domain=GetMetadatum(md, "domain", parentID);
      parentID=null;
      depth++;
      if(domain){
        ret="&nbsp; »&nbsp; "+ret;
        ret=`<a href="?dom=${domain.id}" class='step'>${TitleInLang(domain.title, lang)}</a>`+ret;
        parentID=domain.parentID;
      }
    }
  }
  ret+=`</span>`;
  return ret;
}
function Definiton(def, lang, md){
  var ret=`<span class='prettyDefinition'>`;
  def.domains.map(dom => {
    ret+=`<span class='domain'>${Domain(dom, lang, md)}</span>`;
    ret+=` `;
  });
  ret+=`<span class='text'>${Clean4Html(def.texts[lang])}</span>`;
  ret+=`</span>`;
  return ret;
}
function Example(ex, lang, md){
  var ret=`<div class='prettyExample'>`;
  ex.texts[lang].map((sen, i) => {
    ret+=` `;
    ret+=`<div class='sentence'>${Clean4Html(sen)}</div>`;
  });
  ret+=`</div>`;
  return ret;
}
function Note(note, lang, md){
  var ret=`<span class='prettyNote'>`;
  if(note.type){
    var metadatum=GetMetadatum(md, "noteType", note.type);
    if(metadatum){
      ret+=`<span class='type'>${Type(metadatum, lang)}</span>`;
      //$("<span class='type'></span>").html(PrettyLarge.type(metadatum, lang)).appendTo($ret);
      ret+=` `;
    }
  }
  ret+=`<span class='text'>${Clean4Html(note.texts[lang])}</span>`;
  ret+=`</span>`;
  return ret;
};
function Intro(str, lang){
  var ret=`<div class='prettyIntro' lang='${lang}'>(${str})</div>`;
  return ret;
};

function Desig(desig, lang, md, cg, withLangLabel){
  var grey="";  var acceptLabel=GetMetadatum(md, "acceptLabel", desig.accept); if(acceptLabel && acceptLabel.level<0) grey="grey";
  var ret=`<div class='prettyDesig ${grey}'>`;
  if(withLangLabel) ret+=Lang(desig.term.lang, cg);
  ret+=Wording(desig.term.wording, desig.term.annots, md, cg);
  if(desig.accept) ret+=` `+Accept(desig.accept, md, cg);
  if(desig.clarif) ret+=` `+Clarif(desig.clarif);
  if(desig.term.inflects.length>0){
    ret+=`<div class='inflects'>`;
    desig.term.inflects.map((obj, i) => {
      if(i>0) ret+=", ";
      ret+=Inflect(obj, md, cg);
    });
    ret+=`</div>`;
  }
  // if(desig.sources) ret+=Sources(desig.sources, md, cg);
  ret+=`</div>`;
  return ret;
}

function Wording(str, annots, md, cg){
  var chars=[]; for(var i=0; i<str.length; i++) chars.push({char: str[i], markupBefore: "", markupAfter: "", labelsAfter: ""});
  annots.map((annot, index) => {
    var start=parseInt(annot.start)-1; if(start<0) start=0;
    var stop=parseInt(annot.stop); if(stop>chars.length) stop=chars.length; if(stop==0) stop=chars.length;
    for(var i=start; i<stop; i++){
      if(annot.label.type=="posLabel"){
        chars[i].markupBefore="<span class='char h"+index+"'>"+chars[i].markupBefore;
        chars[i].markupAfter=chars[i].markupAfter+"</span>";
        var label=GetMetadatum(md, "posLabel", annot.label.value);
        if(label){
          var symbol=label.abbr;
          if(i==stop-1) chars[i].labelsAfter=chars[i].labelsAfter+"<span class='label hintable "+annot.label.type+"' title='"+Clean4Html(Title(label.title, cg))+"' onmouseover='PrettyLarge.hon(this, "+index+")' onmouseout='PrettyLarge.hoff(this, "+index+")'>"+symbol+"</span>"
        }
      }
      else if(annot.label.type=="inflectLabel"){
        chars[i].markupBefore="<span class='char h"+index+"'>"+chars[i].markupBefore;
        chars[i].markupAfter=chars[i].markupAfter+"</span>";
        var label=GetMetadatum(md, "inflectLabel", annot.label.value);
        if(label){
          var symbol=label.abbr;
          if(i==stop-1) chars[i].labelsAfter=chars[i].labelsAfter+"<span class='label hintable "+annot.label.type+"' title='"+Clean4Html(Title(label.title, cg))+"' onmouseover='PrettyLarge.hon(this, "+index+")' onmouseout='PrettyLarge.hoff(this, "+index+")'>"+symbol+"</span>"
        }
      }
      else if(annot.label.type=="langLabel"){
        chars[i].markupBefore="<span class='char h"+index+"'>"+chars[i].markupBefore;
        chars[i].markupAfter=chars[i].markupAfter+"</span>";
        var label=GetLang(cg, annot.label.value);
        if(label){
          var symbol=annot.label.value.toUpperCase();
          if(i==stop-1) chars[i].labelsAfter=chars[i].labelsAfter+"<span class='label hintable "+annot.label.type+"' title='"+Clean4Html(Title(label.title, cg))+"' onmouseover='PrettyLarge.hon(this, "+index+")' onmouseout='PrettyLarge.hoff(this, "+index+")'>"+symbol+"</span>"
        }
      }
      else if(annot.label.type=="symbol"){
        chars[i].markupBefore="<span class='char h"+index+"'>"+chars[i].markupBefore;
        chars[i].markupAfter=chars[i].markupAfter+"</span>";
        var symbol="???"; var title="";
        if(annot.label.value=="tm") {symbol="<span style='position: relative; top: -5px; font-size:  0.5em'>TM</span>"; title="";}
        if(annot.label.value=="regtm") {symbol="®"; title="";}
        if(annot.label.value=="proper") {symbol="¶"; title="";}
        if(i==stop-1) chars[i].labelsAfter=chars[i].labelsAfter+"<span class='label hintable "+annot.label.type+"' title='"+title+"' onmouseover='PrettyLarge.hon(this, "+index+")' onmouseout='PrettyLarge.hoff(this, "+index+")'>"+symbol+"</span>"
      }
      else if(annot.label.type=="formatting"){
        chars[i].markupBefore="<span style='font-style: italic'>"+chars[i].markupBefore;
        chars[i].markupAfter=chars[i].markupAfter+"</span>";
      }
    }
  });

  astr=""; chars.map(c => { astr+=c.markupBefore+c.char+c.markupAfter+c.labelsAfter; });
  var ret=`<a class="prettyWording" href="./?q=${encodeURIComponent(str)}">${astr}</a>`;
  return ret;
}
function Inflect(obj, md, cg){
  var ret=`<span class='inflect'>`;
  var metadatum=GetMetadatum(md, "inflectLabel", obj.label);
  if(metadatum){
    ret+=`<span class='abbr hintable' title='${Clean4Html(Title(metadatum.title, cg))}'>${Clean4Html(metadatum.abbr)}:</span>`;
    ret+=`&nbsp;`;
  }
  ret+=`<span class='wording'>${Clean4Html(obj.text)}</span>`;
  ret+=`</span>`;
  return ret;
};
function Accept(str, md, cg){
  var label=GetMetadatum(md, "acceptLabel", str);
  if(!label) return "";
  var ret=`<span class='accept'>${Title(label.title, cg)}</span>`;
  return ret;
}
function Clarif(str){
  return `<span class='clarif'>(${str})</span>`;
}
function Lang(str, cg){
  var lang=GetLang(cg, str);
  if(lang) return `<span class='prettyLang hintable' title='${Title(lang.title, cg)}'>${str.toUpperCase()}</span>`;
  return `<span class='prettyLang'>${str.toUpperCase()}</span>`;
}
