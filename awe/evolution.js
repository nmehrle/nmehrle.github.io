var chartData = [];
var theChart;
var DATA_LIMIT = 3;
var xDim = [-5,5];
var yDim = [0,5];
var DEFAULT_WIDTH   = 1.5;
var highlighted = -1;
var theImg;
var seriesNum = 1;

var cameraStartPosition = {
                            horizontal: -.816,
                            vertical: Math.PI/2,
                            distance: 1.7,
                          };

var surfGraph;
var dotGraph;


$(document).ready( function() {
  var data = null;
  var graph = null;


  //genGraphs();

  theImg = new Image();
  theImg.src = 'img/galaxy_clipart.png';
  chartInit('#Line-Graph svg');
})


//initializers
////////////////////////////////////////////////////////////////////////////////
function genGraphs() {
  delete surfGraph;
  delete dotGraph;
  var surfCont = document.getElementById('Surface-Graph');
  var dotCont  = document.getElementById('Dot-Graph');
  var axisScale = 3.5;

  var basicOptions = {
    width: '100%',
    height: '100%',
    cameraPosition: cameraStartPosition,
   
    keepAspectRatio: false,
    xMin: -axisScale,
    yMin: -axisScale,
    xMax:  axisScale,
    yMax:  axisScale,
    zMax:  1,
    zMin: -1,

    showAnimationControls: true,
    animationInterval:     50, // milliseconds
                               // 50 or less for smooth animation
    animationPreload:      false,
    animationAutoStart:    false, 
    animationLoop:         false,
    filterLabel:           'Time',
  };

  var hideAxOpt = {
    showGrid: false,
    showXAxis: false,
    showYAxis: false,
    showZAxis: false,
  };

  surfGraph = new vis.Graph3d(surfCont);
  surfGraph.setOptions(basicOptions);
  surfGraph.setOptions(hideAxOpt);
  surfGraph.setOptions({
    style: 'tri-surf',
    dataColor: {
                 strokeWidth: 0,
               },
    colorScale : ['#c0bbba','#adbbd6'],
  });

  dotGraph = new vis.Graph3d(dotCont);
  dotGraph.setOptions(basicOptions);
  dotGraph.setOptions(hideAxOpt);
  dotGraph.setOptions({
    style: 'dot-img',
    showLegend: false,
    valueMin:   0,
    valueMax:   1,
    dataColor: {
                  stroke      : '#000000',
                  strokeWidth : 0,
                  fill        : 'none',
               },
  });

  linkCameras();
}

function chartInit(chartID){
  nv.addGraph(function() {
    var chart = nv.models.lineChart()
                  .margin({"left": 70, "top": 100,})
                  .useInteractiveGuideline(false)
                  .showLegend(true)
                  .showYAxis(true)
                  .showXAxis(true)
                  .yDomain(yDim)
                  .xDomain(xDim)
                  .duration(0)
                  .clipEdge(true)
                  .padData(false)
                  .noData("Loading... If slow, please refresh the page.")
    chart.xAxis
        .axisLabel('Time')
        .tickFormat(d3.format('.02f'))

    chart.yAxis
        .axisLabel('Scale Factor')
        .tickFormat(d3.format('.02f'))

    chart.lines.dispatch.on("elementClick", function(e) {
      if(highlighted == e.seriesIndex) {
        frameSelected(e.seriesIndex, e.pointIndex);
      }
      else {
        selectLine(e.seriesIndex);
      }
    });

    chart.legend.updateState(false);
    chart.legend.dispatch.legendClick = function(d,i){
      if(highlighted != i) {
        selectLine(i);
      }
    };


    d3.select(chartID)
        .datum(chartData)
        .call(chart);
    nv.utils.windowResize(chart.update());

    theChart = chart;

    defaultChartBehavior();

    d3.select(".nv-legendWrap")
      .attr("transform", "translate(-70,-30)");
    return chart;
  });
}

function defaultChartBehavior() {
  var omega = [0,0.3,0.7];
  addData(friedmann(omega))
  selectLine(0);
}


