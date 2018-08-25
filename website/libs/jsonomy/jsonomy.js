var Editor={};
Editor.acceptabilities=[{
  id: 123, title: "molta/preferred"
}, {
  id: 234, title: "dímholta/deprecated"
}];

//start
Editor.render=function($insideme, json, uneditable){
  var $ret=$("<div class='myeditor'></div>");
  if(json.desigs) json.desigs.map(desig => { Editor.renderDesig($("<div></div>").appendTo($ret), desig, uneditable); });
  $insideme.html($ret);
};
Editor.harvest=function($insideme){
  var ret={desigs:[]};
  $insideme.find(".desig").each(function(){ ret.desigs.push(Editor.harvestDesig($(this))); });
  return JSON.stringify(ret);
};

//desig
Editor.renderDesig=function($replaceme, json, uneditable){
  var $ret=$("<div class='desig'></div>");
  //Editor.renderTerm($("<div></div>").appendTo($ret), json.term, uneditable);
  Editor.renderClarification($("<div></div>").appendTo($ret), json.clarification, uneditable);
  Editor.renderAcceptability($("<div></div>").appendTo($ret), json.acceptability, uneditable);
  $replaceme.replaceWith($ret);
};
Editor.harvestDesig=function($me){
  var ret={};
  //$me.find(".term").each(function(){ ret.term=Editor.harvestTerm($(this)); });
  $me.find(".clarification").each(function(){ ret.clarification=Editor.harvestClarification($(this)); });
  $me.find(".acceptability").each(function(){ ret.acceptability=Editor.harvestAcceptability($(this)); });
  return ret;
};

//acceptability
Editor.renderAcceptability=function($replaceme, json, uneditable){
  var $ret=$("<div class='acceptability horizon'><span class='label'>acceptability</span><span class='textbox'><select><option id=''></option></select></span></div>");
  Editor.acceptabilities.map(obj => { $ret.find("select").append("<option value='"+obj.id+"'>"+obj.title+"</option>") });
  $ret.find("select").val(json).on("change", Screenful.Editor.changed);
  $replaceme.replaceWith($ret);
};
Editor.harvestAcceptability=function($me){
  return $me.find("select").val();
};

//clarification
Editor.renderClarification=function($replaceme, json, uneditable){
  var $ret=$("<div class='clarification horizon'><span class='label'>clarification</span><span class='textbox'><input/></span></div>");
  $ret.find("input").val(json).on("change", Screenful.Editor.changed);
  $replaceme.replaceWith($ret);
};
Editor.harvestClarification=function($me){
  return $me.find("input").val();
};
