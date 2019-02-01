var Spec={
  templates: {},
};
Spec.title=function(title, lang){
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
  return ret;
};

Spec.blank={},

Spec.templates[":top"]={
  type: "array",
  preprocess: function(data){
    var ret=[];
    for(var key in data){
      var obj=data[key];
      obj.email=key;
      ret.push(obj);
    }
    return ret;
  },
  html: `<div class="fy_onlybody">
    <div class="fy_pillar">
      <div class="fy_replace" templateName="user" jsonName=":item"></div>
      <span class="fy_adder" templateName="user">+ ${L("user")}</span>
    </div>
  </div>`,
  postprocess: function(data){
    var ret={};
    data.map(obj => {
      ret[obj.email]=obj;
      delete obj.email;
    });
    return ret;
  },
};

Spec.templates["user"]={
  blank: {email: "", level: "1"},
  type: "object",
  html: `<div class="fy_container">
    <div class="fy_box">
      <div class="fy_replace" templateName="email" jsonName="email"></div>
      <div class="fy_replace" templateName="level" jsonName="level"></div>
    </div>
  </div>`,
};

Spec.templates["email"]={
  type: "string",
  html: `<div class="fy_horizon">
    <span class="fy_remover"></span>
    <span class="fy_downer"></span>
    <span class="fy_upper"></span>
    <span class="fy_textbox" style="position: absolute; left: 250px; right: 110px; font-weight: bold;"><input onchange="Fy.changed()"/></span>
    <span class="fy_label" style="width: 245px;">${L("e-mail address")}</span>
  </div>`,
  set: function($me, data){
    $me.find("input").val(data);
  },
  get: function($me){
    return $me.find("input").val();
  },
};

Spec.templates["level"]={
  type: "string",
  html: `<div class="fy_box">
    <div class="fy_horizon">
      <span class="fy_textbox" style="position: absolute; left: 250px; right: 0px;">
        <select onchange="Fy.changed()">
          <option value="1">1 — ${L("reader")}</option>
          <option value="2">2 — ${L("editor")}</option>
          <option value="3">3 — ${L("creator")}</option>
          <option value="4">4 — ${L("administrator")}</option>
          <option value="5">5 — ${L("configurator")}</option>
        </select>
      </span>
      <span class="fy_label" style="width: 245px;">${L("level")}</span>
    </div>
  </div>`,
  set: function($me, data){
    $me.find("select").val(data);
  },
  get: function($me){
    return $me.find("select").val();
  },
};
