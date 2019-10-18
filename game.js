window.addEventListener("load", function () {
  var Vector = wrect.Physics.Vector;

  var background = document.getElementById('background').contentDocument;
  var parent = Snap('#background');

  var width = 900;
  var height = parent.getBBox().height;

  parent.attr({width: width});
  parent.attr({height: height});

  var zoom = 6;
  let cameraRecenterEase = 0.04;
  let deadZoneSize = width * 0.01;
  let maxMouseLookDistance = zoom * 6;

  var mouseLookEnabled = false;

  var cameraViewBox = parent.attr("viewBox");

  var moveCameraVector = new Vector(0, 0);

  //Player
  var positionVector = new Vector(0, 0);
  var playerPosition  = new Vector(0, 0);

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

  var mouseLookVector = new Vector(0, 0);

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

  var mouse = parent.select('#player-group');
  var playerShape = parent.select('#player-shape');
  var playerPostionVector = new Vector(0, 0);

  mouse.transform('');
  playerShape.attr({cx: 0});
  playerShape.attr({cy: 0});

  var mouseLookOffsetVector = new Vector(0, 0);
  var mouseLookCircle =  parent.circle(0, 0, 3);

  var mouseVector = new Vector(mouse.getBBox().cx, mouse.getBBox().cy);
  var animationOriginVector = new Vector(0, 0);
  var moveMouseVector = animationOriginVector.subtract(mouseVector);
  mouse.transform('translate(' + moveMouseVector.x + ',' + moveMouseVector.y + ')');

  //mouseLookCircle.appendTo(mouse);

  var walkAnimation;

  let duration = 10000;

  function mouseWalk() {
    mouse.node.style = 'offset-path: path("' + pathWalk.attr('d') + '")';

    positionVector = new Vector(pathWalk.getPointAtLength(0).x, pathWalk.getPointAtLength(0).y);

    walkAnimation = mouse.node.animate([
      {
        offsetDistance: 0,
        offsetAnchor: '0 0'
      },
      {
        offsetDistance: '100%',
        offsetAnchor: '0 0'
      }
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
  var mouseMovement = new Vector(0, 0);
  var movementSpeed = 10; // 10units/1000ms // 10 * 16ms / 1000ms
  var walkMaxMovementSpeed = 100;
  var runMaxMovementSpeed = 150;
  var maxMovementSpeed = walkMaxMovementSpeed;

  //Physics

  var running = false;

  var movementForce = new Vector(0, 0);

  background.addEventListener('keydown',
      function (event) {
        switch (event.keyCode) {
          case 16: //shift
            running = true;
            break;
          case 81: //Q
          case 37: //arrow left
            movementForce.x = -1 * movementSpeed;
            break;
          case 68:
          case 39: //arrow right
            movementForce.x = movementSpeed;
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
            movementForce.x = 0;
            break;
          case 68: //D
          case 39: //arrow right
            movementForce.x = 0;
            break;
        }
      }
  );

  var absolutePositionVector = new Vector(0, 0);
  var relativePositionVector = new Vector(0, 0);
  var mouseLookCircleVector;

  var mouseVector = new Vector(0,0);

  function mouseMove(event) {
    mouseVector = new Vector(
        (event.x - (parentTransform.translate.x * parentTransform.scale.x)) / parentTransform.scale.x ,
        (event.y - (parentTransform.translate.y * parentTransform.scale.y)) / parentTransform.scale.y,
    );

    calculateMouseToMouseLook();

    cameraZoom(zoom, cameraPos);

    focusCamera();
  }

  var pointerHandler = (event) => {
    if (!mouseLookEnabled) {
      return event;
    }

    event.preventDefault();
    mouseMove(event);

    return false;
  };

  background.addEventListener('pointermove', pointerHandler);
  window.addEventListener('pointermove', pointerHandler);

  var mouseDown = (event) => {
    if (event.button === 0) {
      mouseLookEnabled = true;

      mouseMove(event);
    }
  };

  background.addEventListener('mousedown', mouseDown);
  window.addEventListener('mousedown', mouseDown);

  var mouseUp = (event) => {
    if (event.button === 0) {
      mouseLookEnabled = false;

      //cameraZoom(zoom, cameraPos.add(mouseLookVector));
    }
  };

  background.addEventListener('mouseup', mouseUp);
  window.addEventListener('mouseup', mouseDown);

  function updateViewBox()
  {
    viewBox.x = (originalViewBox.x * parentTransform.scale.x) + parentTransform.translate.x;
    viewBox.y = (originalViewBox.y * parentTransform.scale.y)  + parentTransform.translate.y;
    viewBox.width = originalViewBox.width * parentTransform.scale.x;
    viewBox.height = originalViewBox.height * parentTransform.scale.y;
    viewBox.x2 = viewBox.x + viewBox.width;
  }

  var actualMoveDistanceVector = new Vector(0, 0);
  var playerOrientationVector = 0;

  function focusCamera() {
    moveCameraVector = playerPosition.subtract(cameraPos);

    var mouseLookVectorLength = (mouseLookVector.len() / maxMouseLookDistance);
    mouseLookVectorLength = mouseLookVectorLength > 0.25 ? mouseLookVectorLength : 0;
    var easedMouseLookVector = mouseLookVector.multiply(mouseLookVectorLength);

    moveCameraVector = moveCameraVector.add(easedMouseLookVector);
  }

  var gravityForceVector = new Vector(0, 0);

  function applyPhysics(previousPositionVector, currentPosition, speed) {
    var pathAngle = previousPositionVector.subtract(positionVector);
    var angle = Math.abs(Math.sin(pathAngle.angle()));

    //Reduce speed
    //currentPosition -= speed.x;
    //currentPosition += speed.x - (speed.x * (angle * 0.75));

    angle = isNaN(angle) ? 0 : angle;


    gravityForceVector = angle * 10;


    return currentPosition;
  }

  function speedToPosition(speed)
  {
    var iteration = Math.floor(walkAnimation.currentTime / duration);
    var currentPosition = ((walkAnimation.currentTime / duration) - iteration) * path1Length;
    var previousPositionVector = new Vector(pathWalk.getPointAtLength(currentPosition).x, pathWalk.getPointAtLength(currentPosition).y);

    currentPosition += speed.x;

    positionVector = new Vector(pathWalk.getPointAtLength(currentPosition).x, pathWalk.getPointAtLength(currentPosition).y);

    actualMoveDistanceVector = positionVector.subtract(previousPositionVector);

    currentPosition = applyPhysics(previousPositionVector, currentPosition, speed);
    var currentTime = (currentPosition / path1Length) * duration;

    walkAnimation.currentTime = currentTime;

    positionVector = new Vector(pathWalk.getPointAtLength(currentPosition).x, pathWalk.getPointAtLength(currentPosition).y);

    actualMoveDistanceVector = positionVector.subtract(previousPositionVector);

    updateViewBox();

    absolutePositionVector = new Vector(positionVector.x, positionVector.y);

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

    var pushDeadZone = false;

    cameraZoom(zoom, cameraPos);

    playerPosition = new Vector(
        pathWalk.getPointAtLength(currentPosition).x - (width / zoom / 2),
        pathWalk.getPointAtLength(currentPosition).y - ((height * 1.5) / zoom / 2)
    );

    if (Math.abs(playerPosition.subtract(cameraPos).len()) > deadZone.right * 0.01 ||  pushDeadZone) {
      focusCamera();
    }

    playerPostionVector = new Vector(playerShape.getBBox().cx, playerShape.getBBox().cy);

    return currentPosition / path1Length;
  }

  function moveCamera(pos)
  {
    var pathPosition = pos * path1Length;

    var cameraVector = new Vector(pathWalk.getPointAtLength(pathPosition).x, pathWalk.getPointAtLength(pathPosition).y);

    cameraZoom(zoom, cameraVector);
  }

  cameraZoom(zoom, absoluteOrigin.add(new Vector(0, 550)));

  /**
   * Vector needs to be positioned to the player shape
   * @param mouseLookVector
   */
  function positionMouseLookVector()
  {
    var offsetVector = mouseLookVector.add(absolutePositionVector);

    mouseLookCircle.attr({transform: 'translate(' + offsetVector.x + ',' + offsetVector.y + ')'});
  }

  function calculateMouseToMouseLook() {
    var mouseLookAngleVector = mouseVector.subtract(absolutePositionVector);
    var mouseLookDistance = Math.abs(mouseLookAngleVector.len()) > maxMouseLookDistance ? maxMouseLookDistance : mouseLookAngleVector.len();
    var baseAngleVector = new Vector(mouseLookDistance, 0);

    mouseLookVector = baseAngleVector.rotateAngle(mouseLookAngleVector.angle());

    positionMouseLookVector();
  }

  /**
   * Friction is an opposed horizontal force with a fraction of the force
   * The higher the speed, the lower friction becomes, reaching minimal friction at max speed.
   * So the friction needs to start big, then scale down with the speed but have a fixed minimum value.
   *
   * @param forceVector
   */
  function applyFriction(currentSpeed, forceVector, progress)
  {
    // var maxFrictionForce = new Vector(0.5, 0);
    // var minFrictionForce = new Vector(0.1, 0);
    // var frictionValue = maxFrictionForce.subtract(minFrictionForce);
    // var frictionSpeed = maxMovementSpeed;
    // var frictionForce = Math.abs(forceVector.x / frictionSpeed);
    // var appliedFrictionForce = new Vector(minFrictionForce.x + frictionForce * frictionValue.x, 0);
    //
    // appliedFrictionForce = forceVector.x > 0 ? appliedFrictionForce.multiply(-1) : appliedFrictionForce;
    //
    // forceVector = forceVector.add(appliedFrictionForce);

    var forceSign = Math.sign(forceVector.x);

    var frictionFactor = (movementSpeed * 0.5) / progress;
    var frictionVector = new Vector(-1 * forceVector.x, 0);
    frictionVector = frictionVector.unit();
    forceVector = forceVector.add(frictionVector.multiply(frictionFactor));
    //
    // forceVector = Math.sign(forceVector) == forceSign ? forceVector : new Vector(0, 0);

    return forceVector;
  }

  function update(progress) {
    positionMouseLookVector();

    if (running) {
      maxMovementSpeed = runMaxMovementSpeed;
    } else {
      maxMovementSpeed = walkMaxMovementSpeed;
    }

    maxMovementSpeed = maxMovementSpeed / progress;

    mouseMovement.x = mouseMovement.x > maxMovementSpeed ? maxMovementSpeed : mouseMovement.x;
    mouseMovement.x = mouseMovement.x < maxMovementSpeed * -1 ? maxMovementSpeed * -1 : mouseMovement.x;

    var updateMovementForce = movementForce.divide(progress);

    mouseMovement = mouseMovement.add(updateMovementForce);
    mouseMovement = applyFriction(mouseMovement.subtract(updateMovementForce), mouseMovement, progress);
    mouseMovement.x = Math.abs(mouseMovement.x) < 0.0001 ? 0 : mouseMovement.x;

    if (mouseMovement.x !== 0) {
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

    progress = 1000 / progress;

    update(progress);

    lastRender = timestamp;
    window.requestAnimationFrame(loop);
  }

  var lastRender = 0;
  window.requestAnimationFrame(loop);
});