function linkCameras() {
  dotGraph.on('cameraPositionChange', function (e) {
    surfGraph.setCameraPosition(e);
    cameraStartPosition = e;
  });
}

function updateChart() {
  theChart.update();
  d3.select(".nv-legendWrap")
      .attr("transform", "translate(-70,-30)");
}

/* Animation functions */
////////////////////////////////////////////////////////////////////////////////
function loadAnimation(seriesIndex) {
  stopAnimation();

  var data = getData(seriesIndex);
  highlightPoint(seriesIndex,0);

  var surfAnimationData   = genCircleSeries(data);
  var galaxyAnimationData = genGalaxySeries(data);

  genGraphs();
  surfGraph.setData(surfAnimationData);
  dotGraph.setData(galaxyAnimationData);

  linkGalaxyAnimation();
  linkChartAnimation(seriesIndex);
}

function stopAnimation() {
  if(surfGraph) {
    surfGraph.animationStop();
  }
  if(dotGraph) {
    dotGraph.animationStop();
  }
}

function frameSelected(seriesIndex, frame) {
  dotGraph.animationSetFrame(frame);
  surfGraph.animationSetFrame(frame);
  highlightPoint(seriesIndex,frame);
}

function linkGalaxyAnimation() {
  surfGraph.on('animationSetFrame', function(frame) {
    dotGraph.animationSetFrame(frame);
  });
}

function linkChartAnimation(seriesIndex) {
  var pointIndex;

  surfGraph.on('animationSetFrame', function(frame) {
    pointIndex = frame;
    highlightPoint(seriesIndex,pointIndex);
  });
}

/* HIGHLIGHT FUNCTIONS */
////////////////////////////////////////////////////////////////////////////////
function highlight(num) {
  highlighted = num;
  highlightLine(num);
  highlightLegend(num);
}

function unhighlight() {
  highlight(-1);
}

function highlightLine(num) {
  var HIGHLIGHT_WIDTH = 6;

  for (var i = 0; i < chartData.length; i++) {
    var strokeWidth = DEFAULT_WIDTH;
    if (i == num) {
      strokeWidth = HIGHLIGHT_WIDTH;
    }
    var lineClass = ".nv-series-"+i;
    $(lineClass).css("stroke-width",strokeWidth);
  }
}

function highlightLegend(num) {
  for (var i = 0; i < chartData.length; i++) {
    var r = 5;
    if (i == num) {
      r = 7;
    }
    var legendClass = ".nv-legend > g > g:nth-child("+(i+1)+") > circle"//:nth-child("+i+"):first-child";
    $(legendClass).attr("r",r);
  }
}

function highlightPoint(seriesIndex,pointIndex) {
  unhighlightPoints();

  var lineClass  = ".nv-series-"+seriesIndex;
  var pointClass = lineClass+" > .nv-point-"+pointIndex;

  $(pointClass).addClass('selected');
}

function unhighlightPoints() {
  var pointsClass = ".nv-point";
  $(pointsClass).removeClass('selected');
}


//integrators
////////////////////////////////////////////////////////////////////////////////
function friedmann(omega, keyPhrase="", color=getRandomColor()){
  var h = 0.05;

  var a0 = 1;
  var t0 = 0;

  var pos_time_points = midpoint_integrate(a0,t0,omega,h);
  var neg_time_points = midpoint_integrate(a0,t0,omega,-h).reverse();
  neg_time_points.pop();

  var d = neg_time_points.concat(pos_time_points);

  //bounce
  //xDim check checks for asymptotic behavior
  if( d[0].y >0 && d[0].x > xDim[0]) {
    var centerX = d[0].x;
    var app = [];
    //Don't want vertex point twice, so last point in app is ignored
    for (var i = d.length - 1; i > 0; i--) {
      app.push(newPoint(2*centerX-d[i].x,d[i].y));
    }
    d = app.concat(d);
  }

  //crunch
  if( d[d.length-1].y < yDim[1] && d[d.length-1].x < xDim[1]) {
    var centerX = d[d.length-1].x;
    var app = [];
    //Don't want vertex point twice, so first point in app is ignored
    for (var i = d.length - 2; i >= 0; i--) {
      app.push(newPoint(2*centerX-d[i].x,d[i].y));
    }
    d = d.concat(app);
  }
  if(keyPhrase == "") keyPhrase = "Series "+seriesNum;

  return {
    values       : d,
    omega        : omega,
    key          : keyPhrase,
    color        : color,
    strokeWidth  : DEFAULT_WIDTH,
  };
}

