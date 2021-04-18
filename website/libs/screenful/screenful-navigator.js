Screenful.Navigator={
  regime: "stepped",
  stepSize: 10,
  start: function(){
    Screenful.createEnvelope();

    if(Screenful.Navigator.allowNarrow){
      $("#envelope").append("<div id='narrowToolbar'><span id='narrowTabList' class='tab current'>"+Screenful.Loc.narrowList+"</span><span id='narrowTabEditor' class='tab'>"+Screenful.Loc.narrowEditor+"</span></div>");
      $("#narrowTabList").on("click", function(e){
        $("#narrowTabList").addClass("current");
        $("#narrowTabEditor").removeClass("current");
        $("body").removeClass("editorShown");
      });
      $("#narrowTabEditor").on("click", function(e){
        $("#narrowTabList").removeClass("current");
        $("#narrowTabEditor").addClass("current");
        $("body").addClass("editorShown");
      });
      $("#statusbar").append("<label id='chkNarrow'><input type='checkbox'/> "+Screenful.Loc.narrow+"</label>");
      $("#statusbar label#chkNarrow input").on("change", function(e){
        var checked=$("#statusbar label#chkNarrow input").prop("checked");
        if(checked) $("body").addClass("narrow"); else $("body").removeClass("narrow");
      });
      if($(window).width()<800){
        $("#statusbar label#chkNarrow input").prop("checked", true).trigger("change");
      }
    }

    $("#envelope").append("<div id='printableToolbar'><button class='iconYes noborder' id='butPrintableOff'>"+Screenful.Loc.printableOff+"</button></div>");
    $("#butPrintableOff").on("click", Screenful.Navigator.printableOff);
    $("#envelope").append("<div id='midcontainer'></div><div id='leftcontainer'><span class='closer'>×</span><div id='leftbox'></div></div>");

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
        $("#leftcontainer").css("width", "");
        $("#midcontainer").css("left", "");
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

    $("#navbox").html("<div class='line1'><button class='iconOnly' id='butCritOpen'>&nbsp;</button><div class='modifiers boxModifiers' style='display: none'><span class='clickable'><span class='current'></span> <span class='arrow'>▼</span></span><div class='menu' style='display: none'></div></div><input id='searchbox' title='Ctrl + Shift + T'/><button id='butSearch' class='iconOnly mergeLeft noborder'>&nbsp;</buttton><button class='iconOnly noborder' id='butCritRemove' style='display: none;'></button><span id='suggs'></span></div>");
    $("#navbox").append("<div class='modifiers lineModifiers lineModifiersRight' style='display: none'><span class='clickable'><span class='current'></span> <span class='arrow'>▼</span></span><div class='menu' style='display: none'></div></div>");
    $("#navbox").append("<div class='modifiers lineModifiers lineModifiersLeft' style='display: none'><span class='clickable'><span class='current'></span> <span class='arrow'>▼</span></span><div class='menu' style='display: none'></div></div>");
    $("#searchbox").on("keydown", function(e){if(!e.altKey && !((e.ctrlKey || e.metaKey) && e.shiftKey)) e.stopPropagation()});
    $("#searchbox").on("keyup", function(event){
      if(event.which==27) $("#searchbox").val("");
      if(event.which==13) Screenful.Navigator.critGo(event);
    });
    $("#butSearch").on("click", Screenful.Navigator.critGo);
    if(Screenful.Navigator.hideSearchbox){
      $("#navbox").addClass("noSearchbox");
      $("#listbox").addClass("noSearchbox");
    }
    $("#navbox").append("<div class='line2'><span id='starbox' style='display: none'></span><div class='menuContainer'><span id='countContainer'><span id='countcaption'>0</span><span class='arrow'>▼</span></span><div class='menu' style='display: none'></div></div><button class='iconOnly noborder' id='butReload' title='"+Screenful.Loc.reload+"'>&nbsp;</button><button class='iconOnly noborder' id='butPrintable' title='"+Screenful.Loc.printable+"'>&nbsp;</button></div>");
    if(Screenful.Navigator.allowPrintable){
      $("#butPrintable").on("click", Screenful.Navigator.printableOn);
    } else {
      $("#butPrintable").hide();
    }
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

    Screenful.Navigator.makeResizable();
  },

  makeResizable: function(){
    var $resizerOverlay=$("<div id='resizerOverlay'></div>");
    $("body").append($resizerOverlay);
    $resizerOverlay.hide();

    //resizer on the left-hand side of the editor:
    var $resizer1=$("<div class='resizer'></div>");
    $("#editbox").append($resizer1);
    $resizer1.mousedown(function(){
      $resizerOverlay.show();
      $("body").css("user-select", "none");
      $resizer1.addClass("active");
      $(window).mousemove(function(e){
        var newWidth=e.pageX; if( $("html").attr("dir")=="rtl" ) newWidth=$(document).width()-e.pageX;
        if($("#envelope").hasClass("leftContainerExpanded")){
          newWidth=newWidth-($("#leftcontainer").width());
        }
        $("#navbox").css("width", newWidth);
        $("#listbox").css("width", newWidth);
        $("#starlist").css("width", newWidth);
        $("#editbox").css("inset-inline-start", newWidth);
      });
    });

    //resizer on the right-hand side of the faceted filter:
    var $resizer2=$("<div class='resizer'></div>");
    $("#midcontainer").append($resizer2);
    $resizer2.mousedown(function(){
      $resizerOverlay.show();
      $("body").css("-webkit-user-select", "none");
      $("body").css("-moz-user-select", "none");
      $("body").css("-ms-user-select", "none");
      $("body").css("user-select", "none");
      $resizer2.addClass("active");
      $(window).mousemove(function(e){
        var newWidth=e.pageX; if( $("html").attr("dir")=="rtl" ) newWidth=$(document).width()-e.pageX;
        $("#leftcontainer").css("width", newWidth);
        $("#midcontainer").css("inset-inline-start", newWidth);
      });
    });

    $(window).mouseup(function(){
      $(window).off("mousemove");
      $resizerOverlay.hide();
      $("body").css("-webkit-user-select", "");
      $("body").css("-moz-user-select", "");
      $("body").css("-ms-user-select", "");
      $(".resizer").removeClass("active");
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
  lastListFuncName: "list", //list | listHierarchy
  list: function(event, howmanyOrPage, noSFX){
    Screenful.Navigator.lastListFuncName="list";
    var howmany=howmanyOrPage || Screenful.Navigator.lastStepSize || Screenful.Navigator.stepSize;
    var page=howmanyOrPage || 1;
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
    if(searchtext=="") $("#suggs").html("");
    var data={facets: facets, criteria: criteria, searchtext: searchtext, modifier: modifier};
    if(Screenful.Navigator.regime=="stepped") data.howmany=howmany;
    else if(Screenful.Navigator.regime=="paged") {
      data.page=page;
      data.pageSize=Screenful.Navigator.pageSize;
    }
    $.ajax({url: url, dataType: "json", method: "POST", data: data}).done(function(data){
      if(!data.success) {
        Screenful.status(Screenful.Loc.listingFailed, "warn"); //"failed to get list of entries"
      } else {
        Screenful.Navigator.pageSize=data.pageSize;
        $("#countcaption").html(data.total);
        var $listbox=$("#listbox").hide().html("");

        var $suggs=$("#suggs").html("");
        if(data.suggestions && data.suggestions.length>0){
          //var $suggs=$("<div class='suggs'></div>").appendTo($listbox);
          data.suggestions.map(sugg => {
            var $sugg=$("<span class='sugg'></span>").html(sugg);
            $suggs.append($sugg).append(" ");
            $sugg.on("click", function(e){
              $("#searchbox").val(sugg);
              Screenful.Navigator.list();
            });
          });
        }

        if(Screenful.Navigator.regime=="paged"){
          Screenful.Navigator.printPager($listbox, data.page, data.pages);
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

        if(Screenful.Navigator.regime=="stepped"){
          if(data.entries.length+(data.primeEntries?data.primeEntries.length:0)<data.total){
            $listbox.append("<div id='divMore'><button class='iconYes' id='butMore'>"+Screenful.Loc.more+"</button></div>");
            $("#butMore").on("click", Screenful.Navigator.more);
          }
        } else if(Screenful.Navigator.regime=="paged"){
          Screenful.Navigator.printPager($listbox, data.page, data.pages);
          Screenful.Navigator.printPagerSizer($listbox, data.pageSize);
        }

        if(Screenful.Navigator.exporters && Screenful.Navigator.exporters.length>0){
          Screenful.Navigator.printExporters($listbox, Screenful.Navigator.exporters);
        }

        if(window.frames["editframe"] && window.frames["editframe"].Screenful && window.frames["editframe"].Screenful.Editor) {
          var currentEntryID=window.frames["editframe"].Screenful.Editor.entryID;
          Screenful.Navigator.setEntryAsCurrent(currentEntryID);
        }
        Screenful.status(Screenful.Loc.ready);
        Screenful.Navigator.focusEntryList();
        if(Screenful.Navigator.regime=="paged") $("#listbox").scrollTop(0);

        //keyboard nav:
        Screenful.Navigator.makeListKeyboardable();
      }
    });
  },
  lastListParentID: null,
  listHierarchy: function(parentID){
    Screenful.Navigator.lastListFuncName="listHierarchy";
    parentID=parentID || Screenful.Navigator.lastListParentID;
    Screenful.Navigator.lastListParentID=parentID;
    Screenful.status(Screenful.Loc.listing, "wait"); //"getting list of entries"
    var url=Screenful.Navigator.hierarchyUrl;
    var data={parentID: parentID};
    $.ajax({url: url, dataType: "json", method: "POST", data: data}).done(function(data){
      if(!data.success) {
        Screenful.status(Screenful.Loc.listingFailed, "warn"); //"failed to get list of entries"
      } else {
        $("#countcaption").html(data.total);
        var $listbox=$("#listbox").hide().html("");

        if(data.parentEntries) data.parentEntries.forEach(function(entry){ Screenful.Navigator.printEntry(entry, $listbox, "", "", true); });
        if(data.entries) data.entries.forEach(function(entry){ Screenful.Navigator.printEntry(entry, $listbox, "", "", false); });
        //if(!noSFX) $listbox.fadeIn(); else $listbox.show();
        $listbox.show();

        if(window.frames["editframe"] && window.frames["editframe"].Screenful && window.frames["editframe"].Screenful.Editor) {
          var currentEntryID=window.frames["editframe"].Screenful.Editor.entryID;
          Screenful.Navigator.setEntryAsCurrent(currentEntryID);
        }
        Screenful.status(Screenful.Loc.ready);
        Screenful.Navigator.focusEntryList();
        $("#listbox").scrollTop(0);

        //keyboard nav:
        Screenful.Navigator.makeListKeyboardable();
      }
    });
  },
  makeListKeyboardable: function(){
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
  },
  printEntry: function(entry, $listbox, searchtext, modifier, drillerExpanded){
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

    //entry indent level:
    if(Screenful.Navigator.hierarchyUrl){
      var level=entry.level || 0;
      $item.css("margin-left", ((level*30)+10)+"px");
    }

    //entry driller:
    if(Screenful.Navigator.hierarchyUrl){
      $item.addClass("hasDriller");
      if(entry.hasChildren){
        //this entry does have children, can be drilled down into:
        var $driller=$("<a class='entryDriller collapsed'><span class='collapsed'>►</span><span class='expanded'>▼</span></a>");
        if(drillerExpanded) $driller.removeClass("collapsed").addClass("expanded");
        $driller.prependTo($item).on("click", Screenful.Navigator.entryDrillerClick);
      } else {
        //this entry is childless, cannot be drilled down into:
        var $driller=$("<a class='entryDriller none'></a>").prependTo($item);
      }
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
      $("#narrowTabList").removeClass("current");
      $("#narrowTabEditor").addClass("current");
      $("body").addClass("editorShown");
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

  printPager: function($listbox, page, pages){
    if(pages>1){
      var $pager=$(`<div class="pager">
        <span class="arrow left" style="display: none">«</span>
        <span class="arrow right" style="display: none">»</span>
        <input class="page"/>/<span class="pages"></span>
        <span class="clear"></span>
      </div>`);
      if(page>1){
        $pager.find(".arrow.left").show().on("click", function(event){
          Screenful.Navigator.list(event, page-1, false);
        });
      }
      if(page<pages){
        $pager.find(".arrow.right").show().on("click", function(event){
          Screenful.Navigator.list(event, page+1, false);
        });
      }
      $pager.find("input.page").val(page).data("origVal", page).on("blur", function(e){
        var $input=$(e.delegateTarget);
        $input.val($input.data("origVal"));
      }).on("keypress", function(e){
        if(e.key=="Enter"){
          var $input=$(e.delegateTarget);
          var newVal=$input.val();
          if(isNaN(newVal)){
            $input.val($input.data("origVal"));
          } else {
            newVal=Math.floor(newVal);
            if(newVal<1) newVal=1;
            if(newVal>pages) newVal=pages;
            $input.val(newVal);
            Screenful.Navigator.list(e, newVal, false);
          }
        }
      });
      $pager.find(".pages").html(pages);
      $listbox.append($pager);
    }
  },
  printPagerSizer: function($listbox, pageSize){
    pageSize=pageSize||0;
    var $sizer=$(`<div class="pagerSizer">
      <input/>
      <span>${Screenful.Loc.perPage}</span>
    </div>`);
    $sizer.find("input").val(pageSize).data("origVal", pageSize).on("blur", function(e){
      var $input=$(e.delegateTarget);
      $input.val($input.data("origVal"));
    }).on("keypress", function(e){
      if(e.key=="Enter"){
        var $input=$(e.delegateTarget);
        var newVal=$input.val();
        if(isNaN(newVal)){
          $input.val($input.data("origVal"));
        } else {
          newVal=Math.floor(newVal);
          if(newVal<1) newVal=1;
          $input.val(newVal);
          Screenful.Navigator.pageSize=newVal;
          Screenful.Navigator.list(e, null, false);
        }
      }
    });
    $listbox.append($sizer);
  },

  printExporters: function($listbox, exporters){
    var $exporters=$(`<div class="exporters"></div>`);
    exporters.map(exporter => {
      var $exporter=$(`<form method="POST" action="${exporter.url}"><button>${exporter.label}</button><input type="hidden" name="ids" value=""/></form>`);
      $exporter.on("submit", Screenful.Navigator.collectIDsToExport);
      $exporters.append($exporter);
    });
    $listbox.append($exporters);
  },
  collectIDsToExport: function(e){
    var $form=$(e.delegateTarget);
    var $listbox=$form.closest(".listbox");
    var entryIDs=[];
    $listbox.find("div.entry").each(function(){
      var $entry=$(this);
      var id=$entry.attr("data-id");
      entryIDs.push(id);
    });
    $form.find("input").val(entryIDs.join(","));
    return true;
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
    if(Screenful.Navigator.lastListFuncName=="list") Screenful.Navigator.list();
    else if(Screenful.Navigator.lastListFuncName=="listHierarchy") Screenful.Navigator.listHierarchy();
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
      if(Screenful.Navigator.lastListFuncName=="list") Screenful.Navigator.list(null, null, true);
      else if(Screenful.Navigator.lastListFuncName=="listHierarchy") Screenful.Navigator.listHierarchy();
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
            if(Screenful.Navigator.deleteFunc) Screenful.Navigator.deleteFunc(data);
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

  entryDrillerClick: function(e){
    e.stopPropagation();
    var $driller=$(e.delegateTarget);
    var $entry=$driller.closest(".entry");

    if($driller.hasClass("collapsed")){
      //drill down into this entry
      var entryID=$entry.attr("data-id");
      Screenful.Navigator.listHierarchy(entryID);
    }
    else if($driller.hasClass("expanded")){
      $entry=$entry.prev(".entry").first();
      if($entry.length>0){
        var entryID=$entry.attr("data-id");
        Screenful.Navigator.listHierarchy(entryID);
      } else {
        Screenful.Navigator.list();
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
        if(Screenful.Navigator.exporters && Screenful.Navigator.exporters.length>0){
          Screenful.Navigator.printExporters($listbox, Screenful.Navigator.exporters);
        }
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
        if(confirm(Screenful.Loc.batchConfirm.replace("$X", $("#countcaption").html()))){
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
        }
      });
    });
  },

  printableOn: function(event){
    $("body").addClass("printable");
  },
  printableOff: function(event){
    $("body").removeClass("printable");
  },
};
$(window).ready(Screenful.Navigator.start);
