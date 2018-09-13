Screenful.Facetor.panes=[{
  render: function(div){
    var $inme=$(div);

    $inme.append(`<div class="title"><span class="tab">ADMIN</span></div>`);
    var $select=$(`<select class="fullwidth" id="facCStatus"></select>`).appendTo($inme);
    $select.append(`<option value="">(any checking status)</option>`);
    $select.append(`<option value="1">checked</option>`);
    $select.append(`<option value="0">not checked</option>`);
    $select.on("change", Screenful.Facetor.change);
    var $select=$(`<select class="fullwidth" id="facPStatus"></select>`).appendTo($inme);
    $select.append(`<option value="">(any publishing status)</option>`);
    $select.append(`<option value="1">publishable</option>`);
    $select.append(`<option value="0">hidden</option>`);
    $select.on("change", Screenful.Facetor.change);

    $inme.append(`<div class="title"><span class="tab">TRM</span></div>`);
    var $select=$(`<select class="fullwidth" id="facTermLang"></select>`).appendTo($inme);
    $select.append(`<option value="">(any language)</option>`);
    termbaseConfigs.lingo.languages.map(datum => {
      var $option=$(`<option value="${datum.abbr}">${datum.abbr.toUpperCase()} ${Spec.title(datum.title)}</option>`);
      $option.data("datum", datum);
      $option.appendTo($select);
    });
    $select.on("change", Screenful.Facetor.change);
    var $select=$(`<select class="fullwidth" id="facAccept"></select>`).appendTo($inme);
    $select.append(`<option value="">(any acceptabilty or no acceptability)</option>`);
    $select.append(`<option value="*">(any acceptabilty)</option>`);
    $select.append(`<option value="-1">(no acceptability)</option>`);
    termbaseMetadata.acceptLabel.map(datum => {
      var $option=$(`<option value="${datum.id}">${Spec.title(datum.title)}</option>`);
      $option.data("datum", datum);
      $option.appendTo($select);
    });
    $select.on("change", Screenful.Facetor.change);

    $inme.append(`<div class="title"><span class="tab">DOM</span></div>`);
    var $select=$(`<select class="fullwidth" id="facSuperdomain"></select>`).appendTo($inme);
    $select.append(`<option value="">(any domain or no domain)</option>`);
    $select.append(`<option value="*">(any domain)</option>`);
    $select.append(`<option value="-1">(no domain)</option>`);
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
          $subselect.append(`<option value="">(any subdomain or no subdomain)</option>`);
        } else {
          $subselect.show();
          $subselect.append(`<option value="">(any subdomain or no subdomain)</option>`);
          $subselect.append(`<option value="*">(any subdomain)</option>`);
          $subselect.append(`<option value="-1">(no subdomain)</option>`);
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
    $select.append(`<option value="">(any subdomain or no subdomain)</option>`);
    $select.on("change", Screenful.Facetor.change);
  },
  harvest: function(div){
    var $inme=$(div);
    var ret={};
    ret.cStatus=$("#facCStatus").val();
    ret.pStatus=$("#facPStatus").val();
    ret.termLang=$("#facTermLang").val();
    ret.accept=$("#facAccept").val();
    ret.superdomain=$("#facSuperdomain").val();
    ret.subdomain=$("#facSubdomain").val();
    return ret;
  },
}];
