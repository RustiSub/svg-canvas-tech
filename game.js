window.addEventListener("load", function() {
/*  var parent = document.querySelector('#houseSvg');
  parent = SVG.adopt(parent);

  var sceneParent = parent.nested();

  parent.viewbox(0, 0, 1920, 1080);

  sceneParent.viewbox(parent.viewbox());*/


  var background = document.getElementById('background').contentDocument;
  var parent = SVG.adopt(background.getElementById('houseSvg'));

  parent.width(800);
  parent.height(600);

  var sceneParent = parent.nested();

  parent.viewbox(0, 0, 750, 611);

  sceneParent.viewbox(parent.viewbox());
});
