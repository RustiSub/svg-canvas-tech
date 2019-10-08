window.addEventListener("load", function () {
  var Vector = wrect.Physics.Vector;

  var parent = Snap('#background');

  var width = parent.getBBox().width;
  var height = parent.getBBox().height;

  parent.attr({width: 1400});
  parent.attr({height: height});

  var absoluteOrigin = new Vector(parent.getBBox().width / 2, parent.getBBox().height / 2);

  function cameraZoom(zoomLevel, point) {
    //center of the current viewbox rectangle
    point = point || new Vector(width / 2, height / 2);

    var translateVector = absoluteOrigin.subtract(point);

    parent.node.style.transform = 'scaleX(' + zoomLevel + ') scaleY(' + zoomLevel + ')';
    parent.node.style.transform += ' translateX(' + translateVector.x + 'px) translateY(' + translateVector.y + 'px)';
  }

  var targetPointVector = new Vector(0, absoluteOrigin.y);


  //cameraZoom(10, targetPointVector);

  function applyTransform(point, matrix) {
    point.x *= matrix.a;
    point.x += matrix.e;

    point.y *= matrix.d;
    point.y += matrix.f;

    return point;
  }

  //Setup Mouse on Path
  var pathWalk = parent.select('#path-trip');
  var pathOffsetTest = parent.select('#path-offset-test');
  var path1Length = Snap.path.getTotalLength(pathWalk.attr("d"));

  var mouseAnimationLength = 10000;

  var mouse = parent.select('#simpleMouse');
  var mouseShape = parent.select('#mouseShape');

  mouse.transform('');

  var mouseVector = new Vector(mouse.getBBox().cx, mouse.getBBox().cy);

  var pathStartVector = new Vector(pathOffsetTest.getPointAtLength(0).x, pathOffsetTest.getPointAtLength(0).y);
  var animationOriginVector = new Vector(0, 0);
  var moveMouseVector = animationOriginVector.subtract(mouseVector);
  mouse.transform('translate(' + moveMouseVector.x + ',' + moveMouseVector.y + ')');
  mouse.node.style['will-change'] = 'transform';
//will-change: transform
  var animation;

  let duration = 10000;

  function mouseWalk() {
    mouse.node.style = 'offset-path: path("' + pathWalk.attr('d') + '")';
    //mouse.node.style = 'offset-path: path("m 29.855549,559.21177 0,0")';


    animation = mouse.node.animate([
      { offsetDistance: 0 },
      { offsetDistance: '100%' }
    ], {
      duration: duration,
      easing: 'linear',
      iterations: Infinity,
      fill: 'both'
    });
  }

  mouseWalk();

  //cameraZoom(10, new Vector(207.2286524689752,123.67886993388154));
  //cameraZoom(1, new Vector(pathWalk.getPointAtLength(0).x, pathWalk.getPointAtLength(0).y));

  var frequency = 0;

  function update(progress) {
    frequency += progress;

    if (animation && animation.playState === 'running') {

      var iteration = Math.floor(animation.currentTime / duration);

      var pos = ((animation.currentTime / duration) - iteration) * path1Length;

      var cameraVector = new Vector(pathWalk.getPointAtLength(pos).x, pathWalk.getPointAtLength(pos).y);

      cameraZoom(6, cameraVector);
    }
  }

  function loop(timestamp) {
    var progress = timestamp - lastRender;

    update(progress);

    lastRender = timestamp;
    window.requestAnimationFrame(loop);
  }

  var lastRender = 0;
  window.requestAnimationFrame(loop);
});
