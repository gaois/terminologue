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
    <div class="goodtitle">${L("TITLE")}</div>
    <div class="fy_replace" templateName="title" jsonName="title"></div>
    <div class="goodtitle">${L("USERS")}</div>
    <div class="fy_replace" templateName="users" jsonName="users"></div>
  </div>`,
};

Spec.templates["title"]={
  type: "object",
  html: function(){
    var html=`<div class="fy_container fy_collapsible">
      <div class="fy_box">
        <div class="fy_horizon">
          <span class="fy_replace" templateName="titleStringUnlabelled" jsonName="$"></span>
        </div>
        <div class="fy_lineabove fy_hidable">`;
          uilangs.map(lang => {
            html+=`<div class="fy_horizon">
                <span class="fy_label" style="width: 245px;">${lang.abbr.toUpperCase()} (${lang.caption})</span>
                <span class="fy_replace" templateName="titleString" jsonName="${lang.abbr}"></span>
              </div>`;
          });
        html+=`</div>
      </div>
    </div>`;
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
Spec.templates["titleStringUnlabelled"]={
  type: "string",
  html: `<span class="fy_textbox" style="position: absolute; left: 0px; right: 0px;"><input onchange="Fy.changed()"/></span>`,
  set: function($me, data){
    $me.find("input").val(data);
  },
  get: function($me){
    return $me.find("input").val();
  },
};

Spec.templates["users"]={
  type: "array",
  html: function(){
    var html=`<div class="fy_container">
      <div class="fy_box">
      <div class="fy_replace" templateName="user" jsonName=":item"></div>
      <span class="fy_adder" templateName="user">+ ${L("user")}</span>
      </div>
    </div>`;
    return html;
  },
};
Spec.templates["user"]={
  type: "string",
  html: `<div class="fy_horizon">
    <span class="fy_remover"></span>
    <span class="fy_downer"></span>
    <span class="fy_upper"></span>
    <span class="fy_textbox" style="position: absolute; left: 250px; right: 110px;"><input onchange="Fy.changed()"/></span>
    <span class="fy_label" style="width: 245px;">${L("e-mail address")}</span>
  </div>`,
  set: function($me, data){
    $me.find("input").val(data);
  },
  get: function($me){
    return $me.find("input").val();
  },
};
