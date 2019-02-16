Screenful.Navigator={
  start: function(){
    Screenful.createEnvelope();
    $("#envelope").html("<div id='midcontainer'></div><div id='leftcontainer'><span class='closer'>×</span><div id='leftbox'></div></div>");

    if(Screenful.Navigator.enableLeftPanel){
      $("#envelope").addClass("leftContainerCollapsed");
      $("#leftcontainer").on("click", function(e){
        if($("#envelope").hasClass("leftContainerCollapsed")) {
          $("#envelope").removeClass("leftContainerCollapsed").addClass("leftContainerExpanded");
          if(Screenful.Facetor) Screenful.Facetor.show();
        }
      });
      $("#leftcontainer > .closer").on("click", function(e){
        $("#envelope").removeClass("leftContainerExpanded").addClass("leftContainerCollapsed");
        var needReload=false;
        if(Screenful.Facetor) {
          if(Screenful.Facetor.report()) needReload=true;
          Screenful.Facetor.hide();
        }
        e.stopPropagation();
        if(needReload) Screenful.Navigator.list(e);
      });
    }

    $("#midcontainer").html("<div id='navbox'></div><div id='listbox' class='listbox'></div><div id='starlist' style='display: none'></div><div id='editbox'></div><div id='critbox' tabindex='0' style='display: none'></div>");
    $("#starlist").html("<div class='inside'><div class='listbox'></div><div class='title'><span class='title'>"+Screenful.Loc.worklist+"</span></div></div><div class='callout'></div>");
    $("#envelope").on("click", function(e){
      var $clicked=$(e.target);
      if($clicked.closest("#starbox").length==0 && $clicked.closest("#starlist .inside").length==0) $("#starlist").hide();
    });
    $("#starlist > .inside > .title").append("<div class='menuContainer'><span class='clickable'>"+Screenful.Loc.action+" <span class='arrow'>▼</span></span><div class='menu' style='display: none'></div></div>");
    $("#starlist > .inside > .title > .menuContainer > .clickable").on("click", function(e){
      var $mymenu=$(e.delegateTarget).closest(".menuContainer").find(".menu");
      $(".menu:visible").not($mymenu).slideUp();
      $mymenu.hide().slideDown();
      e.stopPropagation();
    });

    $("#editbox").html("<iframe name='editframe' frameborder='0' scrolling='no' src='"+Screenful.Navigator.editorUrl+"'/>");
    $("#navbox").html("<div class='line1'><button class='iconOnly' id='butCritOpen'>&nbsp;</button><div class='modifiers boxModifiers' style='display: none'><span class='clickable'><span class='current'></span> <span class='arrow'>▼</span></span><div class='menu' style='display: none'></div></div><input id='searchbox' title='Ctrl + Shift + T'/><button id='butSearch' class='iconOnly mergeLeft noborder'>&nbsp;</buttton><button class='iconOnly noborder' id='butCritRemove' style='display: none;'></button></div>");
    $("#navbox").append("<div class='modifiers lineModifiers lineModifiersRight' style='display: none'><span class='clickable'><span class='current'></span> <span class='arrow'>▼</span></span><div class='menu' style='display: none'></div></div>");
    $("#navbox").append("<div class='modifiers lineModifiers lineModifiersLeft' style='display: none'><span class='clickable'><span class='current'></span> <span class='arrow'>▼</span></span><div class='menu' style='display: none'></div></div>");
    $("#searchbox").on("keydown", function(e){if(!e.altKey && !((e.ctrlKey || e.metaKey) && e.shiftKey)) e.stopPropagation()});
    $("#searchbox").on("keyup", function(event){
      if(event.which==27) $("#searchbox").val("");
      if(event.which==13) Screenful.Navigator.critGo(event);
    });
    $("#butSearch").on("click", Screenful.Navigator.critGo);
    $("#navbox").append("<div class='line2'><span id='starbox' style='display: none'></span><div class='menuContainer'><span id='countContainer'><span id='countcaption'>0</span><span class='arrow'>▼</span></span><div class='menu' style='display: none'></div></div><button class='iconYes noborder' id='butReload'>"+Screenful.Loc.reload+"</button></div>");
    if(Screenful.Navigator.actions && Screenful.Navigator.actions.length>0){
      Screenful.Navigator.populateActionMenu();
      $("#countContainer").addClass("clickable").on("click", function(e){
        var $mymenu=$(e.delegateTarget).closest(".menuContainer").find(".menu");
        $(".menu:visible").not($mymenu).slideUp();
        $mymenu.hide().slideDown();
        e.stopPropagation();
      });
    }
    $("#starbox").on("click", Screenful.Navigator.clickStarbox);
    if(!(Screenful.Navigator.critEditor && Screenful.Navigator.critHarvester)) $("#butCritOpen").remove();
    $("#butCritOpen").on("click", Screenful.Navigator.critOpen);
    $("#butReload").on("click", Screenful.Navigator.reload);
    $("#critbox").html("<div id='editor'></div><div class='buttons'><button class='iconYes' id='butCritCancel'>"+Screenful.Loc.cancel+"</button><button class='iconYes' id='butCritGo'>"+Screenful.Loc.find+"</button></div>");
    $("#butCritCancel").on("click", Screenful.Navigator.critCancel);
    $("#butCritGo").on("click", Screenful.Navigator.critGo);
    $("#butCritRemove").on("click", Screenful.Navigator.critRemove);
    if(Screenful.Navigator.modifiers && Screenful.Navigator.modifiers.length>0){
      for(var i=0; i<Screenful.Navigator.modifiers.length; i++){
        var obj=Screenful.Navigator.modifiers[i];
        var txt=obj.caption; if(obj.abbr) txt="<span class='abbr'>"+obj.abbr+"</span><span class='caption'>"+txt+"</span>";
        var $a=$("<a href='javascript:void(null)' >"+txt+"</a>");
        $a.data("value", obj.value);
        $a.on("click", function(e){
          var $a=$(e.delegateTarget);
          var $current=$a.closest(".modifiers").find(".current");
          $current.html($a.html());
          $current.data("value", $a.data("value"));
        });
        if(!obj.position) obj.position="left";

        if(obj.position=="box"){
          $("#searchbox").addClass("hasSearchModifiers");
          $("#navbox .boxModifiers").show();
          $("#navbox .boxModifiers .menu").append($a);
          $a.on("click", function(e){
            if($.trim($("#searchbox").val())!="") Screenful.Navigator.list();
          });
          if($("#navbox .boxModifiers .clickable .current").html()==""){
            $("#navbox .boxModifiers .clickable .current").html(txt);
            $("#navbox .boxModifiers .clickable .current").data("value", obj.value);
          }
        }
        if(obj.position=="left"){
          $("#navbox").addClass("hasSearchModifiers");
          $("#listbox").addClass("hasSearchModifiers");
          $("#starlist").addClass("hasSearchModifiers");
          $("#navbox .lineModifiersLeft").show();
          $("#navbox .lineModifiersLeft .menu").append($a);
          $a.on("click", function(e){
            if($.trim($("#searchbox").val())!="") Screenful.Navigator.list();
          });
          if($("#navbox .lineModifiersLeft .clickable .current").html()==""){
            $("#navbox .lineModifiersLeft .clickable .current").html(txt);
            $("#navbox .lineModifiersLeft .clickable .current").data("value", obj.value);
          }
        }
        else if(obj.position=="right"){
          $("#navbox").addClass("hasSearchModifiers");
          $("#listbox").addClass("hasSearchModifiers");
          $("#starlist").addClass("hasSearchModifiers");
          $("#navbox .lineModifiersRight").show();
          $("#navbox .lineModifiersRight .menu").append($a);
          $a.on("click", function(e){
            Screenful.Navigator.list();
          });
          if($("#navbox .lineModifiersRight .clickable .current").html()==""){
            $("#navbox .lineModifiersRight .clickable .current").html(txt);
            $("#navbox .lineModifiersRight .clickable .current").data("value", obj.value);
          }
        }

      }
      $("#navbox .modifiers .clickable").on("click", function(e){
        $("#starlist").hide();
        var $mymenu=$(e.delegateTarget).closest(".modifiers").find(".menu");
        $(".menu:visible").not($mymenu).slideUp();
        $mymenu.hide().slideDown();
        e.stopPropagation();
      });
    }
    $(document).on("click", function(e){
      $(".menu:visible").not("#xonomyBubble .menu").slideUp();
    });
    if(Screenful.Navigator.critEditor && Screenful.Navigator.critHarvester) {
      $("#navbox .lineModifiers").addClass("hasCrits");
      Screenful.Navigator.critEditor(document.getElementById("editor"));
      Screenful.Navigator.critTemplate=Screenful.Navigator.critHarvester(document.getElementById("editor"));
    }
    window.setTimeout(Screenful.Navigator.list, 1000);
    $(document).on("click", function(){
      if(window.frames["editframe"] && window.frames["editframe"].Xonomy) window.frames["editframe"].Xonomy.clickoff();
    });

    //keyboard nav:
    $(document).on("keydown", function(e){
      if( $("#critbox:visible").length>0 ) return;
      if(e.which==37 && e.altKey){ //arrow down key
        e.preventDefault();
        Screenful.Navigator.focusEntryList();
      }
      if(e.which==39 && e.altKey){ //arrow right key
        if(window.frames["editframe"].Screenful) {
          e.preventDefault();
          window.frames["editframe"].focus();
        }
      }
      //console.log(e.which, e.ctrlKey, e.metaKey, e.altKey, e.altGraphKey, e.shiftKey);
      if(e.which==84 && (e.ctrlKey||e.metaKey) && e.shiftKey){ //T key
        e.preventDefault();
        e.stopImmediatePropagation();
        $("#searchbox").focus();
      }
      if(e.which==69 && (e.ctrlKey||e.metaKey) && e.shiftKey){ //E key
        if(window.frames["editframe"].Screenful){
          e.preventDefault();
          e.stopImmediatePropagation();
          window.frames["editframe"].$("#butEdit:visible").click();
          window.frames["editframe"].$("#butView:visible").click();
          window.frames["editframe"].focus();
        }
      }
      if(e.which==83 && (e.ctrlKey||e.metaKey) && e.shiftKey){ //S key
        if(window.frames["editframe"].Screenful){
          e.preventDefault();
          e.stopImmediatePropagation();
          window.frames["editframe"].$("#butSave:visible").click();
          window.frames["editframe"].focus();
        }
      }
      if(e.which==78 && (e.ctrlKey||e.metaKey) && e.shiftKey){ //N key
        if(window.frames["editframe"].Screenful){
          e.preventDefault();
          e.stopImmediatePropagation();
          window.frames["editframe"].$("#butNew:visible").click();
          window.frames["editframe"].focus();
        }
      }
    });
  },

  lastFocusedEntryID: "",
  focusEntryList: function(){
    if(Screenful.Navigator.lastFocusedEntryID && $("#listbox .entry[data-id=\""+Screenful.Navigator.lastFocusedEntryID+"\"]").length>0)
      $("#listbox .entry[data-id=\""+Screenful.Navigator.lastFocusedEntryID+"\"]").focus();
    else
      $("#listbox .entry").first().focus();
  },

  harvestListParams: function(){
    var ret={};
    ret.facets=null; if(Screenful.Facetor && $("#envelope").hasClass("leftContainerExpanded")) ret.facets=Screenful.Facetor.report();
    ret.criteria=null; if(Screenful.Navigator.critHarvester) ret.criteria=Screenful.Navigator.critHarvester(document.getElementById("editor"));
    ret.searchtext=$.trim($("#searchbox").val());
    var modifiers=[];
      modifiers.push($.trim($("#navbox .boxModifiers .current").data("value")));
      modifiers.push($.trim($("#navbox .lineModifiersLeft .current").data("value")));
      modifiers.push($.trim($("#navbox .lineModifiersRight .current").data("value")));
    ret.modifier=""; modifiers.map(s => {if(s){ if(ret.modifier!="") ret.modifier+=" "; ret.modifier+=s; }});
    return ret;
  },
  list: function(event, howmany, noSFX){
    if(!howmany) howmany=Screenful.Navigator.stepSize;
    Screenful.Navigator.lastStepSize=howmany;
    Screenful.status(Screenful.Loc.listing, "wait"); //"getting list of entries"
    var url=Screenful.Navigator.listUrl;
    var listParams=Screenful.Navigator.harvestListParams();
    var facets=listParams.facets;
    var criteria=listParams.criteria;
    var searchtext=listParams.searchtext;
    var modifier=listParams.modifier;
    if(criteria!=Screenful.Navigator.critTemplate) {
      $("#butCritOpen").addClass("on");
      $("#butCritRemove").show();
    } else {
      $("#butCritOpen").removeClass("on");
      $("#butCritRemove").hide();
    }
    if(searchtext!="") $("#butCritRemove").show();
    $.ajax({url: url, dataType: "json", method: "POST", data: {facets: facets, criteria: criteria, searchtext: searchtext, modifier: modifier, howmany: howmany}}).done(function(data){
      if(!data.success) {
        Screenful.status(Screenful.Loc.listingFailed, "warn"); //"failed to get list of entries"
      } else {
        $("#countcaption").html(data.total);
        var $listbox=$("#listbox").hide().html("");
        if(data.suggestions && data.suggestions.length>0){
          var $suggs=$("<div class='suggs'></div>").appendTo($listbox);
          data.suggestions.map(sugg => {
            var $sugg=$("<span class='sugg'></span>").html(sugg);
            $suggs.append($sugg).append(" ");
            $sugg.on("click", function(e){
              $("#searchbox").val(sugg);
              Screenful.Navigator.list();
            });
          });
        }
        if(data.primeEntries && data.primeEntries.length>0 && data.entries.length>0){
          $listbox.append("<div class='intertitle'>"+Screenful.Loc.exactMatches+"</div>");
        }
        if(data.primeEntries) data.primeEntries.forEach(function(entry){ Screenful.Navigator.printEntry(entry, $listbox, searchtext, modifier); });
        if(data.primeEntries && data.primeEntries.length>0 && data.entries.length>0){
          $listbox.append("<div class='intertitle'>"+Screenful.Loc.partialMatches+"</div>");
        }
        if(data.entries) data.entries.forEach(function(entry){ Screenful.Navigator.printEntry(entry, $listbox, searchtext, modifier); });
        if(!noSFX) $listbox.fadeIn(); else $listbox.show();
        if(data.entries.length+(data.primeEntries?data.primeEntries.length:0)<data.total){
          $listbox.append("<div id='divMore'><button class='iconYes' id='butMore'>"+Screenful.Loc.more+"</button></div>");
          $("#butMore").on("click", Screenful.Navigator.more);
        }
        if(window.frames["editframe"] && window.frames["editframe"].Screenful && window.frames["editframe"].Screenful.Editor) {
          var currentEntryID=window.frames["editframe"].Screenful.Editor.entryID;
          Screenful.Navigator.setEntryAsCurrent(currentEntryID);
        }
        Screenful.status(Screenful.Loc.ready);
        Screenful.Navigator.focusEntryList();

        //keyboard nav:
        $("#listbox .entry").on("keydown", function(e){
          if(e.which==40){ //arrow down key
            e.preventDefault();
            if(e.ctrlKey||e.metaKey) $("#listbox").scrollTop($("#listbox").scrollTop()+60);
            else {
              $(e.delegateTarget).nextAll(".entry").first().focus();
              Screenful.Navigator.lastFocusedEntryID=$("#listbox .entry:focus").attr("data-id");
            }
          }
          if(e.which==38){ //arrow up key
            e.preventDefault();
            if(e.ctrlKey||e.metaKey) $("#listbox").scrollTop($("#listbox").scrollTop()-60);
            else {
              $(e.delegateTarget).prevAll(".entry").first().focus();
              Screenful.Navigator.lastFocusedEntryID=$("#listbox .entry:focus").attr("data-id");
            }
          }
          if(e.which==13){ //Enter key
            e.preventDefault(); $(e.delegateTarget).click();
          }
          if(e.which==46){ //Delete key
            e.preventDefault();
            Screenful.Navigator.entryDelete(e);
          }
          if(e.which==76 && (e.ctrlKey||e.metaKey) && e.shiftKey){ //L key
            e.preventDefault();
            Screenful.Navigator.entryStar(e);
          }
          if(Screenful.Navigator.flags && Screenful.Navigator.flags.length>0 && Screenful.Navigator.entryFlagUrl){
            for(var i=0; i<Screenful.Navigator.flags.length; i++) {
              if(e.key==Screenful.Navigator.flags[i].key){
                e.preventDefault();
                Screenful.Navigator.entryFlag(e, Screenful.Navigator.flags[i].name)
              }
            }
          }
        });
        $("#listbox .entry").on("click", function(e){
          Screenful.Navigator.lastFocusedEntryID=$(e.delegateTarget).attr("data-id");
        });
      }
    });
  },
  printEntry: function(entry, $listbox, searchtext, modifier){
    var $item=$("<div class='entry' tabindex='0' data-id='"+entry.id+"'><div class='inside'>"+entry.id+"</div><div class='clear'></div></div>").appendTo($listbox);
    $item.on("click", entry, Screenful.Navigator.openEntry);

    //entry title:
    Screenful.Navigator.renderer($item.find("div.inside").toArray()[0], entry, searchtext, modifier);

    //entry flag:
    if(Screenful.Navigator.flags && Screenful.Navigator.flags.length>0 && Screenful.Navigator.entryFlagUrl && Screenful.Navigator.extractEntryFlag){
      var $flagLink=$("<a class='entryFlagLink undecided'></a>").prependTo($item);
      window.setTimeout(function(){
        var flag=Screenful.Navigator.flagLookup( Screenful.Navigator.extractEntryFlag(entry) );
        $flagLink.removeClass("undecided");
        $flagLink.css("background-color", flag.color);
        $flagLink.on("click", Screenful.Navigator.entryFlagLinkClick);
        var $menu=$("<div class='menu flagmenu' style='display: none'></div>").appendTo($item);
        Screenful.Navigator.flags.map(flag => {
          var $menuItem=$("<a href='javascript:void(null)'><span class='spot' style='background-color: "+flag.color+"'></span><span class='keyCaption'>"+flag.key+"</span>"+flag.label+"</a>").appendTo($menu);
          $menuItem.on("click", Screenful.Navigator.entryFlag);
          $menuItem.data("flag", flag);
        });
      }, 10);
    }

    //star icon:
    if(Screenful.Navigator.listByIdUrl){
      var $menuLink=$("<a class='entryMenuLink star' title='"+Screenful.Loc.addToWorklist+" [Ctrl + Shift + L]'></a>").prependTo($item);
      if(Screenful.Navigator.starList.indexOf(entry.id)>-1) $menuLink.addClass("on"); else $menuLink.addClass("off");
      $menuLink.on("click", Screenful.Navigator.entryStar);
    }

    //delete icon:
    if(Screenful.Navigator.entryDeleteUrl){
      var $menuLink=$("<a class='entryMenuLink delete' title='"+Screenful.Loc.delete+" [Del]'></a>").prependTo($item);
      $menuLink.on("click", Screenful.Navigator.entryDelete);
    }
  },
  lastStepSize: 0,
  more: function(event){
    $("#listbox .entry").last().focus();
    Screenful.Navigator.lastFocusedEntryID=$("#listbox .entry:focus").attr("data-id");
    Screenful.Navigator.list(event, Screenful.Navigator.lastStepSize+Screenful.Navigator.stepSize);
  },
  openEntry: function(event){
    var entry=event.data;
    if(window.frames["editframe"].Screenful) {
      window.frames["editframe"].Screenful.Editor.open(null, entry.id);
    }
  },
  setEntryAsCurrent: function(id){
    $(".listbox .entry").removeClass("current")
    $("div.entry[data-id=\""+id+"\"]").addClass("current");
  },
  resetEntryAsCurrent: function(){
    var id=$(".listbox .entry.current").attr("data-id");
    $(".listbox .entry").removeClass("current")
    $("div.entry[data-id=\""+id+"\"]").addClass("current");
  },

  previousCrit: null,
  critOpen: function(event){
    Screenful.Navigator.previousCrit=Screenful.Navigator.critHarvester(document.getElementById("editor")); //save previous criteria for later, in case the user cancels
    $("#curtain").show().one("click", Screenful.Navigator.critCancel);
    $("#critbox").show().focus();
    $("#critbox").find(".focusme").first().focus();
  },
  critCancel: function(event){
    $("#critbox").hide();
    $("#curtain").hide();
    Screenful.Navigator.critEditor(document.getElementById("editor"), Screenful.Navigator.previousCrit); //restore previous criteria
  },
  critGo: function(event){
    $("#critbox").hide();
    $("#curtain").hide();
    $("#listbox").scrollTop(0);
    Screenful.Navigator.list();
  },
  critRemove: function(event){
    if(Screenful.Navigator.critEditor) Screenful.Navigator.critEditor(document.getElementById("editor"));
    $("#searchbox").val("");
    $("#listbox").scrollTop(0);
    Screenful.Navigator.list();
  },
  reload: function(event){
    $("#listbox").scrollTop(0);
    Screenful.Navigator.list();
  },

  refresh: function(entryID, action){
    if(entryID && action=="delete"){
      var $entry=$("div.entry[data-id=\""+entryID+"\"]");
      $entry.remove();
    } else if(entryID && action=="update" && Screenful.Navigator.listByIdUrl){
      $.ajax({url: Screenful.Navigator.listByIdUrl, dataType: "json", method: "POST", data: {ids: [entryID]}}).done(function(data){
        if(data.success && data.entries.length>0 && data.entries[0].id==entryID) {
          var entry=data.entries[0];
          $("div.entry[data-id=\""+entryID+"\"]").each(function(){
            var $entry=$(this);
            Screenful.Navigator.renderer($entry.find("div.inside").toArray()[0], entry, "", "");
            if(Screenful.Navigator.flags && Screenful.Navigator.flags.length>0 && Screenful.Navigator.entryFlagUrl && Screenful.Navigator.extractEntryFlag){
              var flag=Screenful.Navigator.flagLookup( Screenful.Navigator.extractEntryFlag(entry) );
              $entry.find(".entryFlagLink").css("background-color", flag.color);
            }
          });
        } else {
          Screenful.status(Screenful.Loc.listingFailed, "warn"); //"failed to get list of entries"
        }
      });
    } else {
      Screenful.Navigator.list(null, Screenful.Navigator.lastStepSize, true);
    }
  },

  entryMenuLinkClick: function(e){
    e.stopPropagation();
    var $menuLink=$(e.delegateTarget);
    var $entry=$menuLink.closest(".entry");
    var entryID=$entry.attr("data-id");
    var $menu=$entry.find(".entrymenu");
    $("#listbox .menu:visible").not($menu).hide();
    $(".menu:visible").not($menu).slideUp();
    $menu.hide().slideDown();
    e.stopPropagation();
  },
  entryDelete: function(arg){ //arg = event object or entryID
    var entryID=arg; if(typeof(arg)=="object") {
      entryID=$(arg.delegateTarget).closest(".entry").attr("data-id");
      $(".menu:visible").hide();
      arg.stopPropagation();
    }
    if(window.frames["editframe"].Screenful && window.frames["editframe"].Screenful.Editor && window.frames["editframe"].Screenful.Editor.entryID==entryID) {
      window.frames["editframe"].Screenful.Editor.delete();
    } else {
      if(confirm(Screenful.Loc.deleteConfirm)){ //"are you sure?"
        Screenful.status(Screenful.Loc.deleting, "wait"); //"deleting entry..."
        $.ajax({url: Screenful.Navigator.entryDeleteUrl, dataType: "json", method: "POST", data: {id: entryID}}).done(function(data){
          if(!data.success) {
            Screenful.status(Screenful.Loc.deletingFailed, "warn"); //"failed to delete entry"
          } else {
            Screenful.status(Screenful.Loc.ready);
            var $entry=$("div.entry[data-id=\""+entryID+"\"]");
            if($entry.length>0){
              var $next=$entry.next(".entry"); if($next.length==0) $next=$entry.prev(".entry"); Screenful.Navigator.lastFocusedEntryID=$next.attr("data-id");
              Screenful.Navigator.refresh();
              if($("#starlist:visible").length>0) Screenful.Navigator.refreshStarlist();
            }
          }
      	});
      }
    }
  },

  entryFlagLinkClick: function(e){
    e.stopPropagation();
    var $menuLink=$(e.delegateTarget);
    var $entry=$menuLink.closest(".entry");
    var entryID=$entry.attr("data-id");
    var $menu=$entry.find(".flagmenu");
    $("#listbox .menu:visible").not($menu).hide();
    $(".menu:visible").not($menu).slideUp();
    $menu.hide().slideDown();
    e.stopPropagation();
  },
  flagLookup: function(flagName){
    var ret=null;
    Screenful.Navigator.flags.map(flag => { if(flag.name==flagName) ret=flag; });
    return ret;
  },
  entryFlag: function(e, flagName){
    if(flagName===undefined) flagName=$(e.delegateTarget).data("flag").name;
    var flag=Screenful.Navigator.flagLookup(flagName);
    var entryID=$(e.delegateTarget).closest(".entry").attr("data-id");
    $(".menu:visible").hide();
    e.stopPropagation();
    Screenful.status(Screenful.Loc.flagging, "wait"); //"flagging entry..."
    $.ajax({url: Screenful.Navigator.entryFlagUrl, dataType: "json", method: "POST", data: {id: entryID, flag: flag.name}}).done(function(data){
      if(!data.success) {
        Screenful.status(Screenful.Loc.flaggingFailed, "warn"); //"failed to flag entry"
      } else {
        Screenful.status(Screenful.Loc.ready);
        var $entry=$("div.entry[data-id=\""+entryID+"\"]");
        if($entry.length>0){
          $entry.find(".entryFlagLink").css("background-color", flag.color)
          //if the entry is currently open in the editor, abandon it and reload it there:
          if(window.frames["editframe"].Screenful && window.frames["editframe"].Screenful.Editor && window.frames["editframe"].Screenful.Editor.entryID==entryID) {
            window.frames["editframe"].Screenful.Editor.needsSaving=false;
            window.frames["editframe"].Screenful.Editor.open(e, entryID);
          }
        }
      }
    });
  },

  starList: [],
  entryStar: function(arg){ //arg = event object or entryID
    var entryID=arg; if(typeof(arg)=="object") {
      entryID=parseInt($(arg.delegateTarget).closest(".entry").attr("data-id"));
      $(".menu:visible").hide();
      arg.stopPropagation();
    }
    var $entry=$("div.entry[data-id=\""+entryID+"\"]");
    if(Screenful.Navigator.starList.indexOf(entryID)>-1){
      //remove the entry from star list:
      Screenful.Navigator.starList.splice(Screenful.Navigator.starList.indexOf(entryID), 1);
      $entry.find(".star").removeClass("on").addClass("off");
      if(window.frames["editframe"].Screenful && window.frames["editframe"].Screenful.Editor && window.frames["editframe"].Screenful.Editor.entryID==entryID) {
        window.frames["editframe"].$("#butStar").removeClass("on").addClass("off");
      }
    } else {
      //add the entry to star list:
      Screenful.Navigator.starList.push(entryID);
      $entry.find(".star").removeClass("off").addClass("on");
      if(window.frames["editframe"].Screenful && window.frames["editframe"].Screenful.Editor && window.frames["editframe"].Screenful.Editor.entryID==entryID) {
        window.frames["editframe"].$("#butStar").removeClass("off").addClass("on");
      }
    }
    Screenful.Navigator.updateStarbox();
    if($("#starlist:visible").length>0) Screenful.Navigator.refreshStarlist();
  },
  updateStarbox: function(){
    var $starbox=$("#starbox");
    $starbox.html(Screenful.Navigator.starList.length);
    if(Screenful.Navigator.starList.length>0) $starbox.fadeIn(); else $starbox.fadeOut();
  },
  clickStarbox: function(e){
    Screenful.Navigator.showStarlist();
  },
  showStarlist: function(){
    $("#starlist .menu").hide();
    $("#starlist").hide().fadeIn("fast");
    Screenful.Navigator.refreshStarlist();
  },
  refreshStarlist: function(){
    var url=Screenful.Navigator.listByIdUrl;
    $.ajax({url: url, dataType: "json", method: "POST", data: {ids: Screenful.Navigator.starList}}).done(function(data){
      if(!data.success) {
        Screenful.status(Screenful.Loc.listingFailed, "warn"); //"failed to get list of entries"
      } else {
        var $listbox=$("#starlist .listbox").html("");
        data.entries.forEach(function(entry){
          Screenful.Navigator.printEntry(entry, $listbox, "", "");
        });
        Screenful.Navigator.resetEntryAsCurrent();
        Screenful.Navigator.starList=[];
        data.entries.forEach(function(entry){
          Screenful.Navigator.starList.push(entry.id);
        });
        Screenful.Navigator.updateStarbox();
        if(Screenful.Navigator.starList.length==0) $("#starlist").fadeOut();
        else {
          //populate starlist action menu:
          var $menu=$("#starlist > .inside > .title > .menuContainer > .menu").html("");
          var $a=$("<a href='javascript:void(null)' >"+Screenful.Loc.purgeWorklist+"</a>").appendTo($menu).on("click", function(e){
            $(".listbox .entry .star").removeClass("on").addClass("off");
            if(window.frames["editframe"].Screenful && window.frames["editframe"].Screenful.Editor) {
              window.frames["editframe"].$("#butStar").removeClass("on").addClass("off");
            }
            Screenful.Navigator.starList=[];
            Screenful.Navigator.refreshStarlist();
          });
          if(Screenful.Navigator.starlistActions) Screenful.Navigator.starlistActions.map(action => {
            var $a=$("<a href='javascript:void(null)' >"+action.caption+"</a>").appendTo($menu).on("click", function(e){
              $.ajax({url: action.url, dataType: "json", method: "POST", data: {ids: Screenful.Navigator.starList}}).done(function(data){

                //empty wyc cache:
                Screenful.wycCache={};
                if(window.frames["editframe"].Screenful) window.frames["editframe"].Screenful.wycCache={};

                //if one of the starred entries is currently open in the editor, abandon it and reload it there:
                if(window.frames["editframe"].Screenful && window.frames["editframe"].Screenful.Editor) {
                  Screenful.Navigator.starList.map(entryID => {
                    if(window.frames["editframe"].Screenful.Editor.entryID==entryID){
                      window.frames["editframe"].Screenful.Editor.needsSaving=false;
                      window.frames["editframe"].Screenful.Editor.open(null, entryID);
                    }
                  });
                }

                Screenful.Navigator.refreshStarlist();
                Screenful.Navigator.list(null, null, true);
              });
            });
          });
        }
      }
    });
  },
  addToStarlist: function(list){
    list.map(id => {
      if(Screenful.Navigator.starList.indexOf(id)==-1) Screenful.Navigator.starList.push(id);
    });
    //if one of the starred entries is currently open in the editor, star it there:
    if(window.frames["editframe"].Screenful && window.frames["editframe"].Screenful.Editor) {
      Screenful.Navigator.starList.map(entryID => {
        if(window.frames["editframe"].Screenful.Editor.entryID==entryID){
          window.frames["editframe"].$("#butStar").removeClass("off").addClass("on");
        }
      });
    }
    Screenful.Navigator.showStarlist();
  },

  populateActionMenu: function(){
    var $menu=$("#navbox .line2 .menuContainer .menu");
    Screenful.Navigator.actions.map(action => {
      var $a=$("<a href='javascript:void(null)' >"+action.caption+"</a>").appendTo($menu).on("click", function(e){
        Screenful.status(Screenful.Loc.doingBatch, "wait"); //"performing batch edit"
        var listParams=Screenful.Navigator.harvestListParams();
        $.ajax({url: action.url, dataType: "json", method: "POST", data: listParams}).done(function(data){
          if(!data.success) {
            Screenful.status(Screenful.Loc.batchFailed, "warn"); //"failed to perform batch edit"
          } else {
            Screenful.status(Screenful.Loc.ready);
            //abandon whatever is in the editor:
            if(window.frames["editframe"].Screenful && window.frames["editframe"].Screenful.Editor) {
              window.frames["editframe"].Screenful.Editor.needsSaving=false;
              window.frames["editframe"].Screenful.Editor.abandon();
            }
            Screenful.Navigator.list(null, null, true);
          }
        });
      });
    });
  },
};
$(window).ready(Screenful.Navigator.start);
