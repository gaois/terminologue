var Spec={
  templates: {},
};
Spec.title=function(title){
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
Spec.getDomain=function(id){
  var ret=null;
  termbaseMetadata.domain.map(datum => {  if(!ret && datum.id==id) ret=datum; });
  return ret;
};
Spec.getAcceptLabel=function(id){
  var ret=null;
  termbaseMetadata.acceptLabel.map(datum => {  if(!ret && datum.id==id) ret=datum; });
  return ret;
};
Spec.getLangRole=function(abbr){
  var ret=null;
  termbaseConfigs.lingo.languages.map(lang => { if(!ret && lang.abbr==abbr) ret=lang.role; });
  return ret;
};
Spec.getLang=function(abbr){
  var ret=null;
  termbaseConfigs.lingo.languages.map(lang => { if(!ret && lang.abbr==abbr) ret=lang; });
  return ret;
};
Spec.getInflectLabel=function(id){
  var ret=null;
  termbaseMetadata.inflectLabel.map(datum => {  if(!ret && datum.id==id) ret=datum; });
  return ret;
};
Spec.getPosLabel=function(id){
  var ret=null;
  termbaseMetadata.posLabel.map(datum => {  if(!ret && datum.id==id) ret=datum; });
  return ret;
};
Spec.getCollection=function(id){
  var ret=null;
  termbaseMetadata.collection.map(datum => {  if(!ret && datum.id==id) ret=datum; });
  return ret;
};
Spec.getSource=function(id){
  var ret=null;
  termbaseMetadata.source.map(datum => {  if(!ret && datum.id==id) ret=datum; });
  return ret;
};

Spec.sharEnquire=function($term, termID, lang, wording){
  var $bubble=$term.find(".fy_bubble").hide().removeClass("fullon").removeClass("sublime").removeClass("invisible").html("");
  $.ajax({url: "./sharEnquire.json", dataType: "json", method: "POST", data: {termID: termID, lang: lang, wording: wording}}).done(function(data){
    if(data.sharedBy.length>1){
      $bubble.addClass("fullon").html(data.sharedBy.length).show();
    } else if(data.similarTo.length>0){
      $bubble.addClass("sublime").html(data.similarTo.length).show();
    }
  });
};

Spec.templates[":top"]={
  type: "object",
  html: `<div>
    <div class="fy_tabs">
      <span class="fy_tab" data-name="admin">${L("ADMIN")}</span>
      <span class="fy_tab" data-name="domains">${L("DOM")}</span>
      <span class="fy_tab on" data-name="terms">${L("TRM")}</span>
      <span class="fy_tab" data-name="intros">${L("INTR")}</span>
      <span class="fy_tab" data-name="definitions">${L("DEF")}</span>
      <span class="fy_tab" data-name="examples">${L("XMPL")}</span>
      <span class="fy_tab" data-name="collections">${L("COLL")}</span>
      <div class="clear"></div>
    </div>
    <div class="fy_body" data-name="admin">
      <div class="title">${L("CHECKING STATUS")}</div>
      <div class="fy_replace" templateName="cStatus" jsonName="cStatus"></div>
      <div class="title">${L("PUBLISHING STATUS")}</div>
      <div class="fy_replace" templateName="pStatus" jsonName="pStatus"></div>
      <div class="title">${L("DATESTAMP")} <span class="light">${L("LAST MAJOR UPDATE")}<span></div>
      <div class="fy_replace" templateName="dateStamp" jsonName="dateStamp"></div>
    </div>
    <div class="fy_body" data-name="domains">
      <div class="title">${L("DOMAINS")}</div>
      <div class="fy_replace" templateName="domains" jsonName="domains"></div>
    </div>
    <div class="fy_body" data-name="terms">
      <div class="title">${L("TERMS")}</div>
      <div class="fy_replace" templateName="desigs" jsonName="desigs"></div>
    </div>
    <div class="fy_body" data-name="intros">
      <div class="title">${L("INTROS")}</div>
      <div class="fy_replace" templateName="intros" jsonName="intros"></div>
    </div>
    <div class="fy_body" data-name="definitions">
      <div class="title">${L("DEFINITIONS")}</div>
      <div class="fy_replace" templateName="definitions" jsonName="definitions"></div>
    </div>
    <div class="fy_body" data-name="examples">
      <div class="title">${L("EXAMPLES")}</div>
      <div class="fy_replace" templateName="examples" jsonName="examples"></div>
    </div>
    <div class="fy_body" data-name="collections">
      <div class="title">${L("COLLECTIONS")}</div>
      <div class="fy_replace" templateName="collections" jsonName="collections"></div>
    </div>
  </div>`,
};
Spec.templates["hiddenID"]={
  type: "string",
  html: `<input type="hidden"/>`,
  set: function($me, data){
    if(data.toString()) $me.val(data);
  },
  get: function($me){
    return $me.val();
  },
};

Spec.templates["cStatus"]={
  type: "string",
  html: `<div class="fy_node">
    <label><input type="radio" name="cStatus" value="1" onchange="Fy.changed()"/> ${L("checked")}</label>
    <label><input type="radio" name="cStatus" value="0" onchange="Fy.changed()"/> ${L("not checked")}</label>
  </div>`,
  set: function($me, data){
    $me.find("input[value='"+data+"']").prop("checked", true);
  },
  get: function($me){
    return $me.find("input:checked").val();
  },
};
Spec.templates["pStatus"]={
  type: "string",
  html: `<div class="fy_node">
    <label><input type="radio" name="pStatus" value="1" onchange="Fy.changed()"/> ${L("publishable")}</label>
    <label><input type="radio" name="pStatus" value="0" onchange="Fy.changed()"/> ${L("hidden")}</label>
  </div>`,
  set: function($me, data){
    $me.find("input[value='"+data+"']").prop("checked", true);
  },
  get: function($me){
    return $me.find("input:checked").val();
  },
};
Spec.templates["dateStamp"]={
  type: "string",
  html: `<div class="fy_node">
    <div class="fy_horizon" style="width: 12em; display: inline-block; float: left;">
      <span class="fy_textbox" style="width: 100%"><input type="date" onchange="Fy.changed()"/></span>
    </div>
    <button style="margin-top: 1px; margin-left: 1em;" onclick="$(this).closest('.fy_node').find('input').val((new Date()).toISOString().split('T')[0]); Fy.changed()">${L("set to today")}</button>
  </div>`,
  set: function($me, data){
    $me.find("input").val(data);
  },
  get: function($me){
    return $me.find("input").val();
  },
};

Spec.templates["domains"]={
  type: "array",
  html: `<div>
    <div class="fy_replace" templateName="domain" jsonName=":item"></div>
    <span class="fy_adder" templateName="domain">+ ${L("domain")}</span>
  </div>`,
};
Spec.templates["domain"]={
  type: "object",
  blank: {superdomain: null, subdomain: null},
  html: `<div class="fy_container">
    <div class="fy_box">
      <div class="fy_replace" templateName="superdomain" jsonName="superdomain"></div>
      <div class="fy_replace" templateName="subdomain" jsonName="subdomain"></div>
    </div>
  </div>`,
  refresh: function($me){
    $me.find(".jsonName_subdomain").hide().find("select").html("");
    var superdomainID=$me.find(".jsonName_superdomain select").val();
    if(superdomainID) {
      $me.find(".jsonName_subdomain").show();
      Spec.templates.subdomain.refresh($me.find(".jsonName_subdomain"));
    }
  },
};
Spec.templates["superdomain"]={
  type: "string",
  blank: "",
  html: `<div class="fy_horizon">
    <span class="fy_remover"></span>
    <span class="fy_downer"></span>
    <span class="fy_upper"></span>
    <span class="fy_label" style="width: 245px;">${L("domain")}</span>
    <span class="fy_textbox" style="position: absolute; left: 250px; right: 110px;">
      <select style="font-weight: bold;" onchange="Fy.changed(); $(this).closest('.jsonName_item').data('template').refresh( $(this).closest('.jsonName_item') )"></select>
    </span>
  </div>`,
  set: function($me, data){
    if(data.toString()) $me.find("select").val(data);
  },
  get: function($me){
    return $me.find("select").val();
  },
  populate: function($me){
    var $select=$me.find("select");
    termbaseMetadata.domain.map(datum => {
      $select.append(`<option value="${datum.id}">${Spec.title(datum.title)}</option>`)
    });
  },
};
Spec.templates["subdomain"]={
  type: "string",
  blank: "",
  html: `<div class="fy_horizon">
    <span class="fy_label" style="width: 245px;">${L("subdomain")}</span>
    <span class="fy_textbox" style="position: absolute; left: 250px; right: 0px;">
      <select onchange="Fy.changed()"></select>
    </span>
  </div>`,
  set: function($me, data){
    if(data.toString()) $me.data("val", data);
  },
  get: function($me){
    return $me.find("select").val();
  },
  refresh: function($me){
    var $select=$me.find("select");
    var superdomainID=$me.closest(".jsonName_item").find(".jsonName_superdomain select").val();
    var superdomain=Spec.getDomain(superdomainID);
    if(superdomain && superdomain.subdomains && superdomain.subdomains.length>0){
      $me.show();
      $select.html(`<option value="">(${L("none", "no subdomain")})</option>`);
      superdomain.subdomains.map(subdomain => {
        go(subdomain, "");
      });
    } else {
      $me.hide();
      $select.html("");
    }
    function go(datum, prefix){
      var title=prefix;
      if(title!="") title+=" » ";
      title+=Spec.title(datum.title);
      $select.append(`<option value="${datum.lid}">${title}</option>`);
      if(datum.lid==$me.data("val")) $select.val(datum.lid);
      if(datum.subdomains) datum.subdomains.map(subdomain => {
        go(subdomain, title);
      });
    }
  },

};

Spec.templates["desigs"]={
  type: "array",
  html: `<div>
    <div class="fy_replace" templateName="desig" jsonName=":item"></div>
    <span class="fy_adder" templateName="desig">+ ${L("term")}</span>
  </div>`,
};
Spec.templates["desig"]={
  type: "object",
  blank: {term: {lang: "", wording: "", inflects: [], annots: []}, clarif: "", accept: "", sources: []},
  html: `<div class="fy_container fy_collapsible">
    <div class="fy_replace" templateName="term" jsonName="term"></div>
    <div class="fy_replace fy_hidable" templateName="accept" jsonName="accept"></div>
    <div class="fy_replace fy_hidable" templateName="clarif" jsonName="clarif"></div>
    <div class="fy_replace fy_hidable" templateName="sources" jsonName="sources"></div>
  </div>`,
};
Spec.templates["term"]={
  type: "object",
  html: `<div class="fy_box">
    <div class="fy_replace" templateName="hiddenID" jsonName="id"></div>
    <div class="fy_bubble" style="display: none;"></div>
    <!-- <div class="fy_bubble fullon">2</div> -->
    <!-- <div class="fy_bubble sublime">2</div> -->
    <!-- <div class="fy_bubble fullon">2<span class="sublime">2</span></div> -->
    <!-- <div class="fy_bubble invisible">2</div> -->
    <div class="fy_horizon">
      <span class="fy_remover"></span>
      <span class="fy_downer"></span>
      <span class="fy_upper"></span>
      <span class="fy_replace" templateName="lang" jsonName="lang"></span>
      <span class="fy_replace" templateName="wording" jsonName="wording"></span>
    </div>
    <div class="fy_replace fy_hidable" templateName="annots" jsonName="annots"></div>
    <div class="fy_replace fy_hidable" templateName="inflects" jsonName="inflects"></div>
  </div>`,
  refresh: function($me){
    var termID=$me.find(".jsonName_id").first().val();
    var lang=$me.find(".jsonName_lang").first().find("select").val();
    var wording=$me.find(".jsonName_wording").first().find("input").val();
    Spec.sharEnquire($me, termID, lang, wording);
  },
};
Spec.templates["lang"]={
  type: "string",
  html: `<span class="fy_textbox" style="width: 95px;">
    <select style="font-weight: bold;" onchange="Fy.changed(); Spec.templates.lang.changed(this)"></select>
  </span>`,
  set: function($me, data){
    if(data.toString()) $me.find("select").val(data);
  },
  get: function($me){
    return $me.find("select").val();
  },
  populate: function($me){
    var $select=$me.find("select");
    termbaseConfigs.lingo.languages.map(lang => {
      $select.append(`<option value="${lang.abbr}" title="${Spec.title(lang.title)}">${lang.abbr.toUpperCase()}</option>`)
    });
  },
  changed: function(select){
    $(select).closest(".jsonName_term").find(".jsonName_label").each(function(){
      var $label=$(this);
      if($label.data("template").refresh) $label.data("template").refresh($label);
    });
    Spec.templates.term.refresh($(select).closest(".jsonName_term"));
  },
};
Spec.templates["wording"]={
  type: "string",
  html: `<span class="fy_textbox" style="position: absolute; left: 100px; right: 110px;">
    <input style="font-weight: bold;" onkeyup="Spec.templates.wording.changed(this, 'eager')" onchange="Fy.changed(); Spec.templates.wording.changed(this, 'lazy')"/>
  </span>`,
  set: function($me, data){
    $me.find("input").val(data);
  },
  get: function($me){
    return $me.find("input").val();
  },
  changed: function(input, how){
    $(input).closest(".jsonName_term").find(".jsonName_annots > .fy_node").each(function(){
      var $annot=$(this);
      $annot.data("template").refresh($annot);
    });
    if(!how || how=="lazy") Spec.templates.term.refresh($(input).closest(".jsonName_term"));
  },
};
Spec.templates["clarif"]={
  type: "string",
  html: `<div class="fy_horizon">
    <span class="fy_label" style="width: 245px;">${L("clarification")}</span>
    <span class="fy_textbox" style="position: absolute; left: 250px; right: 0px;"><input onchange="Fy.changed()"/></span>
  </div>`,
  set: function($me, data){
    $me.find("input").val(data);
  },
  get: function($me){
    return $me.find("input").val();
  },
  hidable: function($me){
    return ($me.find("input").val()=="");
  },
};
Spec.templates["accept"]={
  type: "string",
  html: `<div class="fy_horizon">
    <span class="fy_label" style="width: 245px;">${L("acceptability")}</span>
    <span class="fy_textbox" style="position: absolute; left: 250px; right: 0px;">
      <select onchange="Fy.changed()"></select>
    </span>
  </div>`,
  set: function($me, data){
    $me.find("select").val(data);
  },
  get: function($me){
    return $me.find("select").val();
  },
  hidable: function($me){
    return !$me.find("select").val();
  },
  populate: function($me){
    var $select=$me.find("select");
    $select.html(`<option data-langs='"all"' value=""></option>`);
    termbaseMetadata.acceptLabel.map(datum => {
      $select.append(`<option value="${datum.id}" data-langs='${JSON.stringify(datum.langs)}'>${Spec.title(datum.title)}</option>`)
    });
  },
};
Spec.templates["sources"]={
  type: "array",
  html: `<div>
    <div class="fy_replace" templateName="source" jsonName=":item"></div>
    <span class="fy_adder" templateName="source">+ ${L("source")}</span>
  </div>`,
};
Spec.templates["source"]={
  type: "string",
  blank: "",
  html: `<div class="fy_horizon">
    <span class="fy_remover"></span>
    <span class="fy_downer"></span>
    <span class="fy_upper"></span>
    <span class="fy_label" style="width: 245px;">source</span>
    <span class="fy_textbox" style="position: absolute; left: 250px; right: 110px;">
      <select onchange="Fy.changed()"></select>
    </span>
  </div>`,
  set: function($me, data){
    if(data.toString()) $me.find("select").val(data);
  },
  get: function($me){
    return $me.find("select").val();
  },
  populate: function($me){
    var $select=$me.find("select");
    termbaseMetadata.source.map(datum => {
      $select.append(`<option value="${datum.id}" data-langs='${JSON.stringify(datum.langs)}'>${Spec.title(datum.title)}</option>`)
    });
  },
};
Spec.templates["inflects"]={
  type: "array",
  html: `<div class="fy_lineabove">
    <div class="fy_replace" templateName="inflect" jsonName=":item"></div>
    <span class="fy_adder" templateName="inflect">+ ${L("inflected form")}</span>
  </div>`,
};
Spec.templates["inflect"]={
  type: "object",
  blank: {label: "", text: ""},
  html: `<div class="fy_horizon">
    <span class="fy_remover"></span>
    <span class="fy_downer"></span>
    <span class="fy_upper"></span>
    <span class="fy_replace" templateName="inflectLabel" jsonName="label"/>
    <span class="fy_replace" templateName="inflectText" jsonName="text"/>
  </div>`,
};
Spec.templates["inflectLabel"]={
  type: "string",
  html: `<span class="fy_textbox" style="width: 95px;">
    <select onchange="Fy.changed()"></select>
  </span>`,
  set: function($me, data){
    if(data.toString()) $me.find("select").val(data);
  },
  get: function($me){
    return $me.find("select").val();
  },
  populate: function($me){
    var $select=$me.find("select");
    termbaseMetadata.inflectLabel.map(datum => {
      $select.append(`<option value="${datum.id}" title="${Spec.title(datum.title)}" data-isfor='${JSON.stringify(datum.isfor)}'>${datum.abbr}</option>`)
    });
  },
  refresh: function($me){
    var lang=$me.closest(".jsonName_term").find(".jsonName_lang select").val();
    var val=$me.find("select").val();
    $me.find("select option").each(function(){
      var $option=$(this);
      var isfor=JSON.parse($option.attr("data-isfor"));
      if(isfor.indexOf(lang)>-1 || isfor.indexOf("_all")>-1 || (Spec.getLangRole(lang)=="major" && isfor.indexOf("_allmajor")>-1) || (Spec.getLangRole(lang)=="minor" && isfor.indexOf("_allminor")>-1)) {
        $option.prop("disabled", false).show();
      } else {
        $option.prop("disabled", true).hide();
        if($option.attr("value")==val) $me.find("select").val("");
      }
    });
    if(!$me.find("select").val()){
      var val=$me.find("select").find("option").not(":disabled").first().attr("value");
      $me.find("select").val(val);
    }
  },
};
Spec.templates["inflectText"]={
  type: "string",
  html: `<span class="fy_textbox" style="position: absolute; left: 100px; right: 110px;"><input onchange="Fy.changed()"/></span>`,
  set: function($me, data){
    $me.find("input").val(data);
  },
  get: function($me){
    return $me.find("input").val();
  }
};
Spec.templates["annots"]={
  type: "array",
  html: `<div class="fy_lineabove">
    <div class="fy_replace" templateName="annot" jsonName=":item"></div>
    <span class="fy_adder" templateName="annot">+ ${L("annotation")}</span>
  </div>`,
};
Spec.templates["annot"]={
  type: "object",
  blank: {start: "1", stop: "0", label: null},
  html: `<div class="fy_horizon">
    <span class="fy_remover"></span>
    <span class="fy_downer"></span>
    <span class="fy_upper"></span>
    <span class="fy_replace" templateName="annotPosition" jsonName="start"/>
    <span class="fy_replace" templateName="annotPosition" jsonName="stop"/>
    <span class="fy_textbox fy_preview" style="margin-left: 10px;"></span>
    <span class="fy_replace" templateName="annotLabel" jsonName="label"/>
  </div>`,
  refresh: function($me){
    var wording=$me.closest(".jsonName_term").find(".jsonName_wording input").val();
    var start=parseInt($me.find(".jsonName_start").find("input").val()) || 1;
    var stop=parseInt($me.find(".jsonName_stop").find("input").val()) || wording.length;
    if(start>stop) {
      stop=start;
      $me.find(".jsonName_stop").find("input").val(stop);
    }
    var $textbox=$me.find(".fy_preview");
    $textbox.html("");
    for(var i=0; i<wording.length; i++){
      var $char=$("<span class='char'></span>");
      var char=wording[i];
      $char.html(char);
      if(char==" " || char=="\t") $char.html("&nbsp;");
      if(i+1>=start && i+1<=stop) $char.addClass("on");
      $textbox.append($char);
    }
  },
};
Spec.templates["annotPosition"]={
  type: "string",
  html: `<span class="annotPosition" style="display: inline-block; width: 45px; text-align: center; overflow: hide;">
    <button class="fy_tinybutton" onclick="Spec.templates.annotPosition.clickLess(this)">◀</button>
    <button class="fy_tinybutton" onclick="Spec.templates.annotPosition.clickMore(this)">▶</button>
    <input style="display: none;"/>
  </span>`,
  set: function($me, data){
    $me.find("input").val(data);
  },
  get: function($me){
    return $me.find("input").val();
  },
  clickLess: function(button){
    if($(button).closest(".fy_uneditable").length>0) return;
    var MIN=1;
    if($(button).closest('.jsonName_stop').length>0) MIN=parseInt($(button).closest(".jsonName_item").find('.jsonName_start').find("input").val());
    if(!MIN) MIN=1;
    var $input=$(button).closest('.annotPosition').find('input');
    var val=parseInt($input.val());
    if(val==0 && $(button).closest('.jsonName_stop')) val=$(button).closest(".jsonName_term").find(".jsonName_wording input").val().length;
    if(val>MIN) {
      $input.val(val-1);
      Fy.changed();
      var $annot=$input.closest(".jsonName_annots > .fy_node");
      $annot.data("template").refresh($annot);
    }
  },
  clickMore: function(button){
    if($(button).closest(".fy_uneditable").length>0) return;
    var MAX=$(button).closest(".jsonName_term").find('.jsonName_wording input').val().length;
    if($(button).closest('.jsonName_start').length>0) MAX=parseInt($(button).closest(".jsonName_item").find('.jsonName_stop').find("input").val());
    if(!MAX) MAX=$(button).closest(".jsonName_term").find(".jsonName_wording input").val().length;
    var $input=$(button).closest('.annotPosition').find('input');
    var val=parseInt($input.val());
    if(val==0 && $(button).closest('.jsonName_stop')) val=$(button).closest(".jsonName_term").find(".jsonName_wording input").val().length;
    if(val<MAX) {
      $input.val(val+1);
      Fy.changed();
      var $annot=$input.closest(".jsonName_annots > .fy_node");
      $annot.data("template").refresh($annot);
    }
  },
};
Spec.templates["annotLabel"]={
  type: "object",
  blank: {type: "", value: ""},
  html: `<span class="fy_textbox" style="width: 95px;">
    <select onchange="Fy.changed()"></select>
  </span>`,
  set: function($me, data){
    if(data) $me.find("select").val(data.value);
  },
  get: function($me){
    return {
      type: $me.find("select option:selected").attr("data-type"),
      value: $me.find("select").val()
    }
  },
  populate: function($me){
    var $select=$me.find("select");
    var $optgroup=$(`<optgroup label='${L("part of speech")}'></optgroup>`).appendTo($select);
    termbaseMetadata.posLabel.map(datum => {
      $optgroup.append(`<option data-type="posLabel" value="${datum.id}" title="${Spec.title(datum.title)}" data-isfor='${JSON.stringify(datum.isfor)}'>${datum.abbr}</option>`)
    });
    var $optgroup=$(`<optgroup label='${L("inflection")}'></optgroup>`).appendTo($select);
    termbaseMetadata.inflectLabel.map(datum => {
      $optgroup.append(`<option data-type="inflectLabel" value="${datum.id}" title="${Spec.title(datum.title)}" data-isfor='${JSON.stringify(datum.isfor)}'>${datum.abbr}</option>`)
    });
    var $optgroup=$(`<optgroup label='${L("language of origin")}'></optgroup>`).appendTo($select);
    termbaseConfigs.lingo.languages.map(lang => {
      $optgroup.append(`<option data-type="langLabel" value="${lang.abbr}" title="${Spec.title(lang.title)}">${lang.abbr.toUpperCase()}</option>`)
    });
    var $optgroup=$(`<optgroup label='${L("symbol")}'></optgroup>`).appendTo($select);
    $optgroup.append(`<option data-type="symbol" value="tm" title="${L("trademark")}">TM</option>`);
    $optgroup.append(`<option data-type="symbol" value="regtm" title="${L("registered trademark")}">®</option>`);
    $optgroup.append(`<option data-type="symbol" value="proper" title="${L("proper noun")}">¶</option>`);
    var $optgroup=$(`<optgroup label='${L("formatting")}'></optgroup>`).appendTo($select);
    $optgroup.append(`<option data-type="formatting" value="italic">${L("italic")}</option>`);
  },
  refresh: function($me){
    var lang=$me.closest(".jsonName_term").find(".jsonName_lang select").val();
    var val=$me.find("select").val();
    $me.find("select option").each(function(){
      var $option=$(this);
      if($option.attr("data-type")=="posLabel" || $option.attr("data-type")=="inflectLabel") {
        var isfor=JSON.parse($option.attr("data-isfor"));
        if(isfor.indexOf(lang)>-1 || isfor.indexOf("_all")>-1 || (Spec.getLangRole(lang)=="major" && isfor.indexOf("_allmajor")>-1) || (Spec.getLangRole(lang)=="minor" && isfor.indexOf("_allminor")>-1)) {
          $option.prop("disabled", false).show();
        } else {
          $option.prop("disabled", true).hide();
          if($option.attr("value")==val) $me.find("select").val("");
        }
      } else if($option.attr("data-type")=="langLabel") {
        if($option.attr("value")!=lang){
          $option.prop("disabled", false).show();
        } else {
          $option.prop("disabled", true).hide();
          if($option.attr("value")==val) $me.find("select").val("");
        }
      }
    });
    if(!$me.find("select").val()){
      var val=$me.find("select").find("option").not(":disabled").first().attr("value");
      $me.find("select").val(val);
    }
  },
};

Spec.templates["intros"]={
  type: "object",
  html: function(){
    var html=`<div class="fy_container">
      <div class="fy_box">`;
      termbaseConfigs.lingo.languages.map(lang => {
        if(lang.role=="major"){
          html+=`<div class="fy_horizon">
              <span class="fy_label" style="width: 245px;">${lang.abbr.toUpperCase()} (${Spec.title(lang.title)})</span>
              <span class="fy_replace" templateName="intro" jsonName="${lang.abbr}"></span>
            </div>`;
        }
      });
      html+=`</div>
    </div>`;
    return html;
  },
};
Spec.templates["intro"]={
  type: "string",
  html: `<span class="fy_textbox" style="position: absolute; left: 250px; right: 0px;"><input onchange="Fy.changed()"/></span>`,
  set: function($me, data){
    $me.find("input").val(data);
  },
  get: function($me){
    return $me.find("input").val();
  },
};

Spec.templates["definitions"]={
  type: "array",
  html: `<div>
    <div class="fy_replace" templateName="definition" jsonName=":item"></div>
    <span class="fy_adder" templateName="definition">+ ${L("definition")}</span>
  </div>`,
};
Spec.templates["definition"]={
  type: "object",
  blank: {texts: {}, domains: [], sources: []},
  html: `<div class="fy_container">
    <div class="fy_box">
      <div class="fy_replace" templateName="defTexts" jsonName="texts"></div>
      <div class="fy_box">
        <div class="fy_replace" templateName="sources" jsonName="sources"></div>
      </div>
      <div class="fy_replace" templateName="domains" jsonName="domains"></div>
      <div class="fy_horizon blind">
        <span class="fy_remover"></span>
        <span class="fy_downer"></span>
        <span class="fy_upper"></span>
      </div>
    </div>
  </div>`,
};
Spec.templates["defTexts"]={
  type: "object",
  html: function(){
    var html=`<div class="fy_container">`;
      termbaseConfigs.lingo.languages.map(lang => {
        if(lang.role=="major"){
          html+=`<div class="fy_horizon textarea">
              <div class="fy_label">${lang.abbr.toUpperCase()} (${Spec.title(lang.title)})</div>
              <span class="fy_replace" templateName="defText" jsonName="${lang.abbr}"></span>
            </div>`;
        }
      });
      html+=`</div>`;
    return html;
  },
};
Spec.templates["defText"]={
  type: "string",
  html: `<span class="fy_textbox" style="margin"><textarea onchange="Fy.changed()"/></textarea></span>`,
  set: function($me, data){
    $me.find("textarea").val(data);
  },
  get: function($me){
    return $me.find("textarea").val();
  },
};

Spec.templates["examples"]={
  type: "array",
  html: `<div>
    <div class="fy_replace" templateName="example" jsonName=":item"></div>
    <span class="fy_adder" templateName="example">+ ${L("example")}</span>
  </div>`,
};
Spec.templates["example"]={
  type: "object",
  blank: {texts: {}, sources: []},
  html: `<div class="fy_container">
    <div class="fy_box">
      <div class="fy_replace" templateName="exampleTexts" jsonName="texts"></div>
      <div class="fy_box">
        <div class="fy_replace" templateName="sources" jsonName="sources"></div>
      </div>
      <div class="fy_horizon blind">
        <span class="fy_remover"></span>
        <span class="fy_downer"></span>
        <span class="fy_upper"></span>
      </div>
    </div>
  </div>`,
};
Spec.templates["exampleTexts"]={
  type: "object",
  html: function(){
    var html=`<div class="fy_container">`;
      termbaseConfigs.lingo.languages.map(lang => {
        if(lang.role=="major"){
          html+=`<div class="fy_horizon textarea">
              <div class="fy_label">${lang.abbr.toUpperCase()} (${Spec.title(lang.title)})</div>
              <span class="fy_replace" templateName="exampleText" jsonName="${lang.abbr}"></span>
            </div>`;
        }
      });
      html+=`</div>`;
    return html;
  },
};
Spec.templates["exampleText"]={
  type: "array",
  html: `<div>
    <div class="fy_replace" templateName="exampleTextItem" jsonName=":item"></div>
    <span class="fy_adder" templateName="exampleTextItem">+ ${L("sentence")}</span>
  </div>`,
};
Spec.templates["exampleTextItem"]={
  type: "string",
  html: `<span class="fy_node fy_textbox linebelow" style="position: relative;">
    <div class="fy_horizon blinder">
      <span class="fy_remover"></span>
      <span class="fy_downer"></span>
      <span class="fy_upper"></span>
    </div>
    <textarea onchange="Fy.changed()" style="padding-right: 125px;"/></textarea>
  </span>`,
  set: function($me, data){
    $me.find("textarea").val(data);
  },
  get: function($me){
    return $me.find("textarea").val();
  },
};

Spec.templates["collections"]={
  type: "array",
  html: `<div>
    <div class="fy_replace" templateName="collection" jsonName=":item"></div>
    <span class="fy_adder" templateName="collection">+ ${L("collection")}</span>
  </div>`,
};
Spec.templates["collection"]={
  type: "object",
  blank: "",
  html: `<div class="fy_container">
    <div class="fy_box">
      <div class="fy_horizon">
        <span class="fy_remover"></span>
        <span class="fy_downer"></span>
        <span class="fy_upper"></span>
        <span class="fy_textbox" style="position: absolute; left: 0px; right: 125px;">
          <select onchange="Fy.changed();"></select>
        </span>
      </div>
    </div>
  </div>`,
  set: function($me, data){
    if(data.toString()) $me.find("select").val(data);
  },
  get: function($me){
    return $me.find("select").val();
  },
  populate: function($me){
    var $select=$me.find("select");
    termbaseMetadata.collection.map(datum => {
      $select.append(`<option value="${datum.id}">${Spec.title(datum.title)}</option>`)
    });
  },
};
