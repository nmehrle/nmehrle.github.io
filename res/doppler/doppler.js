var doppler = {};

$(document).ready(function() {
	setConsts();
	setVars();
	setVariableControls();
	setStaticControls();

	makeFreqGraph();

	update();
	// for (let i=0; i<500; i++) {
	// 	update();
	// }
});

window.onresize = function() {
	doppler.cnv.width = $(".animation-container").width();
	doppler.rulerCnv.width = doppler.cnv.width;

	doppler.cnv.height = $(".animation-container").height() - 85;
	doppler.rulerCnv.height = 85;
	reset();
}

//Debug
	$("#step").click(function() {
		update();
	});
	$("#add500t").click(function() {
		for (let i=0; i<500; i++) {
			update();
		}
	});

$('#settings-btn').on('click', function() {
	stopAnimiation();
	$('.settings-container').toggleClass("hidden");
});

$('.settings-control').on('change', function() {
	reset();
});

$('input[name=scenario]').on('change', function() {
	reset();	
});

//				SETUP		 		//
	function setConsts() {
		doppler.cnv = document.getElementById("main-canvas");
		doppler.ctx = doppler.cnv.getContext('2d');

		doppler.rulerCnv = document.getElementById("ruler-canvas");
		doppler.rulerCtx = doppler.rulerCnv.getContext('2d');

		doppler.cnv.width = $(".animation-container").width();
		doppler.rulerCnv.width = doppler.cnv.width;

		doppler.cnv.height = $(".animation-container").height() - 85;
		doppler.rulerCnv.height = 85;

		doppler.colorScale = chroma.scale(['#8b0000','#942619','#903327','#7e362b','#5f2f27','#371f1b','#000000','#1f223e','#2d346b','#323b8a','#303698','#232495','#000080']);
		doppler.HIT 						 	= "Hit";
		doppler.FIRED 						= "Fired";

		doppler.FPS  							= 60;		//frames per second

		doppler.xScaleLength = 500;
		doppler.xExtent = 4 * doppler.xScaleLength;

		doppler.xScale;
		doppler.vcXScale;
		// var high = new Pizzicato.Sound({ 
		//         source: 'wave',
		//         options: { type: 'sine', frequency: 440, attack: 2 }
		// });
		// var low = new Pizzicato.Sound({ 
		//         source: 'wave',
		//         options: { type: 'sine', frequency: 400 }
		// });
		// var group = new Pizzicato.Group([high, low]);
		// var delay = new Pizzicato.Effects.Delay({
		//     feedback: 1,
		//     time: 0.22,
		//     mix: 0.75
		// });
		// group.play();
		// setTimeout(function() {
		// 	group.stop();
		// }, 2000);

	}

	function parseScenario() {
		doppler.scenario = parseFloat($('input[name=scenario]:checked').val());

		// if(doppler.scenario == 0) {
			doppler.sink = new ImgAsset(document.getElementById('target'),
				doppler.cnv.width-150, 
				doppler.cnv.height/2,
				100,
				100,
				0);

			doppler.source = new Animated(document.getElementById('bow'),
				document.getElementById('bow-sprite'),
				44,
				150,
				doppler.cnv.height/2,
				38,
				152,
				0);


			let pvalue = 0;

			if (pvalue == 0) {
				doppler.projectile = {
					make: function() {
						return new ImgAsset(document.getElementById('arrow'),
							doppler.source.x,
							doppler.source.y,
							50, 8, 
							doppler.PROJECTILE_SPEED);
					}
				}
			}
			else if (pvalue == 1) {
				doppler.projectile = {
					make: function() {
						return new Wavefront(
							doppler.source.x,
							doppler.source.y,
							8, 
							doppler.PROJECTILE_SPEED);
					}
				}
			}
			
			// doppler.FIRE_SOUND = new Pizzicato.Sound({ 
			//     source: 'file',
			//     options: { path: ['audio/cannon.wav', 'audio/cannon.mp3'] }
			// });

			// doppler.HIT_SOUND = new Pizzicato.Sound({ 
			//     source: 'file',
			//     options: { path: ['audio/hit.wav', 'audio/hit.mp3'] }
			// });

		// }

	}

	function setVars() {

		parseScenario();

		doppler.PROJECTILE_SPEED 	= parseFloat($("#projectile-speed-control").val());
		doppler.FIRE_FREQ 				= parseFloat($("#fire-frequency-control").val()); //how many cannonbals fired per second	

		doppler.PLAY_FIRE_SOUND = false;
		doppler.PLAY_HIT_SOUND  = false;

		//Animation
		doppler.time = -1;			//time counter

		doppler.projectiles = [];
		doppler.animationInterval;

		// Plot Elements
		doppler.data = [];
		doppler.plotDataset = new Plottable.Dataset(doppler.data);
		
	}

	function setStaticControls() {
		$('#play-pause-btn').click(function() {
			var controller = $(this).children().first();
			$('.settings-container').addClass('hidden');
			if(controller.hasClass("play")) {
				//currently paused
				startAnimation();
			}	
			else {
				//currently playing
				stopAnimiation();
			}
		});

		$("#refresh-btn").click(function() {
			$('.settings-container').addClass('hidden');
			reset();
		});

		$(".sound-btn").click(function() {
			var me = $(this);
			me.children().first().toggleClass('sound-off');
			me.children().first().toggleClass('sound-on');

			if(me.is("#fired-sound-btn")) {
				doppler.PLAY_FIRE_SOUND = !doppler.PLAY_FIRE_SOUND;
			}
			else if(me.is("#hit-sound-btn")) {
				doppler.PLAY_HIT_SOUND = !doppler.PLAY_HIT_SOUND;
			}
		});

	}

	function setVariableControls() {
		$.each($('.speed-control'), function() {
			$(this).attr('min','-2')
				.attr('max','2')
				.attr('step', '0.05');

			$(this).val(0);

			let subject;
			switch(this.id) {
				case "sink-speed-control":
					subject = doppler.sink;
					break;
				case "source-speed-control":
					subject = doppler.source;
					break;
				default:
					return;
			}
			$(this).on('input', function() {
				subject.v = parseFloat(this.value);
			});
		});

		$("#source-stop-btn").click(function() {
			stopObj(doppler.source);
		});

		$("#sink-stop-btn").click(function() {
			stopObj(doppler.sink);
		});
	}

	function makeFreqGraph() {
		// Main Graph 
		let plot;
			doppler.xScale = new Plottable.Scales.Linear();
			let yScale = new Plottable.Scales.Category()
				.domain([doppler.FIRED,doppler.HIT]);
			let xScale = doppler.xScale;

			let xAxis = new Plottable.Axes.Numeric( xScale, "bottom");
			let yAxis = new Plottable.Axes.Category(yScale, "left")
				.yAlignment("center");

			plot = plotSkeleton(xScale, yScale)
				.size(15)
				.attr("stroke-width", "2.5");

		// View Control
		let viewControl;
			doppler.vcXScale = new Plottable.Scales.Linear()
				.domain([0, doppler.xExtent]);
			let vcXScale = doppler.vcXScale;
			let vcYScale = new Plottable.Scales.Category()
				.domain([doppler.FIRED,doppler.HIT]);
			let vcXAxis = new Plottable.Axes.Numeric(vcXScale, "bottom");

			viewControl = plotSkeleton(vcXScale, vcYScale)
				.size(6)
				.attr("stroke-width", "1");

		// Interactions
		// let dragbox;
		let dragbox, vcDragbox;
			dragbox = makeMainDragbox(xScale, vcXScale, plot, viewControl);

			// vcDragbox = makeVCDragbox(xScale, vcXScale);

		// Rendering
			let mainGroup = new Plottable.Components.Group([dragbox, plot]);
			let vcGroup = new Plottable.Components.Group([vcDragbox,viewControl]);
			new Plottable.Components.Table([
					[ yAxis , mainGroup ],
					[ null  , xAxis     ],
					[ null  , vcGroup   ],
					[ null  , vcXAxis   ]
				]).rowWeight(2,0.5)
				.renderTo("svg#freq-graph");

		xScale.domain([0,doppler.xScaleLength]); // set here to draw dragbox on load
	}

	function makeMainDragbox(mainScale, miniScale, plot, viewControl) {
		let dragbox = new Plottable.Components.XDragBoxLayer()
			.resizable(true)
			.onDrag(function(box) {
				plot.selections().attr("stroke", "none")
					.attr('fill', function(d) { return d.redshift; });
				plot.entitiesIn(box).forEach(function(e) {
					d3.select(e.selection[0][0])
						.attr("stroke", function(d) { return d.redshift; })
						.attr("fill", "#fff");
				});

				let vcBox = {
					topLeft: {
						x: miniScale.scale(mainScale.invert(box.topLeft.x)),
						y: box.topLeft.y
					},
					bottomRight: {
						x: miniScale.scale(mainScale.invert(box.bottomRight.x)),
						y: box.bottomRight.y
					}
				}
				viewControl.selections().attr("stroke", "none")
					.attr('fill', function(d) { return d.redshift; });
				viewControl.entitiesIn(vcBox).forEach(function(e) {
					d3.select(e.selection[0][0])
						.attr("stroke", function(d) { return d.redshift; })
						.attr("fill", "#fff");
				});


			});

		return dragbox;
	}

	function makeVCDragbox(mainScale, miniScale) {
		let dragbox = new Plottable.Components.XDragBoxLayer()
			.resizable(true)
			.movable(true)
			.onDrag(function(bounds) { // normal drag
			  let min = miniScale.invert(bounds.topLeft.x);
			  let max = miniScale.invert(bounds.bottomRight.x);
			  mainScale.domain([min, max]);
			})
			.onDragEnd(function(bounds) { //just a click
			  if (bounds.topLeft.x === bounds.bottomRight.x) {
			    mainScale.domain(miniScale.domain());
			    dragbox.boxVisible(false);
			  }
			});

		mainScale.onUpdate(function() {
			let xDomain = mainScale.domain();
			if (xDomain[0] == miniScale.domain()[0] &&
					xDomain[1] == miniScale.domain()[1]) {
				dragbox.boxVisible(false);
			}
			else {
				dragbox.boxVisible(true);
				dragbox.bounds({
				  topLeft: { x: miniScale.scale(xDomain[0]), y: null },
				  bottomRight: { x: miniScale.scale(xDomain[1]), y: null }
				});	
			}
		});
		return dragbox;
	}

	function plotSkeleton(xScale, yScale) {
		let plot = new Plottable.Plots.Scatter()
		  .x(function(d) { return d.t; }, xScale)
		  .y(function(d) { return d.eventType; }, yScale)
		  .addDataset(doppler.plotDataset)
		  .attr('fill', function(d) { return d.redshift; })
		  .attr('opacity',1) 
		  .attr('transform', function(d) {
		  	let translate = "translate(";
		  		translate += xScale.scale(d.t)+", ";
		  		translate += yScale.scale(d.eventType)+")";
		  	if(d.eventType == doppler.HIT) {
		  		return translate+" rotate(45)";
		  	}
		  	else {
		  		return translate;
		  	}
		  })
		  .symbol(function(d) {
		  	if(d.eventType == doppler.HIT) {
		  		return new Plottable.SymbolFactories.cross();
		  	}
		  	else {
		  		return new Plottable.SymbolFactories.circle();
		  	}
			});
		return plot;
	}
