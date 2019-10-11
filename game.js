window.addEventListener("load", function () {
  var Vector = wrect.Physics.Vector;

  var background = document.getElementById('background').contentDocument;
  var parent = Snap('#background');

  var width = 900;
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

    point = point.multiply(-1);

    parent.node.style.transform = 'scaleX(' + zoomLevel + ') scaleY(' + zoomLevel + ')';
    parent.node.style.transform += ' translateX(' + point.x + 'px) translateY(' + point.y + 'px)';
    parent.node.style.transformOrigin = 'top left';

    parentTransform.translate = new Vector(point.x, point.y);
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
          case 81: //Q
          case 37: //arrow left
            mouseMovement -= movementSpeed;
            break;
          case 68:
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
          case 81: //Q
          case 37: //arrow left
            mouseMovement = 0;
            break;
          case 68: //D
          case 39: //arrow right
            mouseMovement = 0;
            break;
        }
      }
  );

  var relativePositionVector = new Vector(0, 0);

  var pointerHandler = (event) => {
    event.preventDefault();

    var mouseVector = new Vector(
        event.x - parentTransform.translate.x,
        event.y - parentTransform.translate.y,
    );

    //console.log(mouseVector.x - parentTransform.translate.x, playerPosition.x + parentTransform.translate.x);

    console.log(relativePositionVector.distance(mouseVector));

    //cameraPos = cameraPos.add(partialMoveCameraVector);

    //playerPosition.subtract(cameraPos);

    // cameraZoom(zoom, mouseVector);

    // var deadZone = cameraDeadZone.width() / 2;
    // var mouseVector = new Vector(event.x, event.y);
    // var cameraCenterVector = new Vector(camera.cx(), camera.cy());
    // var distanceVector = mouseVector.distance(cameraCenterVector);
    //
    // if (distanceVector > deadZone) {
    //   moveDistance.x = camera.cx() - event.x;
    //   moveDistance.y = camera.cy() - event.y;
    // } else {
    //   moveDistance.x = 0;
    //   moveDistance.y = 0;
    // }
    //
    // var adjustedMoveClamp = moveClamp * (zoomLevel * 2);
    //
    // let absMoveX = Math.abs(moveDistance.x) / (zoomLevel * 1.5);
    // let absMoveXY= Math.abs(moveDistance.y) / (zoomLevel * 1.5);
    //
    // absMoveX = absMoveX < adjustedMoveClamp ? absMoveX : adjustedMoveClamp;
    // absMoveXY = absMoveXY < adjustedMoveClamp ? absMoveXY : adjustedMoveClamp;
    //
    // moveDistance.x *= (absMoveX / 500000) * absMoveX;
    // moveDistance.y *= (absMoveXY / 500000) * absMoveXY;

    return false;
  };

  background.addEventListener('pointermove', pointerHandler);

  function updateViewBox()
  {
    viewBox.x = (originalViewBox.x * parentTransform.scale.x) + parentTransform.translate.x;
    viewBox.y = (originalViewBox.y * parentTransform.scale.y)  + parentTransform.translate.y;
    viewBox.width = originalViewBox.width * parentTransform.scale.x;
    viewBox.height = originalViewBox.height * parentTransform.scale.y;
    viewBox.x2 = viewBox.x + viewBox.width;
  }

  var zoom = 1;
  let cameraRecenterEase = 0.04;
  let deadZoneSize = width * 0.01;

  var moveCameraVector = new Vector(0, 0);

  //Player
  var positionVector = new Vector(0, 0);
  var playerPosition  = new Vector(0, 0);

  function speedToPosition(speed)
  {
    var iteration = Math.floor(walkAnimation.currentTime / duration);
    var currentPosition = ((walkAnimation.currentTime / duration) - iteration) * path1Length;

    var previousPositionVector = new Vector(pathWalk.getPointAtLength(currentPosition).x, pathWalk.getPointAtLength(currentPosition).y);

    currentPosition += speed;

    walkAnimation.currentTime = (currentPosition / path1Length) * duration;

    positionVector = new Vector(pathWalk.getPointAtLength(currentPosition).x, pathWalk.getPointAtLength(currentPosition).y);

    var actualMoveDistance = positionVector.subtract(previousPositionVector);

    updateViewBox();

    relativePositionVector = new Vector(
        (positionVector.x * parentTransform.scale.x),
        (positionVector.y * parentTransform.scale.y)
    );

    positionVector.x = relativePositionVector.x + (parentTransform.translate.x * zoom);
    positionVector.y = relativePositionVector.y + (parentTransform.translate.y * zoom);

    var deadZone = {
      right: (width - (deadZoneSize * zoom)),
      left: (deadZoneSize) * zoom,
      bottom: (height - (deadZoneSize * zoom)),
      top: (deadZoneSize) * zoom,
    };

    var pushDeadzone = false;

    if ((positionVector.x > deadZone.right && actualMoveDistance.x > 0) || positionVector.x < deadZone.left && actualMoveDistance.x < 0) {
      cameraPos = cameraPos.add(new Vector(actualMoveDistance.x, 0));
      pushDeadzone = true;
    }

    if ((positionVector.y > deadZone.bottom && actualMoveDistance.y > 0) || (positionVector.y < deadZone.top && actualMoveDistance.y < 0)) {
      cameraPos = cameraPos.add(new Vector(0, actualMoveDistance.y));
      pushDeadzone = true;
    }

    cameraZoom(zoom, cameraPos);

    playerPosition = new Vector(
        pathWalk.getPointAtLength(currentPosition).x - (width / zoom / 2),
        pathWalk.getPointAtLength(currentPosition).y - ((height * 1.5) / zoom / 2)
    );

    if (Math.abs(playerPosition.subtract(cameraPos).len()) > deadZone.right * 0.01 ||  pushDeadzone) {
      moveCameraVector = playerPosition.subtract(cameraPos);
    }

    return currentPosition / path1Length;
  }

  function moveCamera(pos)
  {
    var pathPosition = pos * path1Length;

    var cameraVector = new Vector(pathWalk.getPointAtLength(pathPosition).x, pathWalk.getPointAtLength(pathPosition).y);

    cameraZoom(zoom, cameraVector);
  }

  cameraZoom(zoom, absoluteOrigin.add(new Vector(0, 550)));

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
    }

    if (moveCameraVector.len() !== 0) {
      var partialMoveCameraVector =  new Vector(moveCameraVector.x, moveCameraVector.y);
      partialMoveCameraVector = partialMoveCameraVector.multiply(cameraRecenterEase);

      moveCameraVector = moveCameraVector.subtract(partialMoveCameraVector);

      moveCameraVector.x = Math.abs(moveCameraVector.x) <= 0.1 ? 0 : moveCameraVector.x;
      moveCameraVector.y = Math.abs(moveCameraVector.y) <= 0.1 ? 0 : moveCameraVector.y;

      cameraPos = cameraPos.add(partialMoveCameraVector);

      cameraZoom(zoom, cameraPos);
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
