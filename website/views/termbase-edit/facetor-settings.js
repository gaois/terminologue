Screenful.Facetor.panes=[{
  render: function(div){
    var $inme=$(div);

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
    $select.append(`<option value="*">${L("any datestamp")}</option>`);
    $select.append(`<option value="-1">${L("no datestamp")}</option>`);
    $select.append(`<option value="before">${L("datestamp before...")}</option>`);
    $select.append(`<option value="on">${L("datestamp on...")}</option>`);
    $select.append(`<option value="after">${L("datestamp after...")}</option>`);
    $select.on("change", Screenful.Facetor.change);
    $select.on("change", function(){
      var val=$("#facDateStamp").val();
      if(val=="before" || val=="on" || val=="after") $("#facDateStampValue").show();
      else $("#facDateStampValue").hide();
    });

    var $input=$(`<input type="date" class="fullwidth" id="facDateStampValue" value="${(new Date()).toISOString().split('T')[0]}"/>`).hide().appendTo($inme);
    $input.on("change", Screenful.Facetor.change);

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

    //acceptabilty:
    var $select=$(`<select class="fullwidth" id="facAccept"></select>`).appendTo($inme);
    $select.append(`<option value="">(${L("any acceptabilty or no acceptability")})</option>`);
    $select.append(`<option value="*">(${L("any acceptabilty")})</option>`);
    $select.append(`<option value="-1">(${L("no acceptability")})</option>`);
    termbaseMetadata.acceptLabel.map(datum => {
      var $option=$(`<option value="${datum.id}">${Spec.title(datum.title)}</option>`);
      $option.data("datum", datum);
      $option.appendTo($select);
    });
    $select.on("change", Screenful.Facetor.change);

    $inme.append(`<div class="title"><span class="tab">${L("DOM")}</span></div>`);

    //domain:
    var $select=$(`<select class="fullwidth" id="facSuperdomain"></select>`).appendTo($inme);
    $select.append(`<option value="">(${L("any domain or no domain")})</option>`);
    $select.append(`<option value="*">(${L("any domain")})</option>`);
    $select.append(`<option value="-1">(${L("no domain")})</option>`);
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
    var $select=$(`<select class="fullwidth" id="facSubdomain" style="display: none"></select>`).appendTo($inme);
    $select.append(`<option value="">(${L("any subdomain or no subdomain")})</option>`);
    $select.on("change", Screenful.Facetor.change);
  },

  harvest: function(div){
    var $inme=$(div);
    var ret={};
    ret.cStatus=$("#facCStatus").val();
    ret.pStatus=$("#facPStatus").val();
    ret.dateStamp=$("#facDateStamp").val();
    ret.dateStampValue=$("#facDateStampValue").val();
    ret.termLang=$("#facTermLang").val();
    ret.accept=$("#facAccept").val();
    ret.superdomain=$("#facSuperdomain").val();
    ret.subdomain=$("#facSubdomain").val();
    return ret;
  },
}];