/////////////////////////////////

//		Running Animation 		//
	function startAnimation() {
		doppler.animationInterval = setInterval(update, 1000/doppler.FPS);

		$("#play-pause-btn > div").addClass("pause");
		$("#play-pause-btn > div").removeClass("play");
	}

	function stopAnimiation() {
		clearInterval(doppler.animationInterval);

		// doppler.FIRE_SOUND.stop();
		// doppler.HIT_SOUND.stop();

		$("#play-pause-btn > div").addClass("play");
		$("#play-pause-btn > div").removeClass("pause");
	}

	function update() {
		clearCanvas();

		let {sink, source} = doppler;

		processMove(source);
		processMove(sink);

		processProjectiles();

		let [zoom, shift] = calculateZoomShift();
		drawAssets(zoom,shift);
		drawRuler(zoom,shift);

		updateAxes();

		doppler.time++;
	}

	function reset() {
		//clear information
		stopAnimiation();
		clearCanvas();

		setVars();
		setVariableControls();

		//reset graph
		$(".freq-graph-container").empty().append("<svg id='freq-graph'></svg>");
		makeFreqGraph();


		//reset freq-display
		updateFreq(doppler.HIT, NaN);	
		updateFreq(doppler.FIRED, NaN);		

		update();
	}

	function stopObj(obj) {
		let {source, sink} = doppler;

		let scID = "";
		if (obj === source) {
			scID = "#source-speed-control";
		}
		else if(obj === sink) {
			scID = "#sink-speed-control";
		}

		$(scID).val(0);
		obj.v = 0;
	}
