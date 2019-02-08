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

Spec.templates[":top"]={
  type: "object",
  html: `<div class="fy_onlybody">
    <div class="fy_pillar">
      <div class="goodtitle">${L("ACCESS LEVEL")}</div>
      <div class="fy_replace" templateName="public" jsonName="public"></div>
      <div class="goodtitle lic">${L("LICENCE")}</div>
      <div class="lic">
        <div class="fy_replace" templateName="licence" jsonName="licence"></div>
      </div>
    </div>
  </div>`,
  refresh: function($me){
    var val=$me.find(".jsonName_public select").val();
    if(val=="1") $me.find(".lic").show(); else $me.find(".lic").hide();
  },
};

Spec.templates["public"]={
  type: "bool",
  html: `<div class="fy_box">
    <div class="fy_horizon">
      <span class="fy_textbox" style="position: absolute; left: 0px; right: 0px;">
        <select onchange="Fy.changed(); $(this).closest('.fy_onlybody').data('template').refresh( $(this).closest('.fy_onlybody') )">
          <option value="0">${L("private")}</option>
          <option value="1">${L("public")}</option>
        </select>
      </span>
    </div>
  </div>`,
  set: function($me, data){
    if(data===true) $me.find("select").val("1"); else $me.find("select").val("0");
  },
  get: function($me){
    return ($me.find("select").val()=="1");
  },
};

Spec.templates["licence"]={
  type: "string",
  preprocess: function(data){
    if(!licences[data]) for(var key in licences){ data=key; break;}
    return data;
  },
  html: `<div class="fy_box">
    <div class="fy_horizon">
      <span class="fy_textbox" style="position: absolute; left: 0px; right: 0px;">
        <select onchange="Fy.changed();">
        </select>
      </span>
    </div>
  </div>`,
  set: function($me, data){
    $me.find("select").val(data);
  },
  get: function($me){
    return $me.find("select").val();
  },
  populate: function($me){
    var $select=$me.find("select");
    for(var key in licences){
      $select.append(`<option value="${key}">${licences[key].title}</option>`)
    }
    // termbaseMetadata.domain.map(datum => {
    //   $select.append(`<option value="${datum.id}">${Spec.title(datum.title)}</option>`)
    // });
  },
};
