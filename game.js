window.addEventListener("load", function () {
  var Vector = wrect.Physics.Vector;

  var mouseMovement = 0;

  var parent = Snap('#background');

  var width = 1400;
  var height = 400;

  var zoom = 1;
  var frameZoom = 1;

  var parentRatio = parent.getBBox().width / parent.getBBox().height;

  parent.attr({height: height});
  parent.attr({width: parentRatio * height});

  var frameWidth = parent.getBBox().width;
  var frameHeight = parent.getBBox().height;

  width = parent.attr('width');
  height = parent.attr('height');

  frameZoom = frameWidth / width;

  var absoluteOrigin = new Vector(
      (frameWidth / 2) / frameZoom,
      (frameHeight / 2) / frameZoom,
  );

  /*parent.attr({viewBox: cameraViewBox});*/

  function cameraZoom(zoomLevel, point) {
    //center of the current viewbox rectangle
    point = point || new Vector(width / 2, height / 2);

    //var circle = parent.circle(point.x, point.y, 10);

    parent.node.style.transform = 'scaleX(' + zoomLevel + ') scaleY(' + zoomLevel + ')';
    parent.node.style.transform += ' translateX(' + point.x + 'px) translateY(' + point.y + 'px)';

    //parent.node.style.transformOrigin = point.x + 'px ' + point.y + 'px';
  }

  function applyTransform(point, matrix) {
    point.x *= matrix.a;
    point.x += matrix.e;

    point.y *= matrix.d;
    point.y += matrix.f;

    return point;

  }
  var testGlobe = parent.select('#testGlobe');

  //cameraZoom(4, testVector);

  //Setup Mouse on Path

  var mouse = parent.select('#mouse');
  var mouseShape = parent.select('#mouseShape');
  var path1Group = parent.select('#path-1-group');
  var path1 = parent.select('#path-climb');
  var pathWalk = parent.select('#path-climb');

//  var path1Length = path1.length();
  var path1Length = Snap.path.getTotalLength(pathWalk.attr("d"));

  var mouseAnimationLength = 10000;

  cameraZoom(zoom, absoluteOrigin);

  Snap.animate(0, path1Length, function(val) {
/*    var pos = pathWalk.getPointAtLength(val);

    pos = applyTransform(pos, pathWalk.transform().globalMatrix);

    //parent.circle(pos.x, pos.y, 10);

    cameraZoom(10, pos);*/
  }, 10000);

  /*
       function randomColor()
       {
         return "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
       }

       var snapZones = [];

       function addPathSnapZones(path) {
         var startPoint = path.pointAt(0);
         var endPoint = path.pointAt(path.length());

         let color = randomColor();
         snapZones.push(
           path.parent()
             .circle(10)
             .fill({ color: color})
             .move(startPoint.x - (10 /2), startPoint.y - (10 /2))
         )
         ;

         snapZones.push(
             path.parent()
                 .circle(10)
                 .fill({ color: color})
                 .move(endPoint.x - (10 /2), endPoint.y - (10 /2))
         )
         ;
       }

       addPathSnapZones(pathWalk);
       addPathSnapZones(path1);

       var previousPoint;
       var mouseAnimation = mouse
           .animate(mouseAnimationLength, '-')
           .during(function (pos, morph, eased, situation) {
             var p = pathWalk.pointAt((eased) * pathWalk.length());
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
       var movementSpeed = 75;
       var walkMaxMovementSpeed = 75;
       var runMaxMovementSpeed = 150;
       var maxMovementSpeed = walkMaxMovementSpeed;

       background.addEventListener('keydown',
           function (event) {
             switch (event.keyCode) {
               case 69:
                 break;
               case 16:
                 maxMovementSpeed = runMaxMovementSpeed;
                 break;
               case 37:
                 mouseMovement -= movementSpeed;
                 break;
               case 39:
                 mouseMovement += movementSpeed;
                 break;
               case 38:
                 break;
               case 40:
                 mouseMovement += movementSpeed;
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
                 maxMovementSpeed = walkMaxMovementSpeed;
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

       // Check if current anchor hits snap zones
       function checkSnapZoneOverlap(anchor)
       {
         snapZones.forEach(function(zone, index) {
           //calculate distance vector between anchor and snapZone

           var zoneVector = undoTransform(zone, new Vector(zone.cx(), zone.cy()));
           var radiusVector = undoTransform(zone, new Vector(zone.x(), zone.cy()));
           var radius = undoTransform(zone, new Vector(zone.width(), 0)).len();

           if (anchor.distance(zoneVector) < zoneVector.distance(radiusVector)) {
             zone.style({opacity: 0.75});
           } else {
             zone.style({opacity: 0.50});
           }
         });
       }

       // progress = time passed since last loop
       function update(progress) {
         mouseMovement = mouseMovement > maxMovementSpeed ? maxMovementSpeed : mouseMovement;
         mouseMovement = mouseMovement < maxMovementSpeed * -1 ? maxMovementSpeed * -1 : mouseMovement;

         var distanceToMoveThisLoop = (progress / 1000) * mouseMovement;

         if (distanceToMoveThisLoop !== 0) {
           mouseAnimation.at(((mouseAnimation.pos * path1Length) + distanceToMoveThisLoop) / path1Length);

           var mouseVector = undoTransform(mouse, new Vector(mouseShape.cx(), mouseShape.cy()));

           checkSnapZoneOverlap(mouseVector);
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
       */
});
