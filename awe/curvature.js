var axisScale = 1;
var surfGraph;
var dotGraph;
var lineGraph;
var pi = Math.PI;

var tri=[
          makePoint(0.65,-0.35,0,"#000"),
          makePoint(-0.65,-0.35,0,"#000"),
          makePoint(0,0.776,0,"#000")
        ];
var parPts=[0.65,-0.65,-0.65,0.65]; //[length of lines, positions of lines]
var saddleTriangleLines = [[]];
var saddleParallelLines = [[]];




$(document).ready( function() {
  var data = null;
  var graph = null;

  genGraphs();

  $.ajax({
        type: "GET",
        url: 'data/saddleTriangleLines.csv',
        dataType: "text",
        success: function(data) {loadDataFile(data,saddleTriangleLines);}
     });

  $.ajax({
        type: "GET",
        url: 'data/saddleParallelLines.csv',
        dataType: "text",
        success: function(data) {loadDataFile(data,saddleParallelLines);}
     });

  omegaUpdate(); //generates Surface and updates Points/Lines

  linkCameras();
});

$('input[type=radio][name=overlay]').change(function() {
  var surfaceData = setSurface();
  overlayUpdate(surfaceData[0],surfaceData[1]);
});

//Generate Surface
//Checks and updates Points/Lines as needed
function omegaUpdate() {

  var surfaceData = setSurface();
  var shapeFunc   = surfaceData[0];
  var r           = surfaceData[1];

  surfGraph.setData(genSurf(shapeFunc,r));

  overlayUpdate(shapeFunc,r);
}

function overlayUpdate(shapeFunc,r) {
  var overlayState = setOverlay();

  if(overlayState!=0){
    var overlay = genOverlay(shapeFunc,r,overlayState);

    dotGraph.setData(overlay[0]);
    lineGraph.setData(overlay[1]);
  }
}

//DRAWING FUNCTIONS
////////////////////////////////////////////////////////////////////////////////
function genSurf(shapeFunc,r) {
  var data;
  switch (shapeFunc.toString()) {
    case plane.toString():
      surfGraph.setOptions({style: 'surface'}); //maybe
      data = genGenericSurface(shapeFunc,r,1);
      break;
    case sphere.toString():
      if(r<1.3) {
        surfGraph.setOptions({style: 'tri-surf'});
        data = genSphere(r);
      }
      else {
        surfGraph.setOptions({style: 'surface'});
        data = genGenericSurface(shapeFunc,r,30);
      }
      break;
    case saddle.toString():
      surfGraph.setOptions({style: 'surface'}); //maybe
      data = genGenericSurface(shapeFunc,r,25);
      break;
  }
  return data;
}


function genGenericSurface(shapeFunc,r,steps = 30) {
  var data = [];
  for (var x = -axisScale; x < axisScale+1/steps; x+=2*axisScale/steps) {
    for (var y = -axisScale; y < axisScale+1/steps; y+=2*axisScale/steps) {
      var s = undefined;
      if (x == -axisScale || y == -axisScale || 
          x >= (axisScale - 1/steps) || y >= (axisScale - 1/steps)) {
        s = 'EDGE_POINT';
      }
      var point = makePointOnSurface(x,y,shapeFunc,r,s);
      if(point){
        data.push(point);
      }
    }
  }
  return data;
}

