<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
  <title>{{=it.wiki_title}}: {{=it.page_title}}</title>

  <!-- Dynamic -->
  <link rel="stylesheet" href="{{=it.paths.markupBody}}">
  <link rel="stylesheet" href="{{=it.paths.template}}/assets/nouwiki/css/template.ui.css">
  <script>
    var nouwiki_global = {};
    nouwiki_global.paths = {{=JSON.stringify(it.paths)}}
    nouwiki_global.target = "nouwiki";
  </script>

  <!-- Global User Import -->
  {{ for(var i in it.global.import) { }}
  <link rel="import" href="{{=it.content.frontend.path}}{{=it.global.import[i]}}">
  {{ } }}

  <!-- Local User Import -->
  {{ for(var i in it.local.import) { }}
  <link rel="import" href="{{=it.content.frontend.path}}{{=it.local.import[i]}}">
  {{ } }}

  <!-- Global User CSS -->
  {{ for(var i in it.global.css) { }}
  <link rel="stylesheet" href="{{=it.content.frontend.path}}{{=it.global.css[i]}}">
  {{ } }}

  <!-- Local User CSS -->
  {{ for(var i in it.local.css) { }}
  <link rel="stylesheet" href="{{=it.content.frontend.path}}{{=it.local.css[i]}}">
  {{ } }}
</head>
<body>
  <div id="controles">
    <a href="{{=it.paths.nou}}"><button id="network">Network</button></a>
    <a href="{{=it.paths.content}}"><button id="home">Home</button></a>
    <button id="edit" class="view">Edit</button>
    <button id="discard" class="edit" disabled>Return to Page</button>
    <button id="save" class="edit" disabled>Save Edits</button>
    <button id="remove" class="edit" disabled>Delete Page</button>
    <button id="rename" class="edit" disabled>Rename Page</button>
    <button id="run" class="edit" disabled>Run Script(s)</button>
    <div id="right_controles">
      <input id="search_pages" type="text" placeholder="Search Pages" />
      <ul id="matches">
      </ul>
    </div>
  </div>
  <div id="content" class="markup-body view">
  {{=it.fragment}}
  </div>
  <div id="editor" class="edit">
    <textarea></textarea>
    <div id="preview" class="markup-body"></div>
  </div>

  <!-- NouWiki -->
  <script src="{{=it.paths.parser}}"></script>
  <script src="{{=it.paths.nouwiki}}/js/require.js"></script>
  <script src="{{=it.paths.nouwiki}}/js/nouwiki.init.min.js"></script>
  <script>
    var wiki = "{{=it.wiki_title}}";
  </script>

  <!-- Dynamic -->
  <script src="{{=it.paths.template}}/assets/nouwiki/js/template.ui.js" async></script>

  <!-- Global User JS -->
  {{ for(var i in it.global.js) { }}
  <script class="global_js" src="{{=it.content.frontend.path}}{{=it.global.js[i]}}"></script>
  {{ } }}

  <!-- Local User JS -->
  {{ for(var i in it.local.js) { }}
  <script class="local_js" src="{{=it.content.frontend.path}}{{=it.local.js[i]}}"></script>
  {{ } }}
</body>
</html>
