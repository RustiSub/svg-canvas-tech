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
  var moveMouseVector = pathStartVector.subtract(mouseVector);

  //mouse.transform('translate(' + moveMouseVector.x + ',' + moveMouseVector.y + ')');

  //mouse.node.style.transform = 'translateX(' + moveMouseVector.x + 'px) translateY(' + moveMouseVector.y + 'px)';

  cameraZoom(10, new Vector(mouse.getBBox().cx, mouse.getBBox().cy));
  //cameraZoom(10, new Vector(0, height));

  //offset-path: path("M 73.1972 533.559 L 104.153 560.811 L 86.4764 595.327 L 52.1107 558.165 Z");

  //mouse.attr({cx: 73.1972});
  //mouse.attr({cy: 533.559});

  var animation;
  console.log(parent);
  console.log(parent.transform());

  console.log(pathOffsetTest);

  var aStart = new Vector(0 ,0);

  console.log(aStart);
  console.log(applyTransform(aStart, parent.transform().globalMatrix));

  function mouseWalk() {
    //mouse.node.style = 'offset-path: path("' + pathOffsetTest.attr('d') + '")';
    mouse.node.style = 'offset-path: path("m 0,0 100,0")';

    animation = mouse.node.animate([
      { offsetDistance: 0 },
      { offsetDistance: '100%' }
    ], {
      duration: 1000,
      easing: 'linear',
      iterations: 1,
      fill: 'both'
    });
  }

  //mouseWalk();

  /*  Snap.animate(0, path1Length, function (val) {
      var pos = pathWalk.getPointAtLength(val);

      cameraZoom(4, pos);
    }, 10000);*/

/*  parent.node.animate([
    {
      transform: 'scaleY(' + 1 + ') scaleX(' + 1 + ')',
      transformOrigin: '0px 600px',
    },
    {
      transform: 'scaleY(' + scale + ') scaleX(' + scale + ')',
      transformOrigin: '0px 600px',
    },
    {
      transform: 'scaleY(' + scale + ') scaleX(' + scale + ')',
      transformOrigin: '800px 600px',
    },
    {
      transform: 'scaleY(' + scale + ') scaleX(' + scale + ')',
      transformOrigin: '800px 400px',
    },
    {
      transform: 'scaleY(' + scale + ') scaleX(' + scale + ')',
      transformOrigin: '0px 400px',
    },
    {
      transform: 'scaleY(' + scale + ') scaleX(' + scale + ')',
      transformOrigin: '0px 600px',
    },
  ], {
    duration: 10000,
    iterations: Infinity,
  });*/

  function update(progress) {
    //console.log(animation);
    if (animation && animation.playState === 'running') {
      //console.log(animation.effect.target.style);
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
