Screenful.Commenting={
  currentEntryID: null,
  peek: function(){
    if(Screenful.Commenting.peekUrl){
      if(Screenful.Commenting.saveUrl) $("#butCommenting").removeClass("hasData"); else $("#butCommenting").hide();
      var entryID=Screenful.Editor.entryID;
      $.ajax({url: Screenful.Commenting.peekUrl, dataType: "json", method: "POST", data: {entryID: entryID}}).done(function(data){
        if(data.success) {
          if(entryID==Screenful.Editor.entryID){
            if(data.numComments>0){
              if(Screenful.Commenting.saveUrl) $("#butCommenting").addClass("hasData").find(".bubble").html(data.numComments); else $("#butCommenting").show();
            }
          }
        }
      });
    }
  },
  go: function(){
    var entryID=Screenful.Editor.entryID;
    if(entryID && entryID!=Screenful.Commenting.currentEntryID){
      Screenful.Commenting.currentEntryID=entryID;
      $("#commenting").html("");
      Screenful.Commenting.list();
    }
  },
  list: function(){
    var entryID=Screenful.Commenting.currentEntryID;
    $.ajax({url: Screenful.Commenting.listUrl, dataType: "json", method: "POST", data: {entryID: entryID}}).done(function(data){
      if(!data.success) {
        Screenful.status(Screenful.Loc.listingFailed, "warn"); //"listing to save"
      } else {
        if(entryID==Screenful.Commenting.currentEntryID){
          data.comments.map(comment => {
            $("#commenting").append(Screenful.Commenting.draw(comment.commentID, comment.userID, comment.when, comment.body, comment.bodyMarkdown, comment.extranetID, comment.tagID));
          });
          if(Screenful.Commenting.saveUrl) $("#commenting").append(Screenful.Commenting.draw("", Screenful.Commenting.userID, "", "", ""));
        }
      }
    });
  },

  draw: function(commentID, userID, when, text, textMarkdown, extranetID, tagID){
    var $ret=$("<div class='comment'></<div>");
    var $header=$("<div class='header'></div>").appendTo($ret);
    if(commentID && userID==Screenful.Commenting.userID){
      if(Screenful.Commenting.deleteUrl) var $deleteButton=$("<button class='iconOnly butDelete' title='"+Screenful.Loc["delete"]+"'>&nbsp;</button>").appendTo($header);
      if(Screenful.Commenting.saveUrl) var $editButton=$("<button class='iconOnly butEdit' title='"+Screenful.Loc["edit"]+"'>&nbsp;</button>").appendTo($header);
    }
    var $userID=$("<div class='userID'></div>").html(userID).appendTo($header);
    var $when=$("<div class='when'></div>").html(when).appendTo($header); if(!commentID) $when.html(Screenful.Loc["newComment"]);
    if(commentID) var $text=$("<div class='text'></div>").html(textMarkdown).appendTo($ret);
    if(tagID && Screenful.Commenting.tags){
      var tag=null; Screenful.Commenting.tags.map(obj => {if(obj.id==tagID) tag=obj;})
      if(tag){
        var $tag=$("<div class='tag'></div>").prependTo($text);
        if(!text) $tag.addClass("notext");
        $tag.html(tag.title);
      }
    }
    if(extranetID && Screenful.Commenting.getExtranetTitle){
      var $xnet=$("<div class='xnet'><span class='label'></span> <span class='title'></span></div>").prependTo($text);
      $xnet.find(".label").html(Screenful.Loc.extranet);
      $xnet.find(".title").html(Screenful.Commenting.getExtranetTitle(extranetID));
    }
    if(userID==Screenful.Commenting.userID){
      var $form=$("<form onsubmit='return false'></form>").val(text).appendTo($ret); if(commentID) $form.hide();
      var $input=$("<input type='hidden' name='commentID'>").val(commentID).appendTo($form);
      if(Screenful.Commenting.allowTags && Screenful.Commenting.tags){
        var $select=$("<select class='tagID' name='tagID'></select>").appendTo($form);
        $("<option value=''></option>").appendTo($select);
        Screenful.Commenting.tags.map(tag => { $("<option></option>").attr("value", tag.id).html(tag.title).appendTo($select); });
        if(tagID) $select.val(tagID);
      }
      var $textarea=$("<textarea rows='1'></textarea>").appendTo($form);
      autosize($textarea);
      var $markdownLink=$("<a class='markdownLink' target='_blank' href='https://www.markdownguide.org/cheat-sheet/'>Markdown</a>").appendTo($form);
      var $editButton=$("<button class='iconYes butSave'>"+Screenful.Loc["save"]+"</button>").appendTo($form);
      $ret.find(".butDelete").on("click", function(event){
        var $button=$(event.delegateTarget);
        var $comment=$button.closest(".comment");
        var commentID=$comment.find("input[name='commentID']").val();
        if(confirm(Screenful.Loc.deleteConfirm)){ //"are you sure?"
          Screenful.status(Screenful.Loc.deleting, "wait"); //"deleting..."
          $.ajax({url: Screenful.Commenting.deleteUrl, dataType: "json", method: "POST", data: {commentID: commentID}}).done(function(data){
            if(!data.success) {
              Screenful.status(Screenful.Loc.deletingFailed, "warn"); //"failed to delete"
            } else {
              Screenful.status(Screenful.Loc.ready);
              $comment.fadeOut(function(){ $comment.remove(); });
              Screenful.Commenting.peek();
            }
        	});
        }
      });
      $ret.find(".butEdit").on("click", function(event){
        var $button=$(event.delegateTarget);
        if($button.hasClass("pressed")){
          $button.removeClass("pressed");
          $ret.find("div.text").show();
          $ret.find("form").hide().find("textarea").val("");
          autosize.update($ret.find("form textarea"));
        } else {
          $button.addClass("pressed");
          $ret.find("div.text").hide();
          $ret.find("form").show().find("textarea").val(text).trigger("keyup").focus();
          autosize.update($ret.find("form textarea"));
        }
      });
    }
    $ret.find(".butSave").on("click", function(event){
      var $button=$(event.delegateTarget);
      var $form=$button.closest("form");
      var commentID=$form.find("input[name='commentID']").val();
      var entryID=Screenful.Commenting.currentEntryID;
      var body=$.trim($form.find("textarea").val());
      var tagID=$form.find("select[name='tagID']").val();
      if(body || tagID){
        $.ajax({url: Screenful.Commenting.saveUrl, dataType: "json", method: "POST", data: {commentID: commentID, entryID: entryID, userID: Screenful.Commenting.userID, body: body, tagID: tagID}}).done(function(data){
          if(!data.success) {
            Screenful.status(Screenful.Loc.savingFailed, "warn"); //"failed to save"
          } else {
            if(entryID==Screenful.Commenting.currentEntryID){
              var $comment=Screenful.Commenting.draw(data.commentID, Screenful.Commenting.userID, data.when, data.body, data.bodyMarkdown, data.extranetID, data.tagID).hide();
              if(commentID) $form.closest(".comment").replaceWith($comment); else $comment.insertBefore($form.closest(".comment"));
              $comment.fadeIn();
              $form.find("textarea").val("");
              if(!commentID) $form.find("select[name='tagID']").val("");
              Screenful.Commenting.peek();
            }
          }
        });
      }
      return false;
    });
    return $ret;
  },
};
