window.addEventListener("load", function () {
  var Vector = wrect.Physics.Vector;

  var background = document.getElementById('background').contentDocument;
  var parent = Snap('#background');

  var width = parent.getBBox().width;
  var height = parent.getBBox().height;

  parent.attr({width: width});
  parent.attr({height: height});

  var cameraViewBox = parent.attr("viewBox");

  cameraViewBox.x = 0; //(width / 2) * -1;
  cameraViewBox.y = 0;
  cameraViewBox.width = parent.attr('width');
  cameraViewBox.height = parent.attr('height');
  parent.attr({viewBox: cameraViewBox});

  var viewBox = {
    x: parent.getBBox().x,
    y: parent.getBBox().y,
    width: parent.getBBox().width,
    height: parent.getBBox().height
  };

  var originalViewBox = {
    x: parent.getBBox().x,
    y: parent.getBBox().y,
    width: parent.getBBox().width,
    height: parent.getBBox().height
  };

  var windowSize = {
    width: parent.attr('width'),
    height: parent.attr('height'),
  };

  var kitchenWall = parent.select('#kitchen-wall');

  var absoluteOrigin = new Vector(0, 0);

  var parentTransform = {
    translate: new Vector(0, 0),
    scale: new Vector(1, 1),
  };

  var cameraPos = new Vector(0, 0);

  function cameraZoom(zoomLevel, point) {
    //center of the current viewbox rectangle
    point = point || new Vector(width / 2, height / 2);

    cameraPos = point;

    var translateVector = absoluteOrigin.subtract(point);

    //translateVector.x += (width / 2) / zoom;
    //translateVector.y += (height / 2) / zoom;

    parent.node.style.transform = 'scaleX(' + zoomLevel + ') scaleY(' + zoomLevel + ')';
    parent.node.style.transform += ' translateX(' + translateVector.x + 'px) translateY(' + translateVector.y + 'px)';
    parent.node.style.transformOrigin = 'top left';

    parentTransform.translate = new Vector(translateVector.x, translateVector.y);
    parentTransform.scale = new Vector(zoomLevel, zoomLevel);
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
  //mouse.node.style['will-change'] = 'transform';

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

  function updateViewBox()
  {
    viewBox.x = (originalViewBox.x * parentTransform.scale.x) + parentTransform.translate.x;
    viewBox.y = (originalViewBox.y * parentTransform.scale.y)  + parentTransform.translate.y;
    viewBox.width = originalViewBox.width * parentTransform.scale.x;
    viewBox.height = originalViewBox.height * parentTransform.scale.y;
    viewBox.x2 = viewBox.x + viewBox.width;
  }

  var zoom = 5;

  function speedToPosition(speed)
  {
    var iteration = Math.floor(walkAnimation.currentTime / duration);
    var currentPosition = ((walkAnimation.currentTime / duration) - iteration) * path1Length;

    var previousPositionVector = new Vector(pathWalk.getPointAtLength(currentPosition).x, pathWalk.getPointAtLength(currentPosition).y);

    currentPosition += speed;

    walkAnimation.currentTime = (currentPosition / path1Length) * duration;

    var positionVector = new Vector(pathWalk.getPointAtLength(currentPosition).x, pathWalk.getPointAtLength(currentPosition).y);
    var actualMoveDistance = positionVector.subtract(previousPositionVector);

    // console.log();

    //moveCamera(currentPosition / path1Length);

    updateViewBox();

    positionVector.x = positionVector.x * parentTransform.scale.x;
    positionVector.y = positionVector.y * parentTransform.scale.y;

    var deadzone = {
      right: (width - (20 * zoom)),
      left: (20) * zoom,
      bottom: (height - (20 * zoom)),
      top: (20) * zoom,
    };

    //console.log(positionVector.x, parentTransform.translate.x);

    //console.log(positionVector.x, parentTransform.translate.x, width * zoom, (width * zoom) - parentTransform.translate.x);

    // console.log(positionVector.x, width, parentTransform.translate.x);

    if ((positionVector.x + parentTransform.translate.x * zoom > deadzone.right && actualMoveDistance.x > 0) || positionVector.x + parentTransform.translate.x * zoom < deadzone.left && actualMoveDistance.x < 0) {
      cameraZoom(zoom, cameraPos.add(new Vector(actualMoveDistance.x, 0)));
    }

    //console.log(positionVector.y + parentTransform.translate.y * zoom, deadzone.bottom, deadzone.top);

    if ((positionVector.y + parentTransform.translate.y * zoom > deadzone.bottom && actualMoveDistance.y > 0) || (positionVector.y + parentTransform.translate.y * zoom < deadzone.top && actualMoveDistance.y < 0)) {
      cameraZoom(zoom, cameraPos.add(new Vector(0, actualMoveDistance.y)));
    }

    //moveCamera(currentPosition / path1Length, {x: false, y: false}, speed);

    //moveCamera(currentPosition / path1Length);

/*    if ((positionVector.x > deadzone && speed > 0) || (positionVector.x - parentTransform.translate.x < deadzoneLeft && speed < 0)) {
      //moveCamera(currentPosition / path1Length);
      cameraZoom(zoom, cameraPos.add(new Vector(speed, 0)));
    }*/

    return currentPosition / path1Length;
  }

  var cameraVector = new Vector(0, 0);

  function moveCamera(pos)
  {
    var pathPosition = pos * path1Length;

    var cameraVector = new Vector(pathWalk.getPointAtLength(pathPosition).x, pathWalk.getPointAtLength(pathPosition).y);

    cameraZoom(zoom, cameraVector);
  }

  var test = parent.select('#test123');
  // console.log(test.getBBox());

  //moveCamera(speedToPosition(mouseMovement));
  cameraZoom(zoom, absoluteOrigin.add(new Vector(70, 400)));

  function update(progress) {
    if (running) {
      maxMovementSpeed = runMaxMovementSpeed;
    } else {
      maxMovementSpeed = walkMaxMovementSpeed;
    }

    mouseMovement = mouseMovement > maxMovementSpeed ? maxMovementSpeed : mouseMovement;
    mouseMovement = mouseMovement < maxMovementSpeed * -1 ? maxMovementSpeed * -1 : mouseMovement;

    if (mouseMovement !== 0) {
      speedToPosition(mouseMovement);
      //moveCamera();
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
