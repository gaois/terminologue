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

Spec.blank={},

Spec.templates[":top"]={
  type: "array",
  preprocess: function(data){
    var ret=[];
    for(var key in data){
      var obj=data[key];
      obj.key=key;
      ret.push(obj);
    }
    return ret;
  },
  html: `<div class="fy_onlybody">
    <div class="fy_pillar">
      <div class="fy_box">
        <div class="fy_replace" templateName="trigger" jsonName=":item"></div>
      </div>
    </div>
  </div>`,
  postprocess: function(data){
    var ret={};
    data.map(obj => {
      ret[obj.key]=obj;
      delete obj.key;
    });
    return ret;
  },
};

Spec.templates["trigger"]={
  type: "object",
  html: `<div class="fy_horizon">
      <span class="fy_textbox" style="position: absolute; left: 700px; right: 0px;">
        <select onchange="Fy.changed()">
          <option value="">${L("no change")}</option>
          <option value="c">${L("change to 'not checked'")}</option>
          <option value="p">${L("change to 'hidden'")}</option>
          <option value="cp">${L("change to 'not checked' and 'hidden'")}</option>
        </select>
      </span>
      <span class="fy_label" style="width: 695px;"></span>
      <input type="hidden" class='key'/>
    </div>`,
  set: function($me, data){
    $me.find("input.key").val(data.key);
    $me.find(".fy_label").html(L("trigger_"+data.key));
    if(data.cStatus && data.pStatus) $me.find("select").val("cp");
    else if(data.cStatus) $me.find("select").val("c");
    else if(data.pStatus) $me.find("select").val("p");
  },
  get: function($me){
    var data={};
    data.key=$me.find("input.key").val();
    var val=$me.find("select").val();
    if(val=="c" || val=="cp") data.cStatus=true; else data.cStatus=false;
    if(val=="p" || val=="cp") data.pStatus=true; else data.pStatus=false;
    return data;
  },
};
