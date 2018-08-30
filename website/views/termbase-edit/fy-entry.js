var Spec={
  templates: {},
};
Spec.templates[":top"]={
  type: "object",
  html: `<div>
    <div class="fy_tabs">
      <span class="tab" data-name="admin">ADMIN</span>
      <span class="tab full on" data-name="terms">TRM</span>
      <span class="tab" data-name="domains">DOM</span>
      <span class="tab" data-name="definitions">DEF</span>
      <span class="tab" data-name="examples">XMPL</span>
      <span class="tab" data-name="relations">REL</span>
      <span class="tab" data-name="collections">COLL</span>
      <div class="clear"></div>
    </div>
    <div class="fy_body" data-name="terms">
      <div class="title">TERMS</div>
      <div class="fy_replace" templateName="desigs" jsonName="desigs"></div>
    </div>
  </div>`,
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
  html: `<div class="fy_container">
    <div class="fy_replace" templateName="term" jsonName="term"></div>
    <div class="fy_replace" templateName="accept" jsonName="accept"></div>
    <div class="fy_replace" templateName="clarif" jsonName="clarif"></div>
    <div class="fy_replace" templateName="sources" jsonName="sources"></div>
  </div>`,
};
Spec.templates["term"]={
  type: "object",
  html: `<div class="fy_box">
    <div class="fy_horizon">
      <span class="fy_remover"></span>
      <span class="fy_downer"></span>
      <span class="fy_upper"></span>
      <span class="fy_replace" templateName="lang" jsonName="lang"></span>
      <span class="fy_replace" templateName="wording" jsonName="wording"></span>
    </div>
    <div class="fy_replace" templateName="annots" jsonName="annots"></div>
    <div class="fy_replace" templateName="inflects" jsonName="inflects"></div>
  </div>`,
};
Spec.templates["lang"]={
  type: "string",
  html: `<span class="fy_textbox" style="width: 95px;">
    <select style="font-weight: bold;">
      <option value="">(select)</option>
      <option value="ga" title="Gaeilge/Irish">GA</option>
      <option value="en" title="Béarla/English">EN</option>
    </select>
  </span>`,
  set: function($me, data){
    if(data.toString()) $me.find("select").val(data);
  },
  get: function($me){
    return $me.find("select").val();
  }
};
Spec.templates["wording"]={
  type: "string",
  html: `<span class="fy_textbox" style="position: absolute; left: 100px; right: 110px;">
    <input style="font-weight: bold;" onkeyup="Spec.templates.wording.changed(this)" onchange="Spec.templates.wording.changed(this)"/>
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
    <span class="fy_textbox" style="position: absolute; left: 250px; right: 0px;"><input/></span>
  </div>`,
  set: function($me, data){
    $me.find("input").val(data);
  },
  get: function($me){
    return $me.find("input").val();
  }
};
Spec.templates["accept"]={
  type: "string",
  html: `<div class="fy_horizon">
    <span class="fy_label" style="width: 245px;">acceptability</span>
    <span class="fy_textbox" style="position: absolute; left: 250px; right: 0px;">
      <select>
        <option value=""></option>
        <option value="123">dímholta/deprecated</option>
        <option value="234">molta/preferred</option>
      </select>
    </span>
  </div>`,
  set: function($me, data){
    $me.find("select").val(data);
  },
  get: function($me){
    return $me.find("select").val();
  }
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
      <select>
        <option value="">(select)</option>
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
  }
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
    <select>
      <option value="">(select)</option>
      <option value="123" title="ginideach uatha/genitive singular">gs.</option>
      <option value="234" title="ainmneach iolra/nominative plural">npl.</option>
      <option value="345" title="ginideach iolra/genitive plural">gpl.</option>
    </select>
  </span>`,
  set: function($me, data){
    if(data.toString()) $me.find("select").val(data);
  },
  get: function($me){
    return $me.find("select").val();
  }
};
Spec.templates["inflectText"]={
  type: "string",
  html: `<span class="fy_textbox" style="position: absolute; left: 100px; right: 110px;"><input/></span>`,
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
  blank: {label: "", start: "1", stop: "0"},
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
    var MIN=1;
    if($(button).closest('.jsonName_stop').length>0) MIN=parseInt($(button).closest(".jsonName_item").find('.jsonName_start').find("input").val());
    if(!MIN) MIN=1;
    var $input=$(button).closest('.annotPosition').find('input');
    var val=parseInt($input.val());
    if(val==0 && $(button).closest('.jsonName_stop')) val=$(button).closest(".jsonName_term").find(".jsonName_wording input").val().length;
    if(val>MIN) {
      $input.val(val-1);
      var $annot=$input.closest(".jsonName_annots > .fy_node");
      $annot.data("template").refresh($annot);
    }
  },
  clickMore: function(button){
    var MAX=$(button).closest(".jsonName_term").find('.jsonName_wording input').val().length;
    if($(button).closest('.jsonName_start').length>0) MAX=parseInt($(button).closest(".jsonName_item").find('.jsonName_stop').find("input").val());
    if(!MAX) MAX=$(button).closest(".jsonName_term").find(".jsonName_wording input").val().length;
    var $input=$(button).closest('.annotPosition').find('input');
    var val=parseInt($input.val());
    if(val==0 && $(button).closest('.jsonName_stop')) val=$(button).closest(".jsonName_term").find(".jsonName_wording input").val().length;
    if(val<MAX) {
      $input.val(val+1);
      var $annot=$input.closest(".jsonName_annots > .fy_node");
      $annot.data("template").refresh($annot);
    }
  },
};
Spec.templates["annotLabel"]={
  type: "string",
  html: `<span class="fy_textbox" style="width: 95px;">
    <select>
      <option value="">(select)</option>
      <option value="123" title="ainmfhocal firinscneach/macho noun">nm.</option>
      <option value="234" title="ainmfhocal baininscneach/effeminate noun">nf.</option>
      <option value="345" title="briathar/verb">v.</option>
      <option value="456" title="aidiacht/adjective">adj.</option>
    </select>
  </span>`,
  set: function($me, data){
    if(data.toString()) $me.find("select").val(data);
  },
  get: function($me){
    return $me.find("select").val();
  }
};
