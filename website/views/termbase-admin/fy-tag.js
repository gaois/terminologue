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
  title: "",
},

Spec.templates[":top"]={
  type: "object",
  html: `<div class="fy_onlybody">
    <div class="fy_replace" templateName="title" jsonName="title"></div>
  </div>`,
};

Spec.templates["title"]={
  type: "string",
  html: function(){
    var html=`<div class="title">${L("TITLE")}</div>
    <div class="fy_container">
      <div class="fy_box">
        <div class="fy_horizon">
          <span class="fy_textbox" style="position: absolute; left: 0px; right: 0px;"><input onchange="Fy.changed()"/></span>
        </div>
      </div>
    </div>`;
    return html;
  },
  set: function($me, data){
    $me.find("input").val(data);
  },
  get: function($me){
    return $me.find("input").val();
  },
};
