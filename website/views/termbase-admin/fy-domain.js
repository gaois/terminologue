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
  subdomains: [],
},

Spec.templates[":top"]={
  type: "object",
  html: `<div class="fy_onlybody">
    <div class="title">${L("PARENT")}</div>
    <div class="fy_replace" templateName="parentID" jsonName="parentID"></div>
    <div class="title">${L("TITLE")}</div>
    <div class="fy_replace" templateName="title" jsonName="title"></div>
    <div class="goodtitle">${L("SUBDOMAINS")}</div>
    <div class="fy_replace" templateName="subdomains" jsonName="subdomains"></div>
  </div>`,
};
Spec.templates["hiddenID"]={
  type: "string",
  html: `<input type="hidden"/>`,
  set: function($me, data){
    if(data.toString()) $me.val(data);
  },
  get: function($me){
    return $me.val();
  },
};

Spec.templates["parentID"]={
  type: "string",
  html: function(){
    var html=`<div class="fy_container">
      <div class="fy_box">`;
      html+=`<div class="fy_horizon">
          <span class="fy_textbox" style="position: absolute; left: 5px; right: 0px;"><input onchange="Fy.changed()"/></span>
        </div>`;
      html+=`</div>
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

Spec.templates["title"]={
  type: "object",
  html: function(){
    var html=`<div class="fy_container">
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
  html: `<span class="fy_textbox" style="position: absolute; left: 250px; right: 0px;"><input onchange="Fy.changed()"/></span>`,
  set: function($me, data){
    $me.find("input").val(data);
  },
  get: function($me){
    return $me.find("input").val();
  },
};

Spec.templates["subdomains"]={
  type: "array",
  html: `<div class="fy_hidable">
    <div class="fy_replace" templateName="subdomain" jsonName=":item"></div>
    <span class="fy_adder big" templateName="subdomain"><span class="collapsor">+</span>${L("subdomain")}</span>
  </div>`,
};
Spec.templates["subdomain"]={
  type: "object",
  blank: {term: {lang: "", wording: "", inflects: [], annots: []}, clarif: "", accept: "", sources: []},
  html: `<div class="fy_container fy_collapsible">
    <div class="fy_replace" templateName="hiddenID" jsonName="lid"></div>
    <div class="fy_replace" templateName="subdomainTitle" jsonName="title"></div>
    <div class="fy_replace" templateName="subdomains" jsonName="subdomains"></div>
  </div>`,
};

Spec.templates["subdomainTitle"]={
  type: "object",
  html: function(){
    var html=`<div class="fy_container">
      <div class="fy_box">`;
      var count=0;
      termbaseConfigs.lingo.languages.map(lang => {
        if(lang.role=="major"){
          html+=`<div class="fy_horizon">`;
            if(count==0) html+=`<span class="fy_remover"></span>
            <span class="fy_downer"></span>
            <span class="fy_upper"></span>`;
            html+=`<span class="fy_label" style="width: 245px;">${lang.abbr.toUpperCase()} (${Spec.title(lang.title)})</span>
            <span class="fy_replace" templateName="subdomainTitleString" jsonName="${lang.abbr}"></span>
          </div>`;
          count++;
        }
      });
      html+=`</div>
    </div>`;
    return html;
  },
};
Spec.templates["subdomainTitleString"]={
  type: "string",
  html: `<span class="fy_textbox" style="position: absolute; left: 250px; right: 110px;"><input onchange="Fy.changed()"/></span>`,
  set: function($me, data){
    $me.find("input").val(data);
  },
  get: function($me){
    return $me.find("input").val();
  },
};
