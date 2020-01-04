Screenful.Facetor.title=function(title, lang){
  if(title[lang]) return title[lang];
  if(title.$) return title.$;
  var ret="";
  var done=[];
  termbaseConfigs.lingo.languages.map(lang => {
    if(lang.role=="major" && title[lang.abbr] && done.indexOf(title[lang.abbr])==-1) {
      if(ret+="") ret+="/";
      ret+=title[lang.abbr];
      done.push(title[lang.abbr]);
    }
  });
  if(!ret) ret="???";
  return ret;
};
Screenful.Facetor.getDomain=function(id){
  var ret=null;
  termbaseMetadata.domain=(termbaseMetadata.domain || []);
  termbaseMetadata.domain.map(datum => {  if(!ret && datum.id==id) ret=datum; });
  return ret;
};
Screenful.Facetor.longTitle=function(domain){
  var ret=Screenful.Facetor.title(domain.title);
  var dom=domain; while(dom.parentID){
    var dom=Screenful.Facetor.getDomain(dom.parentID);
    if(dom) ret=Screenful.Facetor.title(dom.title)+" » "+ret;
  }
  return ret;
};
Screenful.Facetor.domainHasChildren=function(domain){
  var ret=false;
  termbaseMetadata.domain.map(datum => {  if(datum.parentID==domain.id) ret=true; });
  return ret;
};
Screenful.Facetor.changeSelectTitles=function(select){
  var $select=$(select);
  if($select.attr("size")=="1"){
    $select.find("option").each(function(){
      var $option=$(this);
      if($option.data("longTitle")) $option.html($option.data("longTitle"));
    });
  } else {
    $select.find("option").each(function(){
      var $option=$(this);
      if($option.data("shortTitle")) $option.html($option.data("shortTitle"));
    });
  }
};
Screenful.Facetor.refillDomains=function(selectedDomainID){
  domains=[];
  var selectedDomain=Screenful.Facetor.getDomain(selectedDomainID);
  if(!selectedDomain){ //if no domain is selected:
    termbaseMetadata.domain.map(domain => { if(!domain.parentID){ domains.push(domain); }});
  } else {
    domains.push(selectedDomain);
    termbaseMetadata.domain.map(domain => { if(domain.parentID==selectedDomainID){ domains.push(domain); }});
    //add all parents to the front of the list:
    var parentID=selectedDomain.parentID;
    while(parentID){
      var domain=Screenful.Facetor.getDomain(parentID);
      parentID=null;
      if(domain){
        domains.unshift(domain);
        parentID=domain.parentID;
      }
    }
  }
  var $select=$("select#facDomain").html("");
  var level=0;
  $select.append(`<option style="padding: 4px 2px" value="">(${L("any domain or no domain")})</option>`);
  $select.append(`<option style="padding: 4px 2px" value="*">(${L("any domain")})</option>`);
  $select.append(`<option style="padding: 4px 2px" value="-1">(${L("no domain")})</option>`);
  if(selectedDomain){
    var level=1;
  }
  var prevDomainID=0;
  domains.map(domain => {
    if(domain.parentID==prevDomainID) level++;
    var padding=""; for(var i=0; i<level; i++) padding+="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    var driller="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"; if(Screenful.Facetor.domainHasChildren(domain)) driller="►&nbsp;";
    var shortTitle=`${padding}${driller}${Spec.title(domain.title)}`;
    var longTitle=Spec.longTitle(domain);
    var $option=$(`<option style="padding: 4px 2px" value="${domain.id}">${longTitle}</option>`);
    $option.data("shortTitle", shortTitle);
    $option.data("longTitle", longTitle);
    $select.append($option);
    prevDomainID=domain.id;
  });
  $select.find("option").on("click", function(e){
    Screenful.Facetor.refillDomains($(e.delegateTarget).attr("value"));
  });
  Screenful.Facetor.changeSelectTitles($select);
  if(typeof(selectedDomainID)=="string") $select.val(selectedDomainID);
  else $select.val("");
};

