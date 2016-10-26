var $ = require("jquery");

var preview = false;
var src = false;

var dom_c = {}; //
var update_dom_catch = true; // DOM
var update_catch = true; // Length

var pre_c = {} // Preview Catch
function previewScroll() {
  return;
  if (!src) {
    // DOM Catch
    console.log(exports.update_dom_catch)
    if (exports.update_dom_catch) {
      exports.update_dom_catch = false;
      updateDOMCatch();
    }

    var res_add = $("#editor .CodeMirror").position().top;
    var src_add = 30;

    // Get nearst and next, if not same update cache
    exports.update_catch = getNearest(pre_c, getTopRes, res_add);

    // update cach2 (length)
    if (exports.update_catch) {
      exports.update_catch = false;
      // The length between the two lines in pixels
      pre_c.res_length = (pre_c.next_pos-pre_c.nearest_pos);
      pre_c.src_last_pos = exports.myCodeMirror.heightAtLine(parseInt(dom_c.lines[pre_c.nearest]), "local");
      pre_c.src_next_pos = exports.myCodeMirror.heightAtLine(parseInt(dom_c.lines[pre_c.next]), "local");
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

    //exports.myCodeMirror.scrollTo(0, t);
    //$('.CodeMirror-scroll').scrollTop(0).scrollTop(t);
    var v = (pre_c.src_last_pos-src_add)+pixels;
    preview = true;
    exports.myCodeMirror.scrollTo(undefined, v);
  } else {
    src = false;
  }
}
var src_c = {} // Source (editor) Cache
function srcScroll() {
  if (!preview) {
    // DOM Catch
    console.log(exports.update_dom_catch)
    if (exports.update_dom_catch) {
      exports.update_dom_catch = false;
      updateDOMCatch();
    }

    var res_add = $("#editor .CodeMirror").position().top;
    var src_add = res_add+30;

    // Get nearst and next, if not same update cache
    exports.update_catch = getNearest(src_c, getTopSrc, src_add);

    // update cach2 (length)
    src_c.res_last_pos = dom_c.lines_el[src_c.nearest].position().top;
    if (exports.update_catch) {
      exports.update_catch = false;
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

    //exports.myCodeMirror.scrollTo(0, t);
    //$('.CodeMirror-scroll').scrollTop(0).scrollTop(t);
    var v = (src_c.res_last_pos+dom_c.pre.scrollTop()-res_add)+pixels; // Go to line, plus 30 padding + offset pixels
    src = true;
    dom_c.pre.scrollTop(v);
  } else {
    preview = false;
  }
}
function getTopSrc(line) {
  return exports.myCodeMirror.heightAtLine(parseInt(dom_c.lines[line]), "page");
}
function getTopRes(line) {
  return dom_c.lines_el[line].position().top;
}
function updateDOMCatch() {
  dom_c.pre = $("#preview");
  dom_c.lines = [];
  dom_c.lines_el = [];
  dom_c.pre.children("div").children(".line").each(function() {
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

exports.previewScroll = previewScroll;
exports.srcScroll = srcScroll;
exports.update_dom_catch = true;
exports.update_catch = true;
exports.myCodeMirror = null;
