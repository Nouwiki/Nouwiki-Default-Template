var $ = require("jquery"); // jQuery: DOM manipulation


/* CodeMirror: The text editor */
require('codemirror/lib/codemirror.css');
var CodeMirror = require("codemirror");
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');
require('codemirror/addon/scroll/simplescrollbars.css');
require('codemirror/addon/scroll/simplescrollbars.js');


/* Virtual-Dom: Incremental Update*/
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var virtual = require('virtual-html');


/* Warnings about unsaved edits so you don't loose content */
var originalMarkupText = "";
var newMarkupText = "";
var confirmOnPageExit = function (e)
{
  if (originalMarkupText != newMarkupText) {
    // If we haven't been passed the event get the window.event
    e = e || window.event;

    var message = 'Document has not been saved';

    // For IE6-8 and Firefox prior to version 4
    if (e)
    {
        e.returnValue = message;
    }

    // For Chrome, Safari, IE8+ and Opera 12+
    return message;
  }
};
window.onbeforeunload = confirmOnPageExit;


// nouwiki-init will call nouwiki_global.ready once its done
if (nouwiki_global.ready == true) {
  start();
} else {
  nouwiki_global.ready = start;
}
function start() {
  nouwiki_global.ready = true;
  $("#controles button").attr("disabled", false);
  $("#save").attr("disabled", true);
}


/* Init CodeMirror */
var myCodeMirror = CodeMirror.fromTextArea($("#editor textarea")[0], {
  lineWrapping: true,
  theme: 'prose-bright',
  mode: "markdown",
  scrollbarStyle: "overlay"
});


/* Init preview */
var previewVDOM = virtual('<div id="vdom"></div>');
var previewNode = createElement(previewVDOM);
$("#preview").append(previewNode);


/* Sync-Scroll Event Listeners */
var syncScroll = require("./sync-scroll");
syncScroll.myCodeMirror = myCodeMirror;
$("#preview").scroll(syncScroll.previewScroll);
myCodeMirror.on("scroll", syncScroll.srcScroll);


var fragment;
var first = true;
var brake = false;
var updatePreviewTimeout;
var delay = 50;
myCodeMirror.on("change", function(cm, change) {
  newMarkupText = myCodeMirror.getValue();
  if (originalMarkupText != newMarkupText) {
    $("#discard").text("Discard Edits");
    $("#save").attr("disabled", false);
  } else {
    $("#discard").text("Return to Page");
    $("#save").attr("disabled", true);
  }
  if (first) {
    updatePreview();
  } else {
    clearTimeout(updatePreviewTimeout);
    updatePreviewTimeout = setTimeout(updatePreview, delay);
  }
});
function updatePreview() {
  syncScroll.update_dom_catch = true;
  syncScroll.update_catch = true;

  if (first) { // ?
    first = false;
  } else {
    nouwiki_global.plugins = [];
  }
  fragment = nouwiki_global.parser.parse(nouwiki_global.conf.nou, nouwiki_global.conf.content, nouwiki_global.title, newMarkupText, undefined).fragment;

  try {
    if (!scriptsLoaded && !brake) {
      var newPreviewVDOM = virtual('<div id="vdom">'+fragment+'</div>'); // new dom
      var patches = diff(previewVDOM, newPreviewVDOM); // diff against previeous dom
      previewNode = patch(previewNode, patches); // patch against previeous dom
      previewVDOM = newPreviewVDOM;
    } else {
      brake = false;
      $("#preview").html('<div id="vdom">'+fragment+'</div>');
      previewNode = $("#vdom")[0];
      previewVDOM = virtual('<div id="vdom">'+fragment+'</div>');
      $("#run").attr("disabled", false);
    }
  } catch(e) {
    brake = true;
    $("#preview").html('<div id="vdom">'+fragment+'</div>');
    previewNode = $("#vdom")[0];
    $("#run").attr("disabled", false);
  }
}

var contentCatch = "";
if (nouwiki_global.mode == "edit") {
  $(".view").hide();
  $(".edit").show();
  startEdit();
}


$("#edit").click(function() {
  startEdit();
});
function startEdit() {
  if (nouwiki_global.ready == true) {
    edit();
  } else {
    setTimeout(function() {
      startEdit();
    }, 100);
  }
}
function edit() {
  getMarkupFile();
  $(".view").hide();
  $(".edit").show();
  contentCatch = $("#content").html();
  $("#content").html("");
}
function getMarkupFile() {
  $.ajax({
      url: nouwiki_global.paths.content+'api/get_page/'+nouwiki_global.origin.page,
      type: 'GET',
      contentType: "text/plain",
      success: function(text) {
        originalMarkupText = text;
        myCodeMirror.setValue(text);
        myCodeMirror.clearHistory();
      },
      error: function(resp) {
        if (resp.status == 404) {
          var text = resp.responseText;
          originalMarkupText = "";
          myCodeMirror.setValue(text);
          myCodeMirror.clearHistory();
        }
      }
  });
}


