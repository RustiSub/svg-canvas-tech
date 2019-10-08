window.addEventListener("load", function () {
  var Vector = wrect.Physics.Vector;

  var background = document.getElementById('background').contentDocument;
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
  var animationOriginVector = new Vector(0, 0);
  var moveMouseVector = animationOriginVector.subtract(mouseVector);
  mouse.transform('translate(' + moveMouseVector.x + ',' + moveMouseVector.y + ')');
  mouse.node.style['will-change'] = 'transform';

  var walkAnimation;

  let duration = 10000;

  function mouseWalk() {
    mouse.node.style = 'offset-path: path("' + pathWalk.attr('d') + '")';

    walkAnimation = mouse.node.animate([
      { offsetDistance: 0 },
      { offsetDistance: '100%' }
    ], {
      duration: duration,
      easing: 'linear',
      iterations: Infinity,
      fill: 'both'
    });

    walkAnimation.pause();
  }

  mouseWalk();

  //Movement
  var mouseMovement = 0;
  var movementSpeed = 1;
  var walkMaxMovementSpeed = 2;
  var runMaxMovementSpeed = 5;
  var maxMovementSpeed = walkMaxMovementSpeed;

  var running = false;

  background.addEventListener('keydown',
      function (event) {
        switch (event.keyCode) {
          case 16: //shift
            running = true;
            break;
          case 37: //arrow left
            mouseMovement -= movementSpeed;
            break;
          case 39: //arrow right
            mouseMovement += movementSpeed;
            break;
        }
      }
  );

  background.addEventListener('keyup',
      function (event) {
        switch (event.keyCode) {
          case 16: //shift
            running = false;
            break;
          case 37: //arrow left
            mouseMovement = 0;
            break;
          case 39: //arrow right
            mouseMovement = 0;
            break;
        }
      }
  );

  function speedToPosition(speed)
  {
    var iteration = Math.floor(walkAnimation.currentTime / duration);

    var currentPosition = ((walkAnimation.currentTime / duration) - iteration) * path1Length;

    currentPosition += speed;

    walkAnimation.currentTime = (currentPosition / path1Length) * duration;

    return currentPosition / path1Length;
  }

  function moveCamera(pos)
  {
    var pathPosition = pos * path1Length;

    var cameraVector = new Vector(pathWalk.getPointAtLength(pathPosition).x, pathWalk.getPointAtLength(pathPosition).y);

    cameraZoom(8, cameraVector);
  }

  function update(progress) {
    if (running) {
      maxMovementSpeed = runMaxMovementSpeed;
    } else {
      maxMovementSpeed = walkMaxMovementSpeed;
    }

    mouseMovement = mouseMovement > maxMovementSpeed ? maxMovementSpeed : mouseMovement;
    mouseMovement = mouseMovement < maxMovementSpeed * -1 ? maxMovementSpeed * -1 : mouseMovement;

    if (mouseMovement !== 0) {
      moveCamera(speedToPosition(mouseMovement));
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