function genSphere(r,steps = 21) {
  var data = []; 

  //add the sphere:
  for (let theta = 0; theta < pi/2; theta += pi/2/steps) {
    for (let phi = 0; phi < 2*pi; phi += 2*pi/steps) {
      let x = r * Math.sin(theta) * Math.cos(phi);
      if(Math.abs(x) > axisScale) break;

      let y = r * Math.sin(theta) * Math.sin(phi);
      if(Math.abs(y) > axisScale) break;

      let z = sphere(x,y,r); 
      if(Math.abs(z) > axisScale) break;

      var s = undefined;
      if(theta >= pi/2-pi/2/steps) {
        s = 'EDGE_POINT';
      }

      data.push(makePoint(x,y,z,s));
    }
  }

  //fill in rest of Grid:
  for (var x = -axisScale; x < axisScale+1/steps; x+=2*axisScale/steps) {
    for (var y = -axisScale; y < axisScale+1/steps; y+=2*axisScale/steps) {
      var s = undefined;
      if (x == -axisScale || y == -axisScale || 
          x >= (axisScale - 1/steps) || y >= (axisScale - 1/steps)) {
        s = 'EDGE_POINT';
      }
      var point = makePointOnSurface(x,y,sphere,r,s);
      if(point && !insideCircle(x,y,axisScale)){
        data.push(point);
      }
    }
  }

  return data;
}

function insideCircle(x,y,r) {
  var pointR = Math.sqrt(x**2 + y**2);
  if(pointR<r) return true;
  return false;
}

function genOverlay(shapeFunc,r,overlayState) {
  //only get here if tri or parLines overlay
  var points;
  var lines;
  if(overlayState==1) { //tri overlay
    points = genPoints(shapeFunc,r,tri);
    lines  = genTriangle(shapeFunc,r);
    return [points,lines];
  }
  else {
    return genParallelLines(shapeFunc,r);
  }

}

function genPoints(shapeFunc,r,points) {
  //set z values for points
  //set style for points
  for (var i = 0; i < points.length; i++) {
    points[i].z = shapeFunc(points[i].x,points[i].y,r);
    points[i].style = "#000";
  }

  return points;
}

function genTriangle(shapeFunc,r) {
  let linesFunc = setLinesFunc(shapeFunc);

  //linesFunc not defined for saddle
  if(!linesFunc) return drawSaddleTri(r);

  var data = [];
  data = data.concat(linesFunc(r,tri[0],tri[1])
                    ,linesFunc(r,tri[1],tri[2])
                    ,linesFunc(r,tri[2],tri[0]));
  return data;
}

function genParallelLines(shapeFunc,r) {
  let linesFunc = setLinesFunc(shapeFunc);
  var midLine, negLine, posLine;

  //linesFunc not defined for saddle
  if(linesFunc) {
    let xMid    = (parPts[0]+parPts[1])/2.0;
    midLine = linesFunc(r,makePointOnSurface(xMid,parPts[2],shapeFunc,r),
                          makePointOnSurface(xMid,parPts[3],shapeFunc,r));
    negLine = linesFunc(r,makePointOnSurface(parPts[0],parPts[2],shapeFunc,r),
                          makePointOnSurface(parPts[1],parPts[2],shapeFunc,r));
    posLine = linesFunc(r,makePointOnSurface(parPts[0],parPts[3],shapeFunc,r),
                          makePointOnSurface(parPts[1],parPts[3],shapeFunc,r));

    var topYExtreme = Math.min.apply(null,getDimValues(negLine,'y'));
    var dyNeg       = -(topYExtreme - parPts[2]);
    negLine = movePts(negLine,'y',dyNeg,shapeFunc,r);

    var botYExtreme = Math.max.apply(null,getDimValues(posLine,'y'));
    var dyPos       = -(botYExtreme - parPts[3]);
    posLine = movePts(posLine,'y',dyPos,shapeFunc,r);
  }
  //saddle 
  else {
    let omega   = Math.round((1-Math.pow(r,-2))*10)/10.;
    let theData =  saddleParallelLines[saddleParallelLines[0].indexOf(omega)+1];
    negLine     = theData.slice(0,theData.length/3);
    midLine     = theData.slice(theData.length/3, 2/3*theData.length);
    posLine     = theData.slice(2/3*theData.length);
  }

  // let points = genParallelLinesPoints(shapeFunc,r,dyNeg,dyPos);
  let points = [changePointStyle(negLine[0],"#000"),
                changePointStyle(negLine[negLine.length-1],"#000"),
                changePointStyle(posLine[0],"#000"),
                changePointStyle(posLine[posLine.length-1],"#000")];

  return [points,arrangeParallelLines(negLine,posLine,midLine)];
}

