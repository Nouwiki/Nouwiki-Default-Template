var $ = require("jquery");
require('codemirror/lib/codemirror.css');
var CodeMirror = require("codemirror");
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');
require('codemirror/addon/scroll/simplescrollbars.css');
require('codemirror/addon/scroll/simplescrollbars.js');

var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var virtual = require('virtual-html');
var VNode = require('virtual-dom/vnode/vnode');
var VText = require('virtual-dom/vnode/vtext');
var convertHTML = require('html-to-vdom')({
    VNode: VNode,
    VText: VText
});

var markupText = "";
var edited = false;
var confirmOnPageExit = function (e)
{
  if (markupText != myCodeMirror.getValue()) {
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

// Turn it on - assign the function that returns the string
window.onbeforeunload = confirmOnPageExit;
// Turn it off - remove the function entirely
//window.onbeforeunload = null;

// nouwiki-init will call window.ready once its done
if (nouwiki_global.nouwiki.ready == true) {
  start();
} else {
  nouwiki_global.nouwiki.ready = start;
}
function start() {
  nouwiki_global.nouwiki.ready = true;
  $("#controles button").attr("disabled", false);
  $("#save").attr("disabled", true);
}

var myCodeMirror = CodeMirror.fromTextArea($("#editor textarea")[0], {
  lineWrapping: true,
  theme: 'prose-bright',
  mode: "markdown",
  scrollbarStyle: "overlay"
});

var previewVDOM = virtual('<div id="preview" class="markup-body"></div>'); // or virtual('...
var previewNode = createElement(previewVDOM);
$("#editor").append(previewNode);
var preview = false;
var src = false;
$("#preview").scroll(previewScroll);
myCodeMirror.on("scroll", srcScroll);
/*$(".CodeMirror").bind('scroll touchmove mousedown wheel DOMMouseScroll mousewheel keyup', function(e){
  if ( e.which > 0 || e.type == "mousedown" || e.type == "mousewheel" || e.type == "touchmove" || e.type == "scroll"){
    srcScroll();
  }
})*/

var dom_c = {};
var update_dom_catch = true; // DOM
var update_catch = true; // Length

var pre_c = {}
function previewScroll() {
  if (!src) {
    // DOM Catch
    if (update_dom_catch) {
      update_dom_catch = false;
      updateDOMCatch();
    }

    var res_add = $("#editor .CodeMirror").position().top;
    var src_add = 30;

    // Get nearst and next, if not same update cache
    update_catch = getNearest(pre_c, getTopRes, res_add);

    // update cach2 (length)
    if (update_catch) {
      update_catch = false;
      // The length between the two lines in pixels
      pre_c.res_length = (pre_c.next_pos-pre_c.nearest_pos);
      pre_c.src_last_pos = myCodeMirror.heightAtLine(parseInt(dom_c.lines[pre_c.nearest]), "local");
      pre_c.src_next_pos = myCodeMirror.heightAtLine(parseInt(dom_c.lines[pre_c.next]), "local");
      pre_c.src_length = Math.abs(pre_c.src_last_pos-pre_c.src_next_pos);
    }

    // How far beyond in pixels is it from it
    var offset = pre_c.nearest_pos;
    if (offset > 0) { // Top
      offset = 0;
    } else {
      offset = Math.abs(offset);
    }

    // The persentage of the offset in relation to length
    var per = offset / pre_c.res_length;
    // Add the same number of pixels in % in src that the offset in result is
    var pixels = pre_c.src_length*per;

    //myCodeMirror.scrollTo(0, t);
    //$('.CodeMirror-scroll').scrollTop(0).scrollTop(t);
    var v = (pre_c.src_last_pos-src_add)+pixels;
    preview = true;
    myCodeMirror.scrollTo(undefined, v);
  } else {
    src = false;
  }
}
var src_c = {}
function srcScroll() {
  if (!preview) {
    // DOM Catch
    if (update_dom_catch) {
      update_dom_catch = false;
      updateDOMCatch();
    }

    var res_add = $("#editor .CodeMirror").position().top;
    var src_add = res_add+30;

    // Get nearst and next, if not same update cache
    update_catch = getNearest(src_c, getTopSrc, src_add);

    // update cach2 (length)
    src_c.res_last_pos = dom_c.lines_el[src_c.nearest].position().top;
    if (update_catch) {
      update_catch = false;
      // The length between the two lines in pixels
      src_c.src_length = (src_c.next_pos-src_c.nearest_pos);
      //src_c.res_last_pos = dom_c.lines_el[src_c.nearest].position().top;
      src_c.res_next_pos = dom_c.lines_el[src_c.next].position().top;
      src_c.res_length = Math.abs(src_c.res_last_pos-src_c.res_next_pos);
    }

    // How far beyond in pixels is it from it
    var offset = src_c.nearest_pos;
    if (offset > 0) { // Top
      offset = 0;
    } else {
      offset = Math.abs(offset);
    }

    // The persentage of the offset in relation to length
    var per = offset / src_c.src_length;
    // Add the same number of pixels in % in src that the offset in result is
    var pixels = src_c.res_length*per;

    //myCodeMirror.scrollTo(0, t);
    //$('.CodeMirror-scroll').scrollTop(0).scrollTop(t);
    var v = (src_c.res_last_pos+dom_c.pre.scrollTop()-res_add)+pixels; // Go to line, plus 30 padding + offset pixels
    src = true;
    dom_c.pre.scrollTop(v);
  } else {
    preview = false;
  }
}
function getTopSrc(line) {
  return myCodeMirror.heightAtLine(parseInt(dom_c.lines[line]), "page");
}
function getTopRes(line) {
  return dom_c.lines_el[line].position().top;
}
function updateDOMCatch() {
  dom_c.pre = $("#editor #preview");
  dom_c.lines = [];
  dom_c.lines_el = [];
  dom_c.pre.children(".line").each(function() {
    dom_c.lines.push($(this)[0].dataset.line);
    dom_c.lines_el.push($(this));
  });
}
function getNearest(obj, getTop, add) {
  var prev = obj.nearest;
  obj.nearest = 0
  obj.nearest_pos = getTop(obj.nearest)-add;
  var top = getTop(obj.nearest)-add;
  for (var l = 1; l < dom_c.lines.length; l += 1) {
    top = getTop(l)-add;
    if (top <= 0 && top > obj.nearest_pos) {
      obj.nearest = parseInt(l);
      obj.nearest_pos = top;
    } else if (top > 0) {
      break;
    }
  }
  if (obj.nearest != prev) {
    obj.next = obj.nearest + 1;
    obj.next_pos = getTop(obj.next)-add;
    return true;
  } else {
    return false;
  }
}

var fragment;
var first = true;
var loadJS;
myCodeMirror.on("change", function(cm, change) {
  checkEdits();
  update_dom_catch = true;
  update_catch = true;

  if (first) {
    first = false;
  } else {
    nouwiki_global.nouwiki.plugins = [];
  }
  fragment = nouwiki_global.parser.parse(nouwiki_global.nouwiki.title, nouwiki_global.nouwiki.nouwiki.wiki_name, myCodeMirror.getValue(), undefined, undefined).fragment;
  //$("#preview").html(fragment);

  /*
    - Get new DOM
    - Get Diff
    - patch
  */

  try {
    var newPreviewVDOM = virtual('<div id="preview" class="markup-body">'+fragment+'</div>'); // new dom
    var patches = diff(previewVDOM, newPreviewVDOM); // diff against previeous dom
    previewNode = patch(previewNode, patches); // patch against previeous dom
    previewVDOM = newPreviewVDOM;
    clearTimeout(loadJS);
    loadJS = setTimeout(function() {
      reloadJS(loadPreview);
    }, 500);
  } catch(e) {
    $("#preview").html(fragment);
    clearTimeout(loadJS);
    loadJS = setTimeout(function() {
      reloadJS()
    }, 500);
  }
});

function loadPreview() {
  var j = $("#preview").html();
  var jsDOM = virtual('<div id="preview" class="markup-body">'+j+'</div>');
  var patches = diff(previewVDOM, jsDOM); // diff against previeous dom
  previewNode = patch(previewNode, patches); // patch against previeous dom
  previewVDOM = jsDOM;
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
  if (nouwiki_global.nouwiki.ready == true) {
    edit();
  } else {
    setTimeout(function() {
      startEdit();
    }, 100);
  }
}
function edit() {
  $(".view").hide();
  $(".edit").show();
  contentCatch = $("#content").html();
  $("#content").html("");
  getMarkupFile();
}
function getMarkupFile() {
  $.ajax(nouwiki_global.nouwiki.origin.markup_loc, {
    dataType : 'text',
    type : 'GET',
    cache: false,
    success: function(text) {
      markupText = text;
      myCodeMirror.setValue(text);
      myCodeMirror.clearHistory();
  }});
}

$("#discard").click(function() {
  if (markupText != myCodeMirror.getValue()) {
    if (confirm("Are you sure you want to discard your edit?")) {
      discard();
    }
  } else {
    discard();
  }
});
function discard() {
  $("#content").html(contentCatch);
  $(".view").show();
  $(".edit").hide();

  var empty = "";
  markupText = empty;
  myCodeMirror.setValue(empty)
  myCodeMirror.clearHistory();

  if (edited) {
    document.location.reload(true);
  }
}

$(window).bind('keydown', function(event) {
  var key = String.fromCharCode(event.which).toLowerCase();
  if (key == "s" && event.ctrlKey && markupText != myCodeMirror.getValue()) {
    event.preventDefault();
    save();
  }
});

$("#save").click(function() {
  save();
});
function save() {
  //$(".view").show();
  //$(".edit").hide();
  var markup = myCodeMirror.getValue();
  markupText = markup;
  checkEdits();
  edited = true;
  $.ajax({
      url: '/api/modify',
      type: 'PUT',
      data: markup,
      contentType: "text/plain",
      success: function(result) {
        //document.location.reload(true);
      }
  });
}

$("#create").click(function() {
  create();
});
function create() {
  $.ajax({
      url: '/api/create',
      type: 'POST',
      data: nouwiki_global.nouwiki.title,
      contentType: "text/plain",
      success: function(result) {
        document.location.reload(true);
      }
  });
}

$("#remove").click(function() {
  remove();
});
function remove() {
  var result = confirm("Are you sure you want to remove this page?");
  if (result) {
    $.ajax({
        url: '/api/remove',
        type: 'POST',
        data: nouwiki_global.nouwiki.origin.page,
        contentType: "text/plain",
        success: function(result) {
          console.log(result)
          document.location.reload(true);
        }
    });
  }
}

$("#rename").click(function() {
  rename();
});
function rename() {
  var result = prompt("Page name: ", nouwiki_global.nouwiki.origin.page);
  if (result && result != nouwiki_global.nouwiki.origin.page) {
    $.ajax({
        url: '/api/rename',
        type: 'POST',
        data: JSON.stringify({"old": nouwiki_global.nouwiki.origin.page, "new": result}),
        contentType: "text/plain",
        dataType:"json",
        success: function(result) {
          /*console.log(result)
          document.location.reload(true);*/
        },
        error: function(e) {
          //console.log("e", e)
        },
        complete: function(c) {
          window.location.href = nouwiki_global.nouwiki.origin.root+"wiki/"+result;
        }
    });
  }
}

$("#refresh").click(function() {
  refresh();
});
function refresh() {
  $("#preview").html(fragment);
  reloadJS();
}

$("#search_pages").keyup(function() {
  var val = $(this).val();
  if (val != "" && val != undefined && val != null) {
    $.ajax({
        url: '/api/search_pages',
        type: 'POST',
        data: val,
        contentType: "text/plain",
        success: function(result) {
          var matches = result.matches;
          console.log(matches)
          var lis = "";
          for (var p in matches) {
            var matchLower = matches[p].toLowerCase();
            var valLower = val.toLowerCase();
            var i = matchLower.indexOf(valLower);
            var ie = i+val.length;
            var s = "";
            if (i > 0) {
              s = matches[p].substring(0, i);
            }
            var m = matches[p].substring(i, ie);
            var e = matches[p].substring(ie);
            var bold = s+"<b>"+m+"</b>"+e;
            lis += "<li><a href='/wiki/"+matches[p]+"'>"+bold+"</a></li>";
          }
          $("#matches").html(lis);
        }
    });
  } else {
    $("#matches").html("");
  }
});

function checkEdits() {
  if (markupText != myCodeMirror.getValue()) {
    $("#discard").text("Discard Edits");
    $("#save").attr("disabled", false);
  } else {
    $("#discard").text("Return to Page");
    $("#save").attr("disabled", true);
  }
}

function reloadJS(f) {
  var n = 0;
  n += $(".global_js").length;
  $(".global_js").each(function() {
    var src = $(this).attr("src");
    var body = document.getElementsByTagName('body')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.className = "global_js";
    script.onload = function() {
      n -= 1;
      if (n == 0) {
        f();
      }
    }
    body.appendChild(script);
    $(this).remove();
  })
}