/////////////////////////////////

//	 		Animation Helpers				//
	function clearCanvas() {
		let {cnv, ctx, rulerCnv, rulerCtx} = doppler;
		ctx.clearRect(0,0,cnv.width,cnv.height);
		rulerCtx.clearRect(0,0,rulerCnv.width,rulerCnv.height);
	}

	//Checks for Source/Sink Collisions
	function processMove(obj) {
		let {source, sink} = doppler;
		let tolerance = 10;

		if(obj === source && obj.right + obj.v >= sink.left - tolerance) {		
			//has or will hit sink - tolerance
			//set so obj is right against limit

			obj.x = sink.left - tolerance - obj.width/2;
			stopObj(obj);
		}
		else if(obj === sink && obj.left + obj.v <= source.right + tolerance) {
			obj.x = source.right + tolerance + obj.width/2;
			stopObj(obj);
		}

		obj.move();
	}

	//makes new projectiles, removes hit projectiles, moves rest
	function processProjectiles() {
		let {time, FPS, FIRE_FREQ, projectiles} = doppler;

		//Fire New Projectiles:

		// spritesheet scene 28 is add new projectile
		if(time%(Math.round(FPS/FIRE_FREQ)) == 0) {
			// start animation

		}


		if(time%(Math.round(FPS/FIRE_FREQ)) == 28) {
			projectiles.push(doppler.projectile.make());
			logEvent(doppler.FIRED);
		}

		//Move rest of projectiles
		for (let i = projectiles.length - 1; i >= 0; i--) {
			projectiles[i].move();

			if(hasHitTarget(projectiles[i])) {
				projectiles.splice(i,1);
				logEvent(doppler.HIT);
			}
		}
	}

	function hasHitTarget(projectile) {
		return ( (projectile.right) >= (doppler.sink.x));
	}

	function calculateZoomShift() {
		let {cnv, sink, source, projectiles} = doppler;


		let zoom  = 1;
		let shift = 0;

		let fullExtent = (sink.right - source.left);
		if (fullExtent > cnv.width) {
			//zoom out
			zoom  = (cnv.width / fullExtent);

		}

		if (source.left < 0 || sink.right > cnv.width) {
			//must shift
			if (source.left <= 0) {
				//shift right
				shift = -source.left;

			}
			else if (zoom*sink.right > cnv.width) {
				//shift left
				shift = -(sink.right - cnv.width);
				if (-shift > doppler.source.left) {
					shift = -doppler.source.left;
				}
			}
		}

		return [zoom, shift];
	}

	function drawAssets(zoom, shift) {
		let {cnv, ctx, sink, source, projectiles} = doppler;

		sink.draw(ctx, zoom, shift);
		source.draw(ctx, zoom, shift);

		for (let i = projectiles.length - 1; i >= 0; i--) {
			projectiles[i].draw(ctx, zoom, shift);
		}
	}

	function drawRuler(zoom, shift) {
		let {cnv, rulerCnv, rulerCtx, sink, source} = doppler;

		let leftExtreme  = Math.min(source.left, 0);
		let rightExtreme = Math.max(sink.right, cnv.width); //intentionally main canvas for paranoia reasons

		

		let rulerBreaks = [0.115, 0.3, 0.65, 1];
		let rulerScales = [10   , 5   , 2.5 , 1];
		let ind = rulerBreaks.findIndex(function(b) {
			return zoom <= b;
		});
		let rulerScale = rulerScales[ind]*100;

		let rulerStart = Math.floor(leftExtreme/rulerScale-1)*rulerScale;
		let rulerEnd   = Math.ceil(rightExtreme/rulerScale)*rulerScale;

		rulerCtx.font      = "20px Arial";
		rulerCtx.textAlign = "center";

		for (let x = rulerStart; x <= rulerEnd; x+=rulerScale/4) {
			//Drawing Ruler
			let markScale = 1;
			switch(Math.abs(x % rulerScale)) {
				case 0:
					markScale = 4;
					break;
				case rulerScale/2:
					markScale = 2.8;
					break;
				default:
					markScale = 1.5;
			}

			let renderX = zoom*(x+100+shift);
			let renderY = 10;
			let width   = Math.min(zoom*5*rulerScale/100,5);
			let height  = 12.5 * markScale ;
			rulerCtx.fillRect(renderX-width/2, renderY + 50, width, -height);

			//Labeling Ruler
			let label = x/100+' m';
			if(Math.abs(x%rulerScale) == 0 && renderX>0 && renderX<cnv.width) {
				rulerCtx.fillText(label,renderX,renderY+75);
			}
		}
	}

	function updateAxes() {
		let {time, xScaleLength, xExtent, xScale, vcXScale} = doppler;

		// update axis in freqgraph based on time
		if(time > xScaleLength) {
			xScale.domain([time-xScaleLength,time]);
		}

		if(time > xExtent) {
			vcXScale.domain([0, time]);
		}
	}

