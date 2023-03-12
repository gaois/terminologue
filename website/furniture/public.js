var PrettyLarge={};
PrettyLarge.hon=function(label, i){
  $(label).addClass("on").closest(".prettyWording").find(".h"+i).addClass("on");
};
PrettyLarge.hoff=function(label, i){
  $(label).removeClass("on").closest(".prettyWording").find(".h"+i).removeClass("on");
};

function leaveTermbase(termbaseID){
  if(confirm(L("Careful! If you remove yourself from this termbase you will lose access to it."))){
    $.post(`/${termbaseID}/leaveTermbase.json`, function(result){
      if(result && result.success){
        $(".rightie .dict."+termbaseID).fadeOut("fast", function(){
          $(this).remove();
        });
      }
    });
  }
}