Screenful.Facetor.panes=[{
  render: function(div){
    var $inme=$(div);

    //------

    $inme.append(`<div class="title"><span class="tab">${L("ADMIN")}</span></div>`);

    //cStatus:
    var $select=$(`<select class="fullwidth" id="facCStatus"></select>`).appendTo($inme);
    $select.append(`<option value="">(${L("any checking status")})</option>`);
    $select.append(`<option value="1">${L("checked")}</option>`);
    $select.append(`<option value="0">${L("not checked")}</option>`);
    $select.on("change", Screenful.Facetor.change);

    //pStatus:
    var $select=$(`<select class="fullwidth" id="facPStatus"></select>`).appendTo($inme);
    $select.append(`<option value="">(${L("any publishing status")})</option>`);
    $select.append(`<option value="1">${L("publishable")}</option>`);
    $select.append(`<option value="0">${L("hidden")}</option>`);
    $select.on("change", Screenful.Facetor.change);

    //dStatus:
    var $select=$(`<select class="fullwidth" id="facDStatus"></select>`).appendTo($inme);
    $select.append(`<option value="">(${L("any drafting status")})</option>`);
    $select.append(`<option value="1">${L("finished entry")}</option>`);
    $select.append(`<option value="0">${L("draft entry")}</option>`);
    $select.on("change", Screenful.Facetor.change);

    //------

    if(termbaseMetadata.domain.length>0){
      $inme.append(`<div class="title"><span class="tab">${L("DOM")}</span></div>`);
      //var $input=$(`<input class="fullwidth" id="facDomain"/>`).appendTo($inme);
      //$input.on("change", Screenful.Facetor.change);
      var $select=$(`<select class="fullwidth" id="facDomain" size="1" onfocus="this.size='10'; Screenful.Facetor.changeSelectTitles(this)" onblur="this.size='1'; Screenful.Facetor.changeSelectTitles(this)"></select>`).appendTo($inme);
      $select.append(`<option value="">(${L("any domain or no domain")})</option>`);
      $select.append(`<option value="*">(${L("any domain")})</option>`);
      $select.append(`<option value="-1">(${L("no domain")})</option>`);
      $select.on("change", Screenful.Facetor.change);
      Screenful.Facetor.refillDomains();
    }

    //------

    if(termbaseConfigs.lingo.languages.length>0){
      $inme.append(`<div class="title"><span class="tab">${L("TRM")}</span></div>`);

      //term lang:
      var $select=$(`<select class="fullwidth" id="facTermLang"></select>`).appendTo($inme);
      $select.append(`<option value="">(${L("any language")})</option>`);
      termbaseConfigs.lingo.languages.map(datum => {
        var $option=$(`<option value="${datum.abbr}">${datum.abbr.toUpperCase()} ${Spec.title(datum.title)}</option>`);
        $option.data("datum", datum);
        $option.appendTo($select);
      });
      $select.on("change", Screenful.Facetor.change);

      if(termbaseMetadata.acceptLabel.length>0){
        //acceptability:
        var $select=$(`<select class="fullwidth" id="facAccept"></select>`).appendTo($inme);
        $select.append(`<option value="">(${L("any acceptabilty or no acceptability")})</option>`);
        $select.append(`<option value="*">(${L("any acceptabilty")})</option>`);
        $select.append(`<option value="-1">(${L("no acceptability")})</option>`);
        termbaseMetadata.acceptLabel=(termbaseMetadata.acceptLabel || []);
        termbaseMetadata.acceptLabel.map(datum => {
          var $option=$(`<option value="${datum.id}">${Spec.title(datum.title)}</option>`);
          $option.data("datum", datum);
          $option.appendTo($select);
        });
        $select.on("change", Screenful.Facetor.change);
      }

      //clarification:
      var $select=$(`<select class="fullwidth" id="facClarif"></select>`).appendTo($inme);
      $select.append(`<option value="">(${L("any clarification or no clarification")})</option>`);
      $select.append(`<option value="*">${L("any clarification")}</option>`);
      $select.append(`<option value="-1">${L("no clarification")}</option>`);
      $select.append(`<option value="txt">${L("clarification containing...")}</option>`);
      $select.on("change", Screenful.Facetor.change);
      $select.on("change", function(){
        var val=$("#facClarif").val();
        if(val=="txt") $("#facClarifValue").show();
        else $("#facClarifValue").hide();
      });

      var $input=$(`<input class="fullwidth sub" id="facClarifValue"/>`).hide().appendTo($inme);
      $input.on("change", Screenful.Facetor.change);
    }

    //------

    if(termbaseConfigs.lingo.languages.length>0){
      $inme.append(`<div class="title"><span class="tab">${L("INTR")}</span></div>`);

      //intro:
      var $select=$(`<select class="fullwidth" id="facIntro"></select>`).appendTo($inme);
      $select.append(`<option value="">(${L("any intro or no intro")})</option>`);
      $select.append(`<option value="*">${L("any intro")}</option>`);
      $select.append(`<option value="-1">${L("no intro")}</option>`);
      $select.append(`<option value="txt">${L("intro containing...")}</option>`);
      $select.on("change", Screenful.Facetor.change);
      $select.on("change", function(){
        var val=$("#facIntro").val();
        if(val=="txt") $("#facIntroValue").show();
        else $("#facIntroValue").hide();
      });

      var $input=$(`<input class="fullwidth sub" id="facIntroValue"/>`).hide().appendTo($inme);
      $input.on("change", Screenful.Facetor.change);
    }

    //------

    if(termbaseConfigs.lingo.languages.length>0){
      $inme.append(`<div class="title"><span class="tab">${L("DEF")}</span></div>`);

      //definition:
      var $select=$(`<select class="fullwidth" id="facDef"></select>`).appendTo($inme);
      $select.append(`<option value="">(${L("any definition or no definition")})</option>`);
      $select.append(`<option value="*">${L("any definition")}</option>`);
      $select.append(`<option value="-1">${L("no definition")}</option>`);
      $select.append(`<option value="txt">${L("definition containing...")}</option>`);
      $select.on("change", Screenful.Facetor.change);
      $select.on("change", function(){
        var val=$("#facDef").val();
        if(val=="txt") $("#facDefValue").show();
        else $("#facDefValue").hide();
      });

      var $input=$(`<input class="fullwidth sub" id="facDefValue"/>`).hide().appendTo($inme);
      $input.on("change", Screenful.Facetor.change);
    }

    //------

    if(termbaseConfigs.lingo.languages.length>0){
      $inme.append(`<div class="title"><span class="tab">${L("XMPL")}</span></div>`);

      //examples:
      var $select=$(`<select class="fullwidth" id="facXmpl"></select>`).appendTo($inme);
      $select.append(`<option value="">(${L("any example or no example")})</option>`);
      $select.append(`<option value="*">${L("any example")}</option>`);
      $select.append(`<option value="-1">${L("no example")}</option>`);
      $select.append(`<option value="txt">${L("example containing...")}</option>`);
      $select.on("change", Screenful.Facetor.change);
      $select.on("change", function(){
        var val=$("#facXmpl").val();
        if(val=="txt") $("#facXmplValue").show();
        else $("#facXmplValue").hide();
      });

      var $input=$(`<input class="fullwidth sub" id="facXmplValue"/>`).hide().appendTo($inme);
      $input.on("change", Screenful.Facetor.change);
    }

    //---

    //notes:
    $inme.append(`<div class="title"><span class="tab">${L("NOT")}</span></div>`);
    var $select=$(`<select class="fullwidth" id="facNote"></select>`).appendTo($inme);
    $select.append(`<option value="">(${L("with or without notes")})</option>`);
    $select.append(`<option value="1">${L("with a note")}</option>`);
    $select.append(`<option value="txt">${L("with a note containing...")}</option>`);
    $select.append(`<option value="0">${L("without notes")}</option>`);
    $select.on("change", Screenful.Facetor.change);
    $select.on("change", function(){
      var val=$("#facNote").val();
      if(val=="1" || val=="txt") $("#facNoteType").show(); else $("#facNoteType").hide();
      if(val=="txt") $("#facNoteText").show(); else $("#facNoteText").hide();
    });
    //note text:
    var $input=$(`<input class="fullwidth sub" id="facNoteText"/>`).hide().appendTo($inme);
    $input.on("change", Screenful.Facetor.change);
    //note types:
    var $select=$(`<select class="fullwidth sub" id="facNoteType"></select>`).hide().appendTo($inme);
    termbaseMetadata.noteType=(termbaseMetadata.noteType || []);
    $select.append(`<option value="">(${L("any type")})</option>`);
    termbaseMetadata.noteType.map(datum => {
      var $option=$(`<option value="${datum.id}">${Spec.title(datum.title)}</option>`);
      $option.data("datum", datum);
      $option.appendTo($select);
    });
    $select.on("change", Screenful.Facetor.change);

    //------

    if(termbaseMetadata.collection.length>0){
      $inme.append(`<div class="title"><span class="tab">${L("COLL")}</span></div>`);

      //collection:
      var $select=$(`<select class="fullwidth" id="facCollection"></select>`).appendTo($inme);
      $select.append(`<option value="">(${L("any collection or no collection")})</option>`);
      $select.append(`<option value="*">(${L("any collection")})</option>`);
      $select.append(`<option value="-1">(${L("no collection")})</option>`);
      termbaseMetadata.collection=(termbaseMetadata.collection || []);
      termbaseMetadata.collection.map(datum => {
        var $option=$(`<option value="${datum.id}">${Spec.title(datum.title)}</option>`);
        $option.data("datum", datum);
        $option.appendTo($select);
      });
      $select.on("change", Screenful.Facetor.change);
    }

    //------

    if(termbaseMetadata.extranet.length>0){
      $inme.append(`<div class="title"><span class="tab">${L("EXT")}</span></div>`);

      //extranet:
      var $select=$(`<select class="fullwidth" id="facExtranet"></select>`).appendTo($inme);
      $select.append(`<option value="">(${L("any extranet or no extranet")})</option>`);
      $select.append(`<option value="*">(${L("any extranet")})</option>`);
      $select.append(`<option value="-1">(${L("no extranet")})</option>`);
      termbaseMetadata.extranet=(termbaseMetadata.extranet || []);
      termbaseMetadata.extranet.map(datum => {
        var $option=$(`<option value="${datum.id}">${Spec.title(datum.title)}</option>`);
        $option.data("datum", datum);
        $option.appendTo($select);
      });
      $select.on("change", Screenful.Facetor.change);
    }

    //comments:
    $inme.append(`<div class="title"><span class="tab">${L("comments")}</span></div>`);
    var $select=$(`<select class="fullwidth" id="facComments"></select>`).appendTo($inme);
    $select.append(`<option value="">(${L("with or without comments")})</option>`);
    $select.append(`<option value="1">${L("with a comment")}</option>`);
    $select.append(`<option value="txt">${L("with a comment contaning...")}</option>`);
    $select.append(`<option value="0">${L("without comments")}</option>`);
    $select.on("change", Screenful.Facetor.change);
    $select.on("change", function(){
      var val=$("#facComments").val();
      if(val=="txt") $("#facCommentText").show(); else $("#facCommentText").hide();
    });
    //comment text:
    var $input=$(`<input class="fullwidth sub" id="facCommentText"/>`).hide().appendTo($inme);
    $input.on("change", Screenful.Facetor.change);


  },

  harvest: function(div){
    var $inme=$(div);
    var ret={};

    ret.cStatus=$("#facCStatus").val();
    ret.pStatus=$("#facPStatus").val();
    ret.dStatus=$("#facDStatus").val();

    ret.domain=$("#facDomain").val();

    ret.termLang=$("#facTermLang").val();
    ret.accept=$("#facAccept").val();
    ret.clarif=$("#facClarif").val();
    ret.clarifValue=$("#facClarifValue").val();

    ret.intro=$("#facIntro").val();
    ret.introValue=$("#facIntroValue").val();

    ret.def=$("#facDef").val();
    ret.defValue=$("#facDefValue").val();

    ret.xmpl=$("#facXmpl").val();
    ret.xmplValue=$("#facXmplValue").val();

    ret.note=$("#facNote").val();
    ret.noteType=$("#facNoteType").val();
    ret.noteText=$("#facNoteText").val();

    ret.collection=$("#facCollection").val();

    ret.extranet=$("#facExtranet").val();
    ret.hasComments=$("#facComments").val();
    ret.commentText=$("#facCommentText").val();

    return ret;
  },
}];
