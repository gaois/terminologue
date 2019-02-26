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

      <div class="fy_container">
        <div class="fy_box">
          <div class="fy_horizon">
            <span class="fy_label" style="width: 245px;">${L("Display from")}</span>
            <span class="fy_replace" templateName="when" jsonName="from"></span>
          </div>
          <div class="fy_horizon">
            <span class="fy_label" style="width: 245px;">${L("Display until")}</span>
            <span class="fy_replace" templateName="when" jsonName="till"></span>
          </div>
        </div>
      </div>

      <div class="fy_replace" templateName="blurb" jsonName="text"></div>

    </div>
  </div>`,
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

Spec.templates["when"]={
  type: "string",
  html: `<span class="fy_textbox" style="position: absolute; left: 250px; right: 0px;">
    <input type="date" class="date" onchange="Fy.changed()" style="width: auto"/>
    <input type="time" class="time" onchange="Fy.changed()" style="width: auto"/>
  </span>`,
  set: function($me, data){
    $me.find("input.date").val(data.date);
    $me.find("input.time").val(data.time);
  },
  get: function($me){
    return {
      date: $me.find("input.date").val(),
      time: $me.find("input.time").val(),
    };
  },
};
