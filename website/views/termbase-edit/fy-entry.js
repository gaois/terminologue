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
  blank: {term: {lang: "", wording: "", inflects: []}, clarif: "", accept: "", source: ""},
  html: `<div class="fy_container">
    <div class="fy_replace" templateName="term" jsonName="term"></div>
    <div class="fy_replace" templateName="accept" jsonName="accept"></div>
    <div class="fy_replace" templateName="clarif" jsonName="clarif"></div>
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
    <div class="fy_replace" templateName="inflects" jsonName="inflects"></div>
  </div>`,
};
Spec.templates["lang"]={
  type: "string",
  html: `<span class="fy_textbox" style="width: 95px;">
    <select style="font-weight: bold;">
      <option value="ga" title="Gaeilge/Irish">GA</option>
      <option value="en" title="Béarla/English">EN</option>
    </select>
  </span>`,
  set: function($me, data){
    $me.find("select").val(data);
  },
  get: function($me){
    return $me.find("select").val();
  }
};
Spec.templates["wording"]={
  type: "string",
  html: `<span class="fy_textbox" style="position: absolute; left: 100px; right: 110px;"><input style="font-weight: bold;"/></span>`,
  set: function($me, data){
    $me.find("input").val(data);
  },
  get: function($me){
    return $me.find("input").val();
  }
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
      <option value="123" title="ginideach uatha/genitive singular">gs.</option>
      <option value="234" title="ainmneach iolra/nominative plural">npl.</option>
      <option value="345" title="ginideach iolra/genitive plural">gpl.</option>
    </select>
  </span>`,
  set: function($me, data){
    $me.find("select").val(data);
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
