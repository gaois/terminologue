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

Spec.templates[":top"]={
  type: "object",
  html: `<div>
    <div class="fy_tabs">
      <span class="fy_tab" data-name="admin">ADMIN</span>
      <span class="fy_tab on" data-name="terms">TRM</span>
      <span class="fy_tab" data-name="domains">DOM</span>
      <span class="fy_tab" data-name="definitions">DEF</span>
      <span class="fy_tab" data-name="examples">XMPL</span>
      <span class="fy_tab" data-name="relations">REL</span>
      <span class="fy_tab" data-name="collections">COLL</span>
      <div class="clear"></div>
    </div>
    <div class="fy_body" data-name="admin">
      <div class="title">CHECKING STATUS</div>
      <div class="fy_replace" templateName="cStatus" jsonName="cStatus"></div>
      <div class="title">PUBLISHING STATUS</div>
      <div class="fy_replace" templateName="pStatus" jsonName="pStatus"></div>
    </div>
    <div class="fy_body" data-name="terms">
      <div class="title">TERMS</div>
      <div class="fy_replace" templateName="desigs" jsonName="desigs"></div>
    </div>
    <div class="fy_body" data-name="domains">
      <div class="title">DOMAINS</div>
      <div class="fy_replace" templateName="domains" jsonName="domains"></div>
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
    <label><input type="radio" name="cStatus" value="1" onchange="Fy.changed()"/> checked</label>
    <label><input type="radio" name="cStatus" value="0" onchange="Fy.changed()"/> not checked</label>
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
    <label><input type="radio" name="pStatus" value="1" onchange="Fy.changed()"/> publishable</label>
    <label><input type="radio" name="pStatus" value="0" onchange="Fy.changed()"/> hidden</label>
  </div>`,
  set: function($me, data){
    $me.find("input[value='"+data+"']").prop("checked", true);
  },
  get: function($me){
    return $me.find("input:checked").val();
  },
};

Spec.templates["desigs"]={
  type: "array",
  html: `<div>
    <div class="fy_replace" templateName="desig" jsonName=":item"></div>
    <span class="fy_adder" templateName="desig">+ term</span>
  </div>`,
};
Spec.templates["desig"]={
  type: "object",
  blank: {term: {lang: "", wording: "", inflects: [], annots: []}, clarif: "", accept: "", source: ""},
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
    $select.html(`<option value=""></option>`);
    termbaseConfigs.lingo.languages.map(lang => {
      $select.append(`<option value="${lang.abbr}" title="${Spec.title(lang.title)}">${lang.abbr.toUpperCase()}</option>`)
    });
  },
  changed: function(select){
    $(select).closest(".jsonName_term").find(".jsonName_label").each(function(){
      var $label=$(this);
      if($label.data("template").refresh) $label.data("template").refresh($label);
    });
  },
};
Spec.templates["wording"]={
  type: "string",
  html: `<span class="fy_textbox" style="position: absolute; left: 100px; right: 110px;">
    <input style="font-weight: bold;" onkeyup="Spec.templates.wording.changed(this)" onchange="Fy.changed(); Spec.templates.wording.changed(this)"/>
  </span>`,
  set: function($me, data){
    $me.find("input").val(data);
  },
  get: function($me){
    return $me.find("input").val();
  },
  changed: function(input){
    $(input).closest(".jsonName_term").find(".jsonName_annots > .fy_node").each(function(){
      var $annot=$(this);
      $annot.data("template").refresh($annot);
    });
  },
};
Spec.templates["clarif"]={
  type: "string",
  html: `<div class="fy_horizon">
    <span class="fy_label" style="width: 245px;">transfer comment</span>
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
    <span class="fy_label" style="width: 245px;">acceptability</span>
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
    <span class="fy_adder" templateName="source">+ source</span>
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
      <select onchange="Fy.changed()">
        <option value=""></option>
        <option value="123">some source</option>
        <option value="234">some other source</option>
      </select>
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
    $select.html(`<option data-langs='"all"' value="">(select)</option>`);
    termbaseMetadata.source.map(datum => {
      $select.append(`<option value="${datum.id}" data-langs='${JSON.stringify(datum.langs)}'>${Spec.title(datum.title)}</option>`)
    });
  },
};
Spec.templates["inflects"]={
  type: "array",
  html: `<div class="fy_lineabove">
    <div class="fy_replace" templateName="inflect" jsonName=":item"></div>
    <span class="fy_adder" templateName="inflect">+ inflected form</span>
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
    $select.html(`<option data-isfor='["_all"]' value=""></option>`);
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
    <span class="fy_adder" templateName="annot">+ annotation</span>
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
    $select.html(`<option data-isfor='["_all"]' value=""></option>`);
    var $optgroup=$("<optgroup label='part of speech'></optgroup").appendTo($select);
    termbaseMetadata.posLabel.map(datum => {
      $optgroup.append(`<option data-type="posLabel" value="${datum.id}" title="${Spec.title(datum.title)}" data-isfor='${JSON.stringify(datum.isfor)}'>${datum.abbr}</option>`)
    });
    var $optgroup=$("<optgroup label='inflection'></optgroup").appendTo($select);
    termbaseMetadata.inflectLabel.map(datum => {
      $optgroup.append(`<option data-type="inflectLabel" value="${datum.id}" title="${Spec.title(datum.title)}" data-isfor='${JSON.stringify(datum.isfor)}'>${datum.abbr}</option>`)
    });
    var $optgroup=$("<optgroup label='language of origin'></optgroup").appendTo($select);
    termbaseConfigs.lingo.languages.map(lang => {
      $optgroup.append(`<option data-type="langLabel" value="${lang.abbr}" title="${Spec.title(lang.title)}">${lang.abbr.toUpperCase()}</option>`)
    });
    var $optgroup=$("<optgroup label='symbol'></optgroup").appendTo($select);
    $optgroup.append(`<option data-type="symbol" value="tm" title="trademark">TM</option>`);
    $optgroup.append(`<option data-type="symbol" value="regtm" title="registered trademark">®</option>`);
    $optgroup.append(`<option data-type="symbol" value="proper" title="proper noun">¶</option>`);
    var $optgroup=$("<optgroup label='formatting'></optgroup").appendTo($select);
    $optgroup.append(`<option data-type="formatting" value="italic">italic</option>`);
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
  },
};

Spec.templates["domains"]={
  type: "array",
  html: `<div>
    <div class="fy_replace" templateName="domain" jsonName=":item"></div>
    <span class="fy_adder" templateName="domain">+ domain</span>
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
    <span class="fy_label" style="width: 245px;">domain</span>
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
    $select.html(`<option value="">(select)</option>`);
    termbaseMetadata.domain.map(datum => {
      $select.append(`<option value="${datum.id}">${Spec.title(datum.title)}</option>`)
    });
  },
};
Spec.templates["subdomain"]={
  type: "string",
  blank: "",
  html: `<div class="fy_horizon">
    <span class="fy_label" style="width: 245px;">subdomain</span>
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
      $select.html(`<option value="">(none)</option>`);
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
