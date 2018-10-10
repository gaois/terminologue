Screenful.Commenting={
  currentEntryID: null,
  go: function(){
    var entryID=Screenful.Editor.entryID;
    if(entryID && entryID!=Screenful.Commenting.currentEntryID){
      Screenful.Commenting.currentEntryID=entryID;
      $("#commenting").html("");
      Screenful.Commenting.list();
    }
  },
  list: function(){
    // $("#commenting").append(Screenful.Commenting.draw("123", "someone@example.com", "2018-10-01 08:23:55", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat?"));
    // $("#commenting").append(Screenful.Commenting.draw("345", "valselob@gmail.com", "2018-10-02 13:03:23", "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."));
    $("#commenting").append(Screenful.Commenting.draw("", "valselob@gmail.com", "", ""));
  },
  draw: function(commentID, userID, when, text){
    var $ret=$("<div class='comment'></<div>");
    var $header=$("<div class='header'></div>").appendTo($ret);
    if(userID==Screenful.Commenting.userID && commentID){
      var $deleteButton=$("<button class='iconOnly butDelete' title='"+Screenful.Loc["delete"]+"'>&nbsp;</button>").appendTo($header);
      var $editButton=$("<button class='iconOnly butEdit' title='"+Screenful.Loc["edit"]+"'>&nbsp;</button>").appendTo($header);
    }
    var $userID=$("<div class='userID'></div>").html(userID).appendTo($header);
    var $when=$("<div class='when'></div>").html(when).appendTo($header); if(!commentID) $when.html(Screenful.Loc["newComment"]);
    if(commentID) var $text=$("<div class='text'></div>").html(text).appendTo($ret);
    if(userID==Screenful.Commenting.userID){
      var $form=$("<form onsubmit='return false'></form>").val(text).appendTo($ret); if(commentID) $form.hide();
      var $textarea=$("<textarea></textarea>").val(text).appendTo($form);
      var $editButton=$("<button class='iconYes butSave'>"+Screenful.Loc["save"]+"</button>").appendTo($form);
      $ret.find(".butEdit").on("click", function(event){
        var $button=$(event.delegateTarget);
        if($button.hasClass("pressed")){
          $button.removeClass("pressed");
          $ret.find("form").hide();
          $ret.find("div.text").show();
        } else {
          $button.addClass("pressed");
          $ret.find("div.text").hide();
          $ret.find("form").show().find("textarea").focus();
        }
      });
    }
    $ret.find(".butsave").on("click", function(event){
      return false;
    });
    return $ret;
  },

};
