Screenful.Curtain={
  open: function(url, callback){
    $("#curtainframe").remove();
    var $curtain=$(`
      <div id="curtainframe">
        <div class="shade"></div>
        <div class="inside"><div class="margin"><iframe src="${url}" scrolling="no" frameborder="0" /></div></div>
      </div>
    `).appendTo("body").hide().fadeIn("slow");
    $curtain.on("click", function(){
      $("#curtainframe").remove();
      callback();
    });
  },
};