function arrangeParallelLines(topLine,botLine,midLine) {
  changePointStyle(topLine[topLine.length-1],"END_SEGMENT");
  changePointStyle(midLine[midLine.length-1],"END_SEGMENT");
  return topLine.concat(botLine);
}
////////////////////////////////////////////////////////////////////////////////



//SURFACE FUCTIONS
////////////////////////////////////////////////////////////////////////////////
function plane(x, y, r) {
  return 0; 
}

function sphere(x, y, r) {
  return Math.sqrt(r**2 - x**2 - y**2)-r;  //adjusted so pole is at z=0
}

function saddle(x,y,r) {
  return (x**2-y**2)/r //scaled by r
}

function setSurface() {
  var omega = parseFloat($("#OmegaSlider").val());
  document.getElementById("OmegaVal").innerHTML=omega;

  var k = Math.sign(omega-1);
  var r;
  var shapeFunc;
  switch (k) {
    case 0:
      r         = 0;
      shapeFunc = plane;
      break;
    case 1:
      r         = Math.sqrt(k/(omega-1));
      shapeFunc = sphere;
      break;
    case -1:
      r         = Math.sqrt(k/(omega-1));
      shapeFunc = saddle;
      break;
  }

  return [shapeFunc,r];
}

function setOverlay() {
  var button = $('input[type=radio][name=overlay]:checked');
  var overlayState = parseFloat(button.val());

  //visual update
    //buttons
    $('input[type=radio][name=overlay]').parent().removeClass('active');
    button.parent().addClass("active");
    //description

    if(overlayState == 0) {
      $('.overlay-descrip').css("display","none");
    }

    if(overlayState == 1) {
      $('.overlay-triangle').css("display","block");
      $('.overlay-parallel').css("display","none");
    }

    if(overlayState == 2) {
      $('.overlay-triangle').css("display","none");
      $('.overlay-parallel').css("display","block");
    }


  var dotCont  = $('#dot-graph');
  var lineCont = $('#line-graph');

  if(overlayState == 0) {
    dotCont.css("display","none");
    lineCont.css("display","none");
  }
  else {
    dotCont.css("display","block");
    lineCont.css("display","block");
  }

  return overlayState;
}

function setLinesFunc(shapeFunc) {
  var linesFunc;
  switch (shapeFunc.toString()) {
    case plane.toString():
      linesFunc = line;
      break;
    case sphere.toString():
      linesFunc = greatCircle;
      break;
    case saddle.toString():
      return;
      break;
  }
  return linesFunc;
}

////////////////////////////////////////////////////////////////////////////////



//Geodesic FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

function line(r,p1,p2) {
  var numPoints = 20;

  var dx = (p2.x - p1.x)/(numPoints-1);
  var dy = (p2.y - p1.y)/(numPoints-1);
  var dz = (p2.z - p1.z)/(numPoints-1);

  var data = [p1];

  for (var i =1; i<numPoints; i++) {
    data.push(makePoint(data[i-1].x+dx, data[i-1].y+dy,data[i-1].z+dz));
  }

  return data;
}

function greatCircle(r,p1,p2){
  var data = [];

  var u = makePoint(p1.x,p1.y,p1.z+r);
  normalize(u);

  
  var v = makePoint(p2.x,p2.y,p2.z+r);
  normalize(v);

  var n = normalize(cross(u,v));
  var s = cross(n,u);
  var c = makePoint(0,0,-r);

  var p = makePoint(r*u.x+c.x, r*u.y+c.y, r*u.z+c.z);

  for (var phi=0.01; phi<=pi; phi+=0.01) {
    data.push(p);
    var np = makePoint(r*Math.cos(phi)*u.x + r*Math.sin(phi)*s.x+c.x,
                       r*Math.cos(phi)*u.y + r*Math.sin(phi)*s.y+c.y,
                       r*Math.cos(phi)*u.z + r*Math.sin(phi)*s.z+c.z);
    if(distance(np,p1)>distance(p2,p1)) break;
    p=np;
  }
  data.push(p2);
  return data;
}

