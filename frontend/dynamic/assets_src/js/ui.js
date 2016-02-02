var toml = require('toml');
var $ = require("jquery");
require('codemirror/lib/codemirror.css');
var CodeMirror = require("codemirror");
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');

var markupText = "";
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

var config;
var ready = 1;
$.get( "config.toml", function( c ) {
  config = toml.parse(c);
  ready -= 1;
  if (ready == 0) {
    $("#controles").removeClass("disabled");
  }
});

var myCodeMirror = CodeMirror.fromTextArea($("#editor textarea")[0], {
  lineWrapping: true,
  theme: 'prose-bright',
  mode: "markdown"
});
var fragment;
myCodeMirror.on("change", function(cm, change) {
  fragment = parse.parse(origin.page, myCodeMirror.getValue(), config).fragment;
  $("#preview").html(fragment);
});

function getMarkupText() {
  $.ajax(origin.markup_loc, {
    dataType : 'text',
    type : 'GET',
    cache: false,
    success: function(text) {
      markupText = text;
      myCodeMirror.setValue(text);
      myCodeMirror.clearHistory();
  }});
}
$("#edit").click(function() {
  if (ready == 0) {
    edit();
  }
});
//var editing = false;
function edit() {
  $("#edit").hide();
  $(".edit").show();

  $("#editor").show();
  $("#content").hide();
  getMarkupText();

  //editing = !editor_showing;
}

$("#discard").click(function() {
  var result = true;
  if (markupText != myCodeMirror.getValue()) {
    result = confirm("Are you sure you want to discard your edit?");
  }
  if (result) {
    var empty = "";
    markupText = empty;
    myCodeMirror.setValue(empty)
    myCodeMirror.clearHistory();
    discard();
  }
});
function discard() {
  $("#edit").show();
  $(".edit").hide();

  $("#editor").hide();
  $("#content").show();
}

$("#save").click(function() {
  save();
});
function save() {
  $("#edit").show();
  $(".edit").hide();

  $("#editor").hide();
  $("#content").show();
  var markup = myCodeMirror.getValue();
  markupText = markup;
  $.ajax({
      url: '/api/modify',
      type: 'PUT',
      data: markup,
      contentType: "text/plain",
      success: function(result) {
        document.location.reload(true);
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
      data: origin.page,
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
        data: origin.page,
        contentType: "text/plain",
        success: function(result) {
          document.location.reload(true);
        }
    });
  }
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
            lis += "<li><a href='/"+matches[p]+"'>"+bold+"</a></li>";
          }
          $("#matches").html(lis);
        }
    });
  } else {
    $("#matches").html("");
  }
});
