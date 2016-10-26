<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
  <title>{{=it.nouwiki.wikiName}}</title>
	<link rel="stylesheet" href="{{=it.nouwiki.markupBody}}">
  <link rel="stylesheet" href="{{=it.nouwiki.template}}/assets/static/css/template.ui.css">
  <script>
    var nouwiki_global = {};
    nouwiki_global.target = "dynamic";
  </script>
  <script src="{{=it.nouwiki.parser}}"></script>
  <script src="{{=it.nouwiki.nouwiki}}/js/require.js"></script>
  <script src="{{=it.nouwiki.nouwiki}}/js/nouwiki.init.min.js"></script>
  <script>
    if (nouwiki_global.ready == true)
    {
      start();
    } else {
      nouwiki_global.ready = start;
    }
    function start() {
      nouwiki_global.ready = true;
      var page = nouwiki_global.parser.parse(nouwiki_global.config.nouwiki, nouwiki_global.title, nouwiki_global.markup, nouwiki_global.template, nouwiki_global.config.global).page;
      document.open("text/html", "replace");
      document.write(page);
      document.close();
    }
  </script>
</head>
<body>

</body>
</html>
