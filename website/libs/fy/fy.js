var Fy={};

Fy.render=function($insideme, data, spec, uneditable){
  var template=spec.templates[":top"]
  var $html=Fy.renderNode(data, template, spec, uneditable);
  $insideme.addClass("fy").html($html);
};
Fy.harvest=function($insideme){
  var $html=$insideme.find("*").first();
  return Fy.harvestNode($html);
};

Fy.renderNode=function(data, template, spec, uneditable){
  var $html=$(template.html).addClass("fy_node").data("template", template);
  if(template.set) template.set($html, data);
  $html.find(".fy_adder").on("click", function(e){
    var $adder=$(e.delegateTarget);
    var subtemplateName=$adder.attr("templateName");
    var subtemplate=spec.templates[subtemplateName];
    $adder.before(
      Fy.renderNode(subtemplate.blank, subtemplate, spec, uneditable).data("jsonName", ":item").hide().fadeIn()
    );
  });
  $html.find(".fy_remover").html("×").on("click", function(e){
    var $adder=$(e.delegateTarget);
    var jsonName=$adder.attr("jsonName");
    var found=false;
    $adder.parents(".fy_node").each(function(){
      var $node=$(this);
      if(!found && $node.data("jsonName")==":item") {
        $node.fadeOut(function(){ $(this).remove() })
        found=true;
      }
    });
  });
  $html.find(".fy_downer").html("▾").on("click", function(e){
    var $adder=$(e.delegateTarget);
    var jsonName=$adder.attr("jsonName");
    var found=false;
    $adder.parents(".fy_node").each(function(){
      var $node=$(this);
      if(!found && $node.data("jsonName")==":item") {
        $node.next(".fy_node").after($node.hide().fadeIn());
        found=true;
      }
    });
  });
  $html.find(".fy_upper").html("▴").on("click", function(e){
    var $adder=$(e.delegateTarget);
    var jsonName=$adder.attr("jsonName");
    var found=false;
    $adder.parents(".fy_node").each(function(){
      var $node=$(this);
      if(!found && $node.data("jsonName")==":item") {
        $node.prev(".fy_node").before($node.hide().fadeIn());
        found=true;
      }
    });
  });
  $html.find(".fy_replace").each(function(){
    var $div=$(this);
    var subtemplateName=$div.attr("templateName");
    var subtemplate=spec.templates[subtemplateName];
    var jsonName=$div.attr("jsonName");
    if(jsonName==":item" && $.isArray(data)){
      data.map(subdata => {
        $div.before(
          Fy.renderNode(subdata, subtemplate, spec, uneditable).data("jsonName", jsonName)
        );
      });
      $div.remove();
    } else {
      var subdata=data[jsonName] || [];
      $div.replaceWith(Fy.renderNode(subdata, subtemplate, spec, uneditable).data("jsonName", jsonName));
    }
  });
  return $html;
};
Fy.harvestNode=function($html){
  var template=$html.data("template");
  if(template.get) {
    return template.get($html);
  } else {
    var $subnodes=$html.find(".fy_node").not($html.find(".fy_node .fy_node"));
    if(template.type=="array"){
      var ret=[];
      $subnodes.each(function(){ ret.push(Fy.harvestNode($(this))) });
      return ret;
    } else {
      var ret={};
      $subnodes.each(function(){ ret[$(this).data("jsonName")]=Fy.harvestNode($(this)) });
      return ret;
    }
  }
};