$("#discard").click(function() {
  if (originalMarkupText != newMarkupText) {
    if (confirm("Are you sure you want to discard your edit?")) {
      discard();
    }
  } else {
    discard(); // Return to page, not "discard"
  }
});
function discard() {
  $("#content").html(contentCatch);
  $(".view").show();
  $(".edit").hide();

  var empty = "";
  originalMarkupText = empty;
  myCodeMirror.setValue(empty)
  myCodeMirror.clearHistory();

  if (documentHasBeenEdited) {
    document.location.reload(true);
  }
}


var documentHasBeenEdited = false;
$("#save").click(function() {
  save();
});
function save() {
  var markup = newMarkupText;
  originalMarkupText = markup;
  $("#discard").text("Return to Page");
  $("#save").attr("disabled", true);
  documentHasBeenEdited = true;
  $.ajax({
      url: nouwiki_global.paths.content+'api/modify',
      type: 'PUT',
      data: markup,
      contentType: "text/plain",
      success: function(result) {}
  });
}
$(window).bind('keydown', function(event) {
  var key = String.fromCharCode(event.which).toLowerCase();
  if (key == "s" && event.ctrlKey && originalMarkupText != newMarkupText) {
    event.preventDefault();
    save();
  }
});


/*$("#create").click(function() {
  create();
});
function create() {
  $.ajax({
      url: nouwiki_global.paths.content+'api/create',
      type: 'POST',
      data: nouwiki_global.title,
      contentType: "text/plain",
      success: function(result) {
        document.location.reload(true);
      }
  });
}*/


$("#remove").click(function() {
  remove();
});
function remove() {
  var result = confirm("Are you sure you want to remove this page?");
  if (result) {
    $.ajax({
        url: nouwiki_global.paths.content+'api/remove/'+nouwiki_global.origin.page,
        type: 'GET',
        contentType: "text/plain",
        success: function(result) {
          document.location.reload(true);
        }
    });
  }
}


$("#rename").click(function() {
  var result = prompt("Page name: ", nouwiki_global.origin.page);
  if (result && result != nouwiki_global.origin.page) {
    rename(result);
  }
});
function rename(result) {
  $.ajax({
      url: nouwiki_global.paths.content+'api/rename/'+nouwiki_global.origin.page+'?to='+result,
      type: 'GET',
      contentType: "text/plain",
      dataType:"json",
      success: function(result) {
        console.log(result)
        /*console.log(result)
        document.location.reload(true);*/
      },
      error: function(e) {
        console.log(e)
        //console.log("e", e)
      },
      complete: function(c) {
        console.log(c)
        //window.location.href = nouwiki_global.origin.root+"wiki/"+result;
      }
  });
}


var scriptsLoaded = false;
$("#run").click(function() {
  $("#run").attr("disabled", true);
  reloadJS();
});
function reloadJS(f) {
  scriptsLoaded = true;
  f = f || function() {};
  var n = $(".global_js, .local_js").length;

  $(".global_js, .local_js").each(function() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = $(this).attr("src");
    if ($(this).attr("class").indexOf("global_js") > -1) {
      script.className = "global_js";
    } else if ($(this).attr("class").indexOf("local_js") > -1) {
      script.className = "local_js";
    }
    script.onload = function() {
      n -= 1;
      if (n == 0) {
        f();
      }
    }
    $(this).after(script);
    $(this).remove();
  });
}


$("#search_pages").keyup(function() {
  var val = $(this).val();
  if (val != "" && val != undefined && val != null) {
    search(val);
  } else {
    $("#matches").html("");
  }
});
function search(val) {
  $.ajax({
      url: nouwiki_global.paths.search+'api/search/'+val,
      type: 'GET',
      contentType: "text/plain",
      success: function(result) {
        var matches = result.matches;
        console.log(matches)
        var lis = "";
        for (var c in matches) {
          var r = "/";
          var keys = Object.keys(matches);
          if (keys.length > 1) {
            r = "/"+c+"/";
          }
          for (var p in matches[c]) {
            var matchLower = matches[c][p].toLowerCase();
            var valLower = val.toLowerCase();
            var i = matchLower.indexOf(valLower);
            var ie = i+val.length;
            var s = "";
            if (i > 0) {
              s = matches[c][p].substring(0, i);
            }
            var m = matches[c][p].substring(i, ie);
            var e = matches[c][p].substring(ie);
            var bold = r+s+"<b>"+m+"</b>"+e;
            lis += "<li><a href='"+r+"wiki/"+matches[c][p]+"'>"+bold+"</a></li>";
          }
        }
        $("#matches").html(lis);
      }
  });
}

$("#search_icon").click(function() {
  $("#search_pages").toggleClass("show");
})
