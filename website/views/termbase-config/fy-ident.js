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
      <div class="goodtitle">${L("NAME")}</div>
      <div class="fy_replace" templateName="title" jsonName="title"></div>
      <div class="goodtitle">${L("BLURB")}</div>
      <div class="fy_replace" templateName="blurb" jsonName="blurb"></div>
    </div>
  </div>`,
};

Spec.templates["title"]={
  type: "object",
  html: function(){
    var html=`<div class="fy_container">
      <div class="fy_box">`;
        var langCount=0;
        termbaseConfigs.lingo.languages.map(lang => {
          if(lang.role=="major" && uilangs.map(obj => obj.abbr).indexOf(lang.abbr)>-1){
            langCount++;
            html+=`<div class="fy_horizon">
                <span class="fy_label" style="width: 245px;">${lang.abbr.toUpperCase()} (${Spec.title(lang.title)})</span>
                <span class="fy_replace" templateName="titleString" jsonName="${lang.abbr}"></span>
              </div>`;
            }
        });
        if(langCount==0){
          html+=`<div class="fy_horizon">
            <span class="fy_replace" templateName="titleStringUnlabelled" jsonName="$"></span>
          </div>`;
        }
      html+=`</div>
    </div>`;
    return html;
  },
  preprocess: function(data){
    termbaseConfigs.lingo.languages.map(lang => {
      if(lang.role=="major" && uilangs.map(obj => obj.abbr).indexOf(lang.abbr)>-1){
        if(!data[lang.abbr]) data[lang.abbr]=data.$;
      }
    });
    return data;
  },
  postprocess: function(data){
    if(!data.$) for(var key in data){ data.$=data[key]; break; }
    return data;
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
Spec.templates["titleStringUnlabelled"]={
  type: "string",
  html: `<span class="fy_textbox" style="position: absolute; inset-inline-start: 0px; inset-inline-end: 0px;"><input onchange="Fy.changed()"/></span>`,
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
    var html=`<div class="fy_container">
      <div class="fy_box">`;
        var langCount=0;
        termbaseConfigs.lingo.languages.map(lang => {
          if(lang.role=="major" && uilangs.map(obj => obj.abbr).indexOf(lang.abbr)>-1){
            langCount++;
            html+=`<div class="fy_horizon textarea">
                <div class="fy_label">${lang.abbr.toUpperCase()} (${Spec.title(lang.title)})</div>
                <span class="fy_replace" templateName="blurbString" jsonName="${lang.abbr}"></span>
              </div>`;
            }
        });
        if(langCount==0){
          html+=`<div class="fy_horizon textarea">
            <span class="fy_replace" templateName="blurbStringUnlabelled" jsonName="$"></span>
          </div>`;
        }
        html+=`</div>
    </div>`;
    return html;
  },
  preprocess: function(data){
    termbaseConfigs.lingo.languages.map(lang => {
      if(lang.role=="major" && uilangs.map(obj => obj.abbr).indexOf(lang.abbr)>-1){
        if(!data[lang.abbr]) data[lang.abbr]=data.$;
      }
    });
    return data;
  },
  postprocess: function(data){
    if(!data.$) for(var key in data){ data.$=data[key]; break; }
    return data;
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
