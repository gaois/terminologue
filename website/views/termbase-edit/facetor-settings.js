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

    //dateStamp:
    var $select=$(`<select class="fullwidth" id="facDateStamp"></select>`).appendTo($inme);
    $select.append(`<option value="">(${L("any datestamp or no datestamp")})</option>`);
    $select.append(`<option value="-1">${L("no datestamp")}</option>`);
    $select.append(`<option value="*">${L("any datestamp")}</option>`);
    $select.append(`<option value="before">${L("datestamp before...")}</option>`);
    $select.append(`<option value="on">${L("datestamp on...")}</option>`);
    $select.append(`<option value="after">${L("datestamp after...")}</option>`);
    $select.on("change", Screenful.Facetor.change);
    $select.on("change", function(){
      var val=$("#facDateStamp").val();
      if(val=="before" || val=="on" || val=="after") $("#facDateStampValue").show();
      else $("#facDateStampValue").hide();
    });

    var $input=$(`<input type="date" class="fullwidth sub" id="facDateStampValue" value="${(new Date()).toISOString().split('T')[0]}"/>`).hide().appendTo($inme);
    $input.on("change", Screenful.Facetor.change);

    //------

    if(termbaseMetadata.domain.length>0){
      $inme.append(`<div class="title"><span class="tab">${L("DOM")}</span></div>`);

      //domain:
      var $select=$(`<select class="fullwidth" id="facSuperdomain"></select>`).appendTo($inme);
      $select.append(`<option value="">(${L("any domain or no domain")})</option>`);
      $select.append(`<option value="*">(${L("any domain")})</option>`);
      $select.append(`<option value="-1">(${L("no domain")})</option>`);
      termbaseMetadata.domain=(termbaseMetadata.domain || []);
      termbaseMetadata.domain.map(datum => {
        var $option=$(`<option value="${datum.id}">${Spec.title(datum.title)}</option>`);
        $option.data("datum", datum);
        $option.appendTo($select);
      });
      $select.on("change", Screenful.Facetor.change);
      $select.on("change", function(){
          var superdomain=$("#facSuperdomain option:selected").data("datum");
          var $subselect=$("#facSubdomain").html("");
          if(!superdomain || superdomain.subdomains.length==0){
            $subselect.hide();
            $subselect.append(`<option value="">(${L("any subdomain or no subdomain")})</option>`);
          } else {
            $subselect.show();
            $subselect.append(`<option value="">(${L("any subdomain or no subdomain")})</option>`);
            $subselect.append(`<option value="*">(${L("any subdomain")})</option>`);
            $subselect.append(`<option value="-1">(${L("no subdomain")})</option>`);
            superdomain.subdomains.map(subdomain => {
              go(subdomain, "");
            });
            function go(datum, prefix){
              var title=prefix;
              if(title!="") title+=" &nbsp;»&nbsp; ";
              title+=Spec.title(datum.title);
              $subselect.append(`<option value="${datum.lid}">»&nbsp; ${title}</option>`);
              if(datum.subdomains) datum.subdomains.map(subdomain => {
                go(subdomain, title);
              });
            }
          }
      });
      var $select=$(`<select class="fullwidth sub" id="facSubdomain" style="display: none"></select>`).appendTo($inme);
      $select.append(`<option value="">(${L("any subdomain or no subdomain")})</option>`);
      $select.on("change", Screenful.Facetor.change);
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

  },

  harvest: function(div){
    var $inme=$(div);
    var ret={};

    ret.cStatus=$("#facCStatus").val();
    ret.pStatus=$("#facPStatus").val();
    ret.dateStamp=$("#facDateStamp").val();
    ret.dateStampValue=$("#facDateStampValue").val();

    ret.superdomain=$("#facSuperdomain").val();
    ret.subdomain=$("#facSubdomain").val();

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

    ret.collection=$("#facCollection").val();

    ret.extranet=$("#facExtranet").val();

    return ret;
  },
}];
