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

Spec.blank={
  title: {},
},

Spec.templates[":top"]={
  type: "object",
  html: `<div class="fy_onlybody">
    <div class="fy_pillar">
      <div class="fy_replace" templateName="languages" jsonName="languages"></div>
    </div>
  </div>`,
};

Spec.templates["languages"]={
  type: "array",
  html: `<div>
    <div class="fy_replace" templateName="language" jsonName=":item"></div>
    <span class="fy_adder" templateName="language">+ ${L("language")}</span>
  </div>`,
};

Spec.templates["language"]={
  blank: {abbr: "", role: "major", title: {$: ""}},
  type: "object",
  html: `<div class="fy_container">
    <div class="fy_box">
      <div class="fy_replace" templateName="role" jsonName="role"></div>
      <div class="fy_replace" templateName="abbr" jsonName="abbr"></div>
      <div class="fy_replace" templateName="title" jsonName="title"></div>
    </div>
  </div>`,
};

Spec.templates["abbr"]={
  type: "string",
  html: `<div class="fy_horizon">
    <span class="fy_remover"></span>
    <span class="fy_downer"></span>
    <span class="fy_upper"></span>
    <span class="fy_textbox" style="position: absolute; left: 250px; right: 110px; font-weight: bold;"><input onchange="Fy.changed()"/></span>
    <span class="fy_label" style="width: 245px;">${L("abbreviation")}</span>
  </div>`,
  set: function($me, data){
    $me.find("input").val(data);
  },
  get: function($me){
    return $me.find("input").val();
  },
};

Spec.templates["role"]={
  type: "string",
  html: `<div class="fy_horizon">
    <span class="fy_textbox" style="position: absolute; left: 250px; right: 0px;">
      <select onchange="Fy.changed()">
        <option value="major">${L("major")}</option>
        <option value="minor">${L("minor")}</option>
      </select>
    </span>
    <span class="fy_label" style="width: 245px;">${L("role")}</span>
  </div>`,
  set: function($me, data){
    $me.find("select").val(data);
  },
  get: function($me){
    return $me.find("select").val();
  },
};

Spec.templates["title"]={
  type: "object",
  preprocess: function(data){
    termbaseConfigs.lingo.languages.map(lang => {
      if(lang.role=="major" && lang.abbr){
        if(!data[lang.abbr]) data[lang.abbr]=data.$;
      }
    });
    return data;
  },
  html: function(){
    var html=`<div class="fy_container">`;
      var langCount=0;
      if(termbaseConfigs.lingo.languages.length>1) {
        termbaseConfigs.lingo.languages.map(lang => {
          if(lang.role=="major" && lang.abbr){
            langCount++;
            html+=`<div class="fy_horizon">
              <span class="fy_label" style="width: 245px;">${L("title")} (${lang.abbr.toUpperCase()})</span>
              <span class="fy_replace" templateName="titleString" jsonName="${lang.abbr}"></span>
            </div>`;
          }
        });
      }
      if(langCount==0){
        html+=`<div class="fy_horizon">
          <span class="fy_label" style="width: 245px;">${L("title")}</span>
          <span class="fy_replace" templateName="titleString" jsonName="$"></span>
        </div>`;
      }
      html+=`</div>`;
    return html;
  },
};
Spec.templates["titleString"]={
  type: "string",
  html: `<span class="fy_textbox" style="position: absolute; left: 250px; right: 0px;"><input onchange="Fy.changed()"/></span>`,
  set: function($me, data){
    $me.find("input").val(data);
  },
  get: function($me){
    return $me.find("input").val();
  },
};
