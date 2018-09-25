Screenful.Uilang={
  start: function(){
    $(".ScreenfulUilang").html("<div class='clickable'>"+Screenful.Uilang.current+" <span class='arrow'>▼</span></div><div class='menu' style='display: none'></div>");
    for(var i=0; i<Screenful.Uilang.languages.length; i++){
      var lang=Screenful.Uilang.languages[i];
      $(".ScreenfulUilang .menu").append("<a href='"+lang.url+"'>"+lang.caption+"</a>");
    }
    $(".ScreenfulUilang .clickable").on("click", function(e){
      var $mymenu=$(e.delegateTarget).closest(".ScreenfulUilang").find(".menu");
      $(".menu:visible").not($mymenu).slideUp();
      $mymenu.hide().slideDown();
      e.stopPropagation();
    });
    $(document).on("click", function(e){
      $(".menu:visible").slideUp();
    });
  },
};
$(window).ready(Screenful.Uilang.start);
