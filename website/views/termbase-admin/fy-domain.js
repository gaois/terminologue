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
  if(!ret) ret="???";
  return ret;
};
Spec.getDomain=function(id){
  var ret=null;
  termbaseMetadata.domain=(termbaseMetadata.domain || []);
  termbaseMetadata.domain.map(datum => {  if(!ret && datum.id==id) ret=datum; });
  return ret;
};
Spec.longTitle=function(domain){
  var ret=Spec.title(domain.title);
  var dom=domain; while(dom.parentID){
    var dom=Spec.getDomain(dom.parentID);
    if(dom) ret=Spec.title(dom.title)+" » "+ret;
  }
  return ret;
};
Spec.domainHasChildren=function(domain){
  var ret=false;
  termbaseMetadata.domain.map(datum => {  if(datum.parentID==domain.id) ret=true; });
  return ret;
};

Spec.blank={
  parentID: "",
  title: {},
},

Spec.templates[":top"]={
  type: "object",
  html: `<div class="fy_onlybody">
    <div class="title">${L("PARENT")}</div>
    <div class="fy_replace" templateName="parentID" jsonName="parentID"></div>
    <div class="title">${L("TITLE")}</div>
    <div class="fy_replace" templateName="title" jsonName="title"></div>
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
      <div class="fy_box">
        <div class="fy_horizon">
          <span class="fy_remover" changeName="domainRemove"></span>
          <span class="fy_downer" changeName="domainReorder"></span>
          <span class="fy_upper" changeName="domainReorder"></span>
          <span class="fy_textbox" style="display: block; margin-left: 5px; margin-right: 125px;">
            <select onchange="Fy.changed();" size="1" style="width: 100%" onfocus="this.size='10'; Spec.changeSelectTitles(this)" onblur="this.size='1'; Spec.changeSelectTitles(this)"></select>
          </span>
        </div>
      </div>
    </div>`;
    return html;
  },
  populate: function($me){
    Spec.templates["parentID"].refillOptions($me, "0");
  },
  set: function($me, data){
    Spec.templates["parentID"].refillOptions($me, data);
  },
  get: function($me){
    return $me.find("select").val();
  },
  refillOptions: function($me, selectedDomainID){
    domains=[];
    var selectedDomain=Spec.getDomain(selectedDomainID);
    if(!selectedDomain){ //if no domain is selected:
      termbaseMetadata.domain.map(domain => { if(!domain.parentID){ domains.push(domain); }});
    } else {
      domains.push(selectedDomain);
      termbaseMetadata.domain.map(domain => { if(domain.parentID==selectedDomainID){ domains.push(domain); }});
      //add all parents to the front of the list:
      var parentID=selectedDomain.parentID;
      while(parentID){
        var domain=Spec.getDomain(parentID);
        parentID=null;
        if(domain){
          domains.unshift(domain);
          parentID=domain.parentID;
        }
      }
    }
    var $select=$me.find("select").html("");
    var level=0;
    $select.append(`<option class="oneofmany" value="">(${L("no parent")})</option>`);
    if(selectedDomain){
      var level=1;
    }
    var prevDomainID=0;
    domains.map(domain => {
      if(domain.parentID==prevDomainID) level++;
      var padding=""; for(var i=0; i<level; i++) padding+="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
      var driller="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"; if(Spec.domainHasChildren(domain)) driller="►&nbsp;";
      var shortTitle=`${padding}${driller}${Spec.title(domain.title)}`;
      var longTitle=Spec.longTitle(domain);
      var $option=$(`<option class="oneofmany" value="${domain.id}">${longTitle}</option>`);
      $option.data("shortTitle", shortTitle);
      $option.data("longTitle", longTitle);
      $select.append($option);
      prevDomainID=domain.id;
    });
    $select.find("option").on("click", function(e){
      Spec.templates["parentID"].refillOptions($me, $(e.delegateTarget).attr("value"));
    });
    Spec.changeSelectTitles($select);
    if(typeof(selectedDomainID)=="string") $select.val(selectedDomainID);
    else $select.val("");
  },
};
Spec.changeSelectTitles=function(select){
  var $select=$(select);
  if($select.attr("size")=="1"){
    $select.find("option").each(function(){
      var $option=$(this);
      if($option.data("longTitle")) $option.html($option.data("longTitle"));
    });
  } else {
    $select.find("option").each(function(){
      var $option=$(this);
      if($option.data("shortTitle")) $option.html($option.data("shortTitle"));
    });
  }
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