function drawSaddleTri(r) {
  var omega = Math.round((1-Math.pow(r,-2))*10)/10.;
  return saddleTriangleLines[saddleTriangleLines[0].indexOf(omega)+1];
}
////////////////////////////////////////////////////////////////////////////////



//POINT FUNCTIONS
////////////////////////////////////////////////////////////////////////////////
function makePoint(x,y,z,s) {
  var pt = {
    x: x,
    y: y,
    z: z,
  };
  if (s) {
    pt.style = s;
  }
  return pt;
}

function changePointStyle(pt,s) {
  pt['style']=s;
  return pt;
}

function getDimValues(pts,dim) {
  var ret = [];
  for (var i = 0; i < pts.length; i++) {
    ret.push(pts[i][dim]);
  }
  return ret;
}

function movePts(pts,dim,adj,shapeFunc,r) {
  for (var i = 0; i < pts.length; i++) {
    pts[i][dim] = pts[i][dim]+adj;
    pts[i].z    = shapeFunc(pts[i].x,pts[i].y,r);
  }
  return pts;
}

function makePointOnSurface(x,y,shapeFunc,r,s) {
  var z = shapeFunc(x,y,r);
  if($.isNumeric(z)) {
    return makePoint(x,y,z,s);
  }
}

function cross(u,v) {
  var i = u.y*v.z - u.z*v.y;
  var j = u.z*v.x - u.x*v.z;
  var k = u.x*v.y - u.y*v.x;
  return makePoint(i,j,k);
}

function normalize(u) {
  var l = distance(u,makePoint(0,0,0));
  if (l==0) return u;
  u.x = u.x/l;
  u.y = u.y/l;
  u.z = u.z/l;
  return u;
}

function distance(p1,p2) {
  return Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2 + (p1.z-p2.z)**2);
}

//Initializers
////////////////////////////////////////////////////////////////////////////////
function genGraphs() {
  var surfCont = document.getElementById('surf-graph');
  var dotCont  = document.getElementById('dot-graph');
  var lineCont = document.getElementById('line-graph');

  var camDist = 1.7;
  if($('#surf-graph').css('height') == '394px') {
    camDist=2.0;
  }

  var basicOptions = {
    width: '100%',
    height: '100%',
    cameraPosition: {
                      horizontal: -pi,
                      vertical: 0.7,
                      distance: camDist,
                    },
    xMax: axisScale,
    yMax: axisScale,
    xMin: -axisScale,
    yMin: -axisScale,
    zMax: 1,
    zMin: -1,
    verticalRatio: 0.9,
    xCenter   : '50%',
    yCenter   : '40%',
  };

  var hideAxOpt = {
    showGrid: false,
    showXAxis: false,
    showYAxis: false,
    showZAxis: false,
  };

  surfGraph = new vis.Graph3d(surfCont);
  dotGraph  = new vis.Graph3d(dotCont);
  lineGraph = new vis.Graph3d(lineCont);

  surfGraph.setOptions(basicOptions);
  surfGraph.setOptions(hideAxOpt);

  dotGraph.setOptions(basicOptions);
  dotGraph.setOptions(hideAxOpt);

  lineGraph.setOptions(basicOptions);
  lineGraph.setOptions(hideAxOpt);

  surfGraph.setOptions({
    style: 'tri-surf',
    showShadow: false,
    dataColor: {
      strokeWidth: 0,
    },
    axisColor: '#000',
    //showInnerLines : false,
    colorScale : ['#8b0000','#950f0c','#9d2018','#a52d23','#ab3a2e','#b0463a','#b45347','#b85e53','#bb6a5f','#be766d','#bf827a','#c08d87','#c19895','#c1a4a1','#c1afad','#c0bbba','#adbbd6','#98afe1','#82a4e8','#6c98ec','#5e8cea','#567fe3','#4f72dc','#4866d3','#405aca','#394ec0','#3242b6','#2a36ac','#222aa1','#191d96','#0f108b','#000080'],
    // tooltip: function (point) {
    //       return 'x: <b>' + point.x + '</b><br>' + 
    //       'y: <b>' + point.y + '</b><br>' +
    //       'z: <b>' + point.z + '</b><br>' +
    //       'v: <b>' + point.data.style + '</b>';
    // },
  });
  dotGraph.setOptions({
    style: 'dot-color',
    showLegend: false,
    // tooltip: function (point) {
    //       return 'x: <b>' + point.x + '</b><br>' + 
    //       'y: <b>' + point.y + '</b><br>' +
    //       'z: <b>' + point.z + '</b>';
    // },
  });
  lineGraph.setOptions({
    style: 'line',
    dataColor: {
      fill: '#000000',
      stroke: '#000000',
      strokeWidth: 10,
      showPerspective: true,
    },
    showLegend: false,
    // tooltip: function (point) {
    //       return 'x: <b>' + point.x + '</b><br>' + 
    //       'y: <b>' + point.y + '</b><br>' +
    //       'z: <b>' + point.value + '</b>';
    // },
  });

  lineGraph.setData([makePoint(0,0,0)]);
  dotGraph.setData([makePoint(0,0,0,"#000")]);
}

