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
  abbr: "",
  title: {},
},

Spec.templates[":top"]={
  type: "object",
  html: `<div class="fy_onlybody">
    <div class="fy_replace" templateName="abbr" jsonName="abbr"></div>
    <div class="fy_replace" templateName="title" jsonName="title"></div>
    <div class="fy_replace" templateName="isfor" jsonName="isfor"></div>
  </div>`,
};

Spec.templates["abbr"]={
  type: "string",
  html: `<div class="fy_container">
    <div class="fy_box">
      <div class="fy_horizon">
        <span class="fy_label" style="width: 245px;">${L("abbreviation")}</span>
        <span class="fy_textbox" style="position: absolute; left: 250px; right: 0px;"><input onchange="Fy.changed()"/></span>
      </div>
    </div>
  </div>`,
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
  html: `<span class="fy_textbox" style="position: absolute; left: 250px; right: 0px;"><input onchange="Fy.changed()"/></span>`,
  set: function($me, data){
    $me.find("input").val(data);
  },
  get: function($me){
    return $me.find("input").val();
  },
};

Spec.templates["isfor"]={
  type: "array",
  html: function(){
    var html=`<div class="title">
      ${L("LANGUAGES")}
      <span class="link" onclick="$(this).closest('.title').next('.fy_container').first().find('input').prop('checked', true)">${L("select all")}</span>
      <span class="link" onclick="$(this).closest('.title').next('.fy_container').first().find('input').prop('checked', false)">${L("unselect all")}</span>
    </div>
    <div class="fy_container">
      <div class="fy_box">
        <div class="fy_column">`;
          termbaseConfigs.lingo.languages.map(lang => {
            if(lang.role=="major"){
              html+=`<div>
                <label>
                  <input type="checkbox" data-lang="${lang.abbr}" onchange="Fy.changed()"/>
                  ${lang.abbr.toUpperCase()} (${Spec.title(lang.title)})
                </label>
              </div>`;
            }
          });
        html+=`</div>
        <div class="fy_column">`;
          termbaseConfigs.lingo.languages.map(lang => {
            if(lang.role=="minor"){
              html+=`<div>
                <label>
                  <input type="checkbox" data-lang="${lang.abbr}" onchange="Fy.changed()"/>
                  ${lang.abbr.toUpperCase()} (${Spec.title(lang.title)})
                </label>
              </div>`;
            }
          });
        html+=`</div>`;
      html+=`</div>
    </div>`;
    return html;
  },
  set: function($me, data){
    data.map(abbr => {
      $me.find('input[data-lang="'+abbr+'"]').prop("checked", true);
      if(abbr=="_all") termbaseConfigs.lingo.languages.map(lang => { $me.find('input[data-lang="'+lang.abbr+'"]').prop("checked", true); });
      if(abbr=="_allmajor") termbaseConfigs.lingo.languages.map(lang => { if(lang.role=="major") $me.find('input[data-lang="'+lang.abbr+'"]').prop("checked", true); });
      if(abbr=="_allminor") termbaseConfigs.lingo.languages.map(lang => { if(lang.role=="minor") $me.find('input[data-lang="'+lang.abbr+'"]').prop("checked", true); });
    });
  },
  get: function($me){
    var abbrs=[];
    $me.find("input:checked").each(function(){
      var abbr=$(this).attr("data-lang");
      abbrs.push(abbr);
    });
    var allMajors=[]; var selectedMajors=[];
    var allMinors=[]; var selectedMinors=[];
    termbaseConfigs.lingo.languages.map(lang => {
      if(lang.role=="major") allMajors.push(lang.abbr);
      if(lang.role=="minor") allMinors.push(lang.abbr);
      if(abbrs.indexOf(lang.abbr)>-1){
        if(lang.role=="major") selectedMajors.push(lang.abbr);
        if(lang.role=="minor") selectedMinors.push(lang.abbr);
      }
    });
    var ret=[];
    if(allMajors.length==selectedMajors.length && allMinors.length==selectedMinors.length){
      ret=["_all"];
    } else if(allMajors.length==selectedMajors.length){
      ret=["_allmajor"].concat(selectedMinors);
    } else if(allMinors.length==selectedMinors.length){
      ret=selectedMajors.concat(["_allminor"]);
    } else {
      ret=selectedMajors.concat(selectedMinors);
    }
    return ret;
  },
};
