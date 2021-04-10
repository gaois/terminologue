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
  preprocess: function(data){
    var ret=[];
    for(var lang in data){
      var obj={lang: lang, data: data[lang]};
      ret.push(obj);
    };
    return ret;
  },
  type: "array",
  html: `<div class="fy_onlybody">
    <div class="fy_pillar">
      <div class="fy_replace" templateName="item" jsonName=":item"></div>
      <span class="fy_adder" templateName="item">+ ${L("language")}</span>
    </div>
  </div>`,
  postprocess: function(data){
    var ret={};
    data.map(obj => {
      var lang=obj.lang;
      ret[lang]=obj.data;
    })
    console.log(ret);
    return ret;;
  },
};

Spec.templates["item"]={
  blank: {lang: "", data: defaultAbc},
  type: "object",
  html: `<div class="fy_container">
    <div class="fy_box">
      <div class="fy_replace" templateName="lang" jsonName="lang"></div>
      <div class="fy_replace" templateName="data" jsonName="data"></div>
    </div>
  </div>`,
};

Spec.templates["lang"]={
  type: "string",
  html: `<div class="fy_horizon">
    <span class="fy_remover" changeName='domainRemove'></span>
    <span class="fy_downer"  changeName='domainReorder'></span>
    <span class="fy_upper"   changeName='domainReorder'></span>
    <span class="fy_textbox" style="position: absolute; inset-inline-start: 0px; inset-inline-end: 110px;">
      <select style="font-weight: bold;" onchange="Fy.changed()"></select>
    </span>
  </div>`,
  set: function($me, data){
    if(data.toString()) $me.find("select").val(data);
  },
  get: function($me){
    return $me.find("select").val();
  },
  populate: function($me){
    var $select=$me.find("select");
    termbaseConfigs.lingo.languages.map(lang => {
      $select.append(`<option value="${lang.abbr}">${lang.abbr.toUpperCase()} (${Spec.title(lang.title)})</option>`)
    });
  },
};

Spec.templates["data"]={
  type: "string",
  html: `<div class="fy_horizon textarea">
    <span class="fy_textbox"><textarea style="height: 100px;" onchange="Fy.changed()"/></textarea></span>
  </div>`,
  set: function($me, data){
    $me.find("textarea").val(data);
  },
  get: function($me){
    return $me.find("textarea").val();
  },
  preprocess: function(data){
    return this.abc2txt(data);
  },
  postprocess: function(data){
    return this.txt2abc(data);
  },
  abc2txt: function(abc){
  	abc=abc || [];
  	var ret="";
  	for(var x=0; x<abc.length; x++){
  		var line="";
  		for(var y=0; y<abc[x].length; y++){ if(line!="") line+=" "; line+=abc[x][y]; }
  		if(line!="") ret+=line+"\n";
  	}
  	return ret;
  },
  txt2abc: function(txt){
  	var abc=[];
  	var rows=txt.split('\n');
  	for(var x=0; x<rows.length; x++){
  		var line=[];
  		var columns=rows[x].split(' ');
  		for(var y=0; y<columns.length; y++){
  			var char=$.trim(columns[y]);
  			if(char!="") line.push(char);
  		}
  		if(line.length>0) abc.push(line);
  	}
  	return abc;
  },
};
