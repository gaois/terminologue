Screenful.Facetor.panes=[{
  render: function(div){
    var $inme=$(div);

    $inme.append(`<div class="title"><span class="tab">${L("comments")}</span></div>`);
    var $select=$(`<select class="fullwidth" id="facComments"></select>`).appendTo($inme);
    $select.append(`<option value="">(${L("with or without comments")})</option>`);
    $select.append(`<option value="1">${L("with comments")}</option>`);
    $select.append(`<option value="0">${L("without comments")}</option>`);
    $select.on("change", Screenful.Facetor.change);

    $inme.append(`<div class="title"><span class="tab">${L("my comments")}</span></div>`);
    var $select=$(`<select class="fullwidth" id="facMe"></select>`).appendTo($inme);
    $select.append(`<option value="">(${L("with or without my comments")})</option>`);
    $select.append(`<option value="1">${L("with my comments")}</option>`);
    $select.append(`<option value="0">${L("without my comments")}</option>`);
    $select.on("change", Screenful.Facetor.change);

    $inme.append(`<div class="title"><span class="tab">${L("other people's comments")}</span></div>`);
    var $select=$(`<select class="fullwidth" id="facOth"></select>`).appendTo($inme);
    $select.append(`<option value="">(${L("with or without other people's comments")})</option>`);
    $select.append(`<option value="1">${L("with other people's comments")}</option>`);
    $select.append(`<option value="0">${L("without other people's comments")}</option>`);
    $select.on("change", Screenful.Facetor.change);

    $inme.append(`<div class="title"><span class="tab">${L("domain")}</span></div>`);
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
    ret.hasComments=$("#facComments").val();
    ret.me=$("#facMe").val();
    ret.oth=$("#facOth").val();
    ret.superdomain=$("#facSuperdomain").val();
    ret.subdomain=$("#facSubdomain").val();
    return ret;
  },
}];