//omega = [r,m,/\] 
function adot(a, omega) {
  var omega_0 = omega[0]+omega[1]+omega[2];
  var rhs     = omega[0]/(a**2) + omega[1]/a + omega[2]*(a**2) + (1-omega_0);
  var f       = Math.sqrt(rhs);
  return f;
}

function midpoint_integration_step(a, omega, h) {
  var a_plus_half = a+h/2*adot(a,omega);
  if (a_plus_half<0) return a_plus_half*2-a; //just euler integrate it
  var anew =  a + h * adot(a_plus_half,omega);
  return anew;
}

function midpoint_integrate(a0, t0, omega, h) {
  var d = [newPoint(t0,a0)];

  //h>0: integrating right, h<0 integrating left
  var steps = xDim[1]/h;
  if (h<0) {
    //h=h/5;
    steps = xDim[0]/h;
  }

  for (n=1; n<=steps; n++) {
    var anew = midpoint_integration_step(d[n-1].y,omega,h);
    //bounce or crunch scenario
    if (isNaN(anew)) break;

    //stop calculating if outside of graph range
    //a cannot be negative so stop if <0
    //Don't want points way out of bounds, so we'll make a point on the bound
    //by linterping between the oob point and the last in bound point
    if (anew>yDim[1]) {
      //oob high
      var x = (yDim[1] - d[n-1].y) / (anew - d[n-1].y) * h + d[n-1].x;
      d.push(newPoint(x,yDim[1]));
      break; 
    }
    if (anew < 0) {
      //oob low
      var x = (0 - d[n-1].y) / (anew - d[n-1].y) * h + d[n-1].x;
      d.push(newPoint(x,0));
      break;
    }

    d.push(newPoint(n*h,anew)); //d[n] 
  }
  return d;
}

//helpers
////////////////////////////////////////////////////////////////////////////////
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
      //+0 for dark, 8 for light
      color += letters[Math.floor(Math.random() * 8)+0]; 
  }
  return color;
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function newPoint(a,b,c,s,f,src) {
  var point = {
    x: a,
    y: b,
  };
  if (c != undefined) {
    point['z'] = c;
  }
  if (s != undefined) {
    point['style'] = s;
  }
  if (f != undefined) {
    point['filter'] = f;
  }
  if (src != undefined) {
    point['source'] = src;
  }

  return point;
}

//surface functions
////////////////////////////////////////////////////////////////////////////////
function genCircleSeries(data) {
  var animationData = [];
  var steps = 40;

  for (var i = 0; i < data.values.length; i++) {
    var a = data.values[i].y*1.5;
    var t = Math.round(data.values[i].x*1000)/1000;
    animationData.push(newPoint(0,0,0,0,t));
    if (a<=0) {
      a = 0.01;
    }
    for (var phi = 0; phi <= 2*Math.PI; phi+=2*Math.PI/steps) {
      var x = a * Math.cos(phi);
      var y = a * Math.sin(phi);
      animationData.push(newPoint(x,y,0,0,t));
    }

  }
  return animationData;
}

