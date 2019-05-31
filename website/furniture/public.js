var PrettyLarge={};
PrettyLarge.hon=function(label, i){
  $(label).addClass("on").closest(".prettyWording").find(".h"+i).addClass("on");
};
PrettyLarge.hoff=function(label, i){
  $(label).removeClass("on").closest(".prettyWording").find(".h"+i).removeClass("on");
};
