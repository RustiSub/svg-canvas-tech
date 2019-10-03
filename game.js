window.addEventListener("load", function () {
  var Vector = wrect.Physics.Vector;

  var mouseMovement = 0;


  var background = document.getElementById('background').contentDocument;
  var parent = SVG.adopt(background.getElementById('houseSvg'));

  var width = 1400;
  var height = 400;

  parent.width(width);
  parent.height(height);

  var sceneParent = parent.nested();

  parent.viewbox(0, 0, width, height);

  function cameraZoom(zoomLevel, point) {
    //center of the current viewbox rectangle
    point = point || {
      x: width / 2,
      y: height / 2
    };

    var newX = point.x - ((width / zoomLevel) / 2);
    var newY = point.y - ((height / zoomLevel) / 2);
    var newWidth = (width / zoomLevel);
    var newHeight = (height / zoomLevel);

    parent.viewbox(newX, newY, newWidth, newHeight);
  }

  //Setup Mouse on Path

  var mouse = SVG.adopt(background.getElementById('mouse'));
  var mouseShape = SVG.adopt(background.getElementById('mouseShape'));
  var path1Group = SVG.adopt(background.getElementById('path.1.group'));
  var path1 = SVG.adopt(background.getElementById('path.1'));
  var path1Length = path1.length();

  var mouseAnimationLength = 10000;
  mouse.toParent(path1Group);

  function undoTransform(element, vector) {
    var transformedVector = vector;

    if (!element) {
      return transformedVector;
    }

    if (typeof element.transform === "function") {
      transformedVector.x = vector.x * element.transform().scaleX + element.transform().x;
      transformedVector.y = vector.y * element.transform().scaleY + element.transform().y;
    }

    if (typeof element.parent === "function") {
      undoTransform(element.parent(), transformedVector);
    }

    return transformedVector;
  }

  var previousPoint;
  var mouseAnimation = mouse
      .animate(mouseAnimationLength, '-')
      .during(function (pos, morph, eased, situation) {
        var p = path1.pointAt((eased) * path1Length);
        var rotation = 0;

        if (previousPoint) {
          var p1 = p;
          var p2 = previousPoint;

          var angle = Math.atan2((p2.y - p1.y),
              (p2.x - p1.x));

          rotation = angle * (180 / Math.PI);
        }

        mouse.translate(
            p.x - ((mouse.node.getBBox().x + (mouse.node.getBBox().width / 2)) * mouse.transform().scaleX),
            p.y - ((mouse.node.getBBox().y + (mouse.node.getBBox().height / 2)) * mouse.transform().scaleY)
        );

        mouseShape.rotate(rotation);

        var actualVector = undoTransform(mouse, new Vector(mouseShape.cx(), mouseShape.cy()));

        cameraZoom(8, actualVector);

        previousPoint = p;
      }).pause()
  ;

  // speed = x units / 1ms
  var movementSpeed = 10;
  var maxMovementSpeed = 10;


  background.addEventListener('keydown',
      function (event) {
        //event.stopPropagation();
        //event.preventDefault();

        switch (event.keyCode) {
          case 69:
            break;
          case 16:
            maxMovementSpeed = 50;
            break;
          case 37:
            mouseMovement -= movementSpeed;
            // nestedScene1Parent.x(nestedScene1Parent.x() + movement);
            // nestedScene2Parent.x(nestedScene2Parent.x() + movement);
            break;
          case 39:
            mouseMovement += movementSpeed;

            // nestedScene1Parent.x(nestedScene1Parent.x() - movement);
            // nestedScene2Parent.x(nestedScene2Parent.x() - movement);
            break;
          case 38:
            // nestedScene1Parent.y(nestedScene1Parent.y() + movement);
            // nestedScene2Parent.y(nestedScene2Parent.y() + movement);
            break;
          case 40:
            mouseMovement += movementSpeed;
            // nestedScene1Parent.y(nestedScene1Parent.y() - movement);
            // nestedScene2Parent.y(nestedScene2Parent.y() - movement);
            break;
          case 90:

            break;
          case 83:

            break;
          case 32:

            break;
        }
      }
  );

  background.addEventListener('keyup',
      function (event) {
        //event.stopPropagation();
        //event.preventDefault();

        switch (event.keyCode) {
          case 69:
            break;
          case 16:
            maxMovementSpeed = 10;
            break;
          case 37:
            mouseMovement = 0;
            // nestedScene1Parent.x(nestedScene1Parent.x() + movement);
            // nestedScene2Parent.x(nestedScene2Parent.x() + movement);
            break;
          case 39:
            mouseMovement = 0;

            // nestedScene1Parent.x(nestedScene1Parent.x() - movement);
            // nestedScene2Parent.x(nestedScene2Parent.x() - movement);
            break;
          case 38:
            // nestedScene1Parent.y(nestedScene1Parent.y() + movement);
            // nestedScene2Parent.y(nestedScene2Parent.y() + movement);
            break;
          case 40:
            // nestedScene1Parent.y(nestedScene1Parent.y() - movement);
            // nestedScene2Parent.y(nestedScene2Parent.y() - movement);
            break;
          case 90:

            break;
          case 83:

            break;
          case 32:

            break;
        }
      }
  );

  //move 10 units over 1000ms

  // progress = time passed since last loop
  function update(progress) {
    mouseMovement = mouseMovement > maxMovementSpeed ? maxMovementSpeed : mouseMovement;
    mouseMovement = mouseMovement < maxMovementSpeed * -1 ? maxMovementSpeed * -1 : mouseMovement;

    var distanceToMoveThisLoop = (progress / 1000) * mouseMovement;

    if (distanceToMoveThisLoop !== 0) {
      mouseAnimation.at(((mouseAnimation.pos * path1Length) + distanceToMoveThisLoop) / path1Length);

      //parent.viewbox(mouse.rbox().x - 50, mouse.rbox().y- 50, 100, 100 * ratio);
//      console.log(mouse.rbox().x - 50, mouse.rbox().y- 50, 100, 100 * ratio);
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