function genGalaxySeries(data) {
  var animationData = [];

  for (var i = 0; i < data.values.length; i++) {
    var a = data.values[i].y*1.5;
    var t = Math.round(data.values[i].x*1000)/1000;
    if (a<=0) {
      a = 0.01;
    }

    var galaxySize;
    var galaxyToUniverseScale = 0.8; //experimental

    if (a<galaxyToUniverseScale) {
      galaxySize = a/galaxyToUniverseScale;
    }
    else {
      galaxySize = 1;
    }

    animationData.push(newPoint(0,    0,    0,galaxySize,t,theImg));
    animationData.push(newPoint(a/2,  0,    0,galaxySize,t,theImg));
    animationData.push(newPoint(-a/2, 0,    0,galaxySize,t,theImg));
    animationData.push(newPoint(0,    a/2,  0,galaxySize,t,theImg));
    animationData.push(newPoint(0,    -a/2, 0,galaxySize,t,theImg));
  }
  return animationData;
}

//Presets
////////////////////////////////////////////////////////////////////////////////
$("#benchmarkButton").click(function() {
  var omega = [0,0.3,0.7];

  setPreset(omega,"Benchmark");
})

$("#bounceButton").click(function() {
  var omega = [0,0.3,1.8];

  setPreset(omega,"Bounce");
})

$("#crunchButton").click(function() {
  var omega = [0,2.0,0.0];

  setPreset(omega,"Crunch");
})

$("#loiteringButton").click(function() {
  var omega = [0,0.3,1.7134];
  setPreset(omega,"Loitering");
})

function setPreset(omega,key) {
  setSliderValues(omega);

  var oldSeries = getData(highlighted);

  var newData = friedmann(omega,"",oldSeries.color);

  removeData(highlighted);
  addData(newData,highlighted);
  updateChart();

  highlight(highlighted);
}

//INPUT
////////////////////////////////////////////////////////////////////////////////
function selectLine(seriesIndex) {
  setSliderValues(getData(seriesIndex).omega);

  highlight(seriesIndex);
  loadAnimation(seriesIndex);
}

function setSliderValues(omega) {
  $("#radiationSlider").val(omega[0]);
  $("#matterSlider").val(omega[1]);
  $("#lambdaSlider").val(omega[2]);

  for (var i = 0; i < omega.length; i++) {
    updateDisplay(i,omega[i]);
  }
}

function getSliderValues() {
  var radiation = parseFloat($("#radiationSlider").val());
  var matter    = parseFloat($("#matterSlider").val());
  var lambda    = parseFloat($("#lambdaSlider").val());

  var omega = [radiation,matter,lambda];
  return omega;
}

function updateDisplay(inputNum,val) {
  var output;
  switch(inputNum) {
    case 0:
      output = $('#Rad-Val');
      break;
    case 1:
      output = $('#Mat-Val');
      break;
    case 2:
      output = $('#Lam-Val');
      break;
  }
  output.text(val.toFixed(2));
}

function inputChange(input, val) {
  var oldSeries = getData(highlighted);
  var newOmega  = oldSeries.omega;
  newOmega[input] = val;

  var newData = friedmann(newOmega,oldSeries.key,oldSeries.color);

  removeData(highlighted);
  addData(newData,highlighted);

  highlight(highlighted);
}

$('.input-slider').on('input', function() {
  stopAnimation();
  var val = parseFloat(this.value);
  var inputNum;
  switch(this.id) {
    case "radiationSlider":
      inputNum = 0;
      break;
    case "matterSlider":
      inputNum = 1;
      break;
    case "lambdaSlider":
      inputNum = 2;
      break;
  }
  updateDisplay(inputNum,val);
  inputChange(inputNum,val);
});

$('.input-slider').on('change', function() {
  loadAnimation(highlighted);
});



/* Managing Data */
////////////////////////////////////////////////////////////////////////////////
$("#doButton").click(function() {
  seriesNum++;
  addData(friedmann([0,0.3,0.7]));
  highlighted = chartData.length-1;
  selectLine(highlighted);
})

function removeData(index) {
  chartData.splice(index,1);
}

function getData(index) {
  return chartData[index];
}

function addData(data,index=undefined) {
  if(!data) return;

  if(index == undefined) {
    chartData.push(data);
  }
  else {
    chartData.splice(index,0,data); 
  }

  if(chartData.length > DATA_LIMIT) {
    chartData.shift();
    highlighted=highlighted-1;
  }

  updateChart();
  return data;
}

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