/////////////////////////////////

function soundHandler(eventType) {
	if(eventType == doppler.FIRED && doppler.PLAY_FIRE_SOUND) {
		doppler.FIRE_SOUND.stop();
		doppler.FIRE_SOUND.play();
	}
	else if(eventType == doppler.HIT && doppler.PLAY_HIT_SOUND) {
		doppler.HIT_SOUND.stop();
		doppler.HIT_SOUND.play();
	}
}

//	 		Frequency Graph Functions				//
	function logEvent(eventType) {
		let t = doppler.time; // save current time;
		let f = calcFreq(t, eventType);

		doppler.data.push({
			t: t, 
			eventType: eventType, 
			f: f,
			redshift: setRedshift(f)
		});
		doppler.plotDataset.data(doppler.data);

		// soundHandler(eventType);
		updateFreq(eventType, f);
	}

	function setRedshift(f) {
		if(isNaN(f)){
			return doppler.colorScale(0.5).hex();
		}
		return doppler.colorScale(f/doppler.FIRE_FREQ - 0.5).hex();
	}

	function calcFreq(t, eventType) {
		let last;
		let data = doppler.data;

		for (let i = data.length - 1; i >= 0; i--) {
			if(data[i].eventType == eventType) {
				last = data[i].t;
				break;
			}
		}

		let f = doppler.FPS/(t-last);
		return f;
	}

	function updateFreq(eventType, f) {
		if(isNaN(f)) {
			f = 0;
		}
		if (eventType == doppler.FIRED) {
			$("#fired-freq").html(Number(f).toFixed(2));
		}
		if (eventType == doppler.HIT) {
			$("#hit-freq").html(Number(f).toFixed(2));
		}
	}
/////////////////////////////////


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