function loadDataFile(dataString,arr) {
  var lines = dataString.split("\n");

  //var headers = lines.shift();

  for (let i = 1; i < lines.length; i++) {

    let values = lines[i].split(",");
    values = values.map(Number);

    let oInd = arr[0].indexOf(values[0]);
    if(oInd == -1) {
      arr[0].push(values[0]);
      arr.push([]);
      oInd = arr[0].length-1;
    }

    arr[oInd+1].push(
      makePoint.apply(this,values.slice(1,values.length)));
  }
}

function linkCameras() {
  lineGraph.on('cameraPositionChange', function (e) {
    surfGraph.setCameraPosition(e);
    dotGraph.setCameraPosition(e);
  });

  surfGraph.on('cameraPositionChange', function (e) {
    lineGraph.setCameraPosition(e);
    dotGraph.setCameraPosition(e);
  });
}

//Misc
////////////////////////////////////////////////////////////////////////////////
$("#minimizeButton").click(function() {
  $('#intro-paragraph').slideUp(400, function() {
    $('.intro-underline').addClass('intro-underline-active');
  });
});

$(document).on('click', ".intro-underline-active", function() {
  $('.intro-underline').removeClass('intro-underline-active');
  $('#intro-paragraph').slideDown(400, function() {
  });        
});

$(".page-right").click(function() {
  var pageNum   = parseFloat($(this).parent().find('.current-page').text());
  var pageCount = parseFloat($(this).parent().find('.page-count').text());

  if(pageNum == pageCount) return;
  
  var pages = $(this).parent().parent().children();

  $(pages[pageNum-1]).addClass('helptip-behind');
  $(pages[pageNum]).removeClass('helptip-behind');

  $(this).parent().find('.current-page').text(pageNum+1);
});

$(".page-left").click(function() {
  var pageNum = parseFloat($(this).parent().find('.current-page').text());

  if(pageNum==1) return;

  var pages = $(this).parent().parent().children();

  $(pages[pageNum-1]).addClass('helptip-behind');
  $(pages[pageNum-2]).removeClass('helptip-behind');

  $(this).parent().find('.current-page').text(pageNum-1);
});

$('.btn-advanced').click(function() {
  var paragraphs = $(this).parent().find('.olay-descrip-body');
  for (var i = 0; i < paragraphs.length; i++) {
    var p = $(paragraphs[i]);
    if(p.hasClass('olay-body-behind')) {
      p.removeClass('olay-body-behind')
    }
    else {
      p.addClass('olay-body-behind')
    }
  }

  if($(this).text().trim() == "Advanced") {
    $(this).text("Back");
  }
  else {
    $(this).text("Advanced");
  }
});