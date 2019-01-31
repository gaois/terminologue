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
    <div class="goodtitle">${L("BLURB")}</div>
    <div class="fy_replace" templateName="blurb" jsonName="blurb"></div>
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

Spec.templates["blurb"]={
  type: "object",
  html: function(){
    var html=`<div class="fy_container fy_collapsible">
      <div class="fy_box">
        <div class="fy_horizon textarea">
          <span class="fy_replace" templateName="blurbStringUnlabelled" jsonName="$"></span>
        </div>
        <div class="fy_lineabove fy_hidable">`;
          uilangs.map(lang => {
            html+=`<div class="fy_horizon textarea">
                <div class="fy_label">${lang.abbr.toUpperCase()} (${lang.caption})</div>
                <span class="fy_replace" templateName="blurbString" jsonName="${lang.abbr}"></span>
              </div>`;
          });
        html+=`</div>
      </div>
    </div>`;
    return html;
  },
};
Spec.templates["blurbString"]={
  type: "string",
  html: `<span class="fy_textbox"><textarea onchange="Fy.changed()"/></textarea></span>`,
  //html: `<span class="fy_textbox" style="position: absolute; left: 250px; right: 0px;"><input onchange="Fy.changed()"/></span>`,
  set: function($me, data){
    $me.find("textarea").val(data);
  },
  get: function($me){
    return $me.find("textarea").val();
  },
};
Spec.templates["blurbStringUnlabelled"]={
  type: "string",
  html: `<span class="fy_textbox"><textarea onchange="Fy.changed()"/></textarea></span>`,
  set: function($me, data){
    $me.find("textarea").val(data);
  },
  get: function($me){
    return $me.find("textarea").val();
  },
};
