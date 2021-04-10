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
  level: "0",
},

Spec.templates[":top"]={
  type: "object",
  html: `<div class="fy_onlybody">
    <div class="fy_replace" templateName="title" jsonName="title"></div>
    <div class="fy_replace" templateName="level" jsonName="level"></div>
  </div>`,
};

Spec.templates["title"]={
  type: "object",
  html: function(){
    var html=`<div class="title">${L("TITLE")}</div>
    <div class="fy_container">
      <div class="fy_box">`;
      termbaseConfigs.lingo.languages.map(lang => {
        if(lang.role=="major"){
          html+=`<div class="fy_horizon">
              <span class="fy_label" style="width: 245px;">${lang.abbr.toUpperCase()} (${Spec.title(lang.title)})</span>
              <span class="fy_replace" templateName="titleString" jsonName="${lang.abbr}"></span>
            </div>`;
        }
      });
      html+=`</div>
    </div>`;
    return html;
  },
};
Spec.templates["titleString"]={
  type: "string",
  html: `<span class="fy_textbox" style="position: absolute; inset-inline-start: 250px; inset-inline-end: 0px;"><input onchange="Fy.changed()"/></span>`,
  set: function($me, data){
    $me.find("input").val(data);
  },
  get: function($me){
    return $me.find("input").val();
  },
};

Spec.templates["level"]={
  type: "string",
  html: `<div class="title">${L("PRIORITY")}</div>
  <div class="fy_container">
    <div class="fy_box">
      <div class="fy_horizon">
        <span class="fy_textbox" style="position: absolute; inset-inline-start: 0px; inset-inline-end: 0px;">
          <select onchange="Fy.changed()">
            <option value="1">${L("high")}</option>
            <option value="0">${L("medium")}</option>
            <option value="-1">${L("low")}</option>
          </select>
        </span>
      </div>
    </div>
  </div>`,
  set: function($me, data){
    $me.find("select").val(data);
  },
  get: function($me){
    return $me.find("select").val();
  },
};
