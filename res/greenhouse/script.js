$(document).ready( function() {

	var theCanvas   = document.getElementById("theCanvas");
  	var theContext  = theCanvas.getContext("2d");
  	var tempCanvas  = document.getElementById("tempCanvas");
  	var tempContext = tempCanvas.getContext("2d");
  	var tempHeight =0;
  	var tempDiffInFrames=fps/2.0;

  	var wDiffInFrames = fps/2.0


  	var Sslider = document.getElementById("Sslider");
  	var Vslider = document.getElementById("Vslider");
  	var hideParticles = document.getElementById("hideParticles");


  	var timer;
  	var w = theCanvas.width;
  	var h = theCanvas.height-70;

  	
  	var photonColor = "#E00000";
  	var solarColor = "#F9FF00";
  	var thermoColor = "#E00000";
  	tempContext.fillStyle =thermoColor;
  	var groundFlux=S;
  	var groundTemp=Math.sqrt(Math.sqrt(groundFlux/stefanBoltzmann));
  	var Nw = Math.round((ps*Math.exp(-L/R/groundTemp)/groundTemp)*V/R)+1;
  	var curNw=Nw;
  	var inLake=maxNw-Nw;


  	var Nco2 =10;
  	//var solarFlux = S/(h-solarMinY)*c*fps*2.5;
  	
  	var theParticles = [];
  	var N = 0;
  	var nitrogen =[]; 
  	var photons =[];
  	var solarPhotons=[];
  	function rand(min=0,max=1,isInt=false){
  		if(isInt) {
  			return Math.floor(Math.random()*(max-min))+min;
  		}
  		return Math.random()*(max-min)+min;
  	}

	function randomX() {
		return rand(r,w-2*r);
	}  	
	function randomY() {
		return rand(r+topOfAtmos,h-2*r);
	}
	function randomDir() {
		return rand(0,Math.PI*2);
	}
	function addParts(n,species) {
		for (var i = 0; i < n; i++) {
			theParticles.push(new Particle(randomX(),randomY(),randomDir(),species));
		};
	}
	function addN2(n){
		for (var i = 0; i < n; i++) {
			nitrogen.push(new Particle(randomX(),randomY(),randomDir(),n2));
		};
	}

	function addSolar(n) {
		for (var i = n - 1; i >= 0; i--) {
			solarPhotons.push(new solarPhoton(h));
			launchPhotonToSpace(60*Math.random()*c*t+(h-solarMaxY));
		};
	}

	function volcanicEmmision(n) {
		for (var i = 0; i < n; i++) {
			theParticles.push(new Particle(volcanoX,volcanoY,rand(0.2,Math.PI-.2),co2));
		};
	}

	function addWater(n) {
		for (var i = 0; i < n; i++) {
			theParticles.push(new Particle(rand(lakeX,lakeX+lakeW),lakeY-r,rand(0.2,Math.PI-.2),h2o));
		};
	}

	function launchPhotonToAtmos(){
		if (theParticles.length ==0) 
		{
			photons.push(new Photon(randomX(),h-pr,0,null));
			return;
		}
		var recieving = theParticles[rand(0,theParticles.length,true)];

		var maxSteps = h/c/t;
		var dests = [];
		var diff = [];
		for (var i = 0; i < maxSteps; i++) {
			dests.push(futurePos(recieving,i*t));
			diff.push(Math.abs((h-dests[i].y)/c/t-i));
		};
		var ind = diff.indexOf(Math.min.apply(null,diff));
		var theDest = dests[ind];
		var thePhoton = new Photon(theDest.x,h-pr,theDest.y,recieving);
		photons.push(thePhoton);
	}
	function launchPhotonToSpace(delay){
		photons.push(new Photon(randomX(),h+pr+delay,0,null));

	}

	function emitPhoton(part) {
		var theDest = h;
		if(Math.random()<=pup) {
			theDest=0;
		}
		var thePhoton = new Photon(part.x,part.y,theDest,null);
		photons.push(thePhoton);
	}

	function futurePos(part,dt) { //just observes
		
		var virtualParticle = new Particle(part.x,part.y,part.theta,part.species); //some hackey shit

		for( var i=0; i<dt; i+=t) {
			virtualParticle.move(w,h);
		}
		return virtualParticle
	}

	function update() {
		groundEmit();
		//Move everyting
		moveParts();
		//Draw everything
		drawAts();
		drawTemp();
		timer = window.setTimeout(update,1000/fps);
	}
	function science() {
		N = theParticles.length;
		S = Number(Sslider.value);
		var Sdiff = S-solarPhotons.length;
		if(Sdiff<0) {
			solarPhotons.splice(0,-Sdiff);
		}
		else if(Sdiff>0)
		{
			addSolar(Sdiff);
		}
		groundFlux = Math.round(S*(.05*N+1));
  		groundTemp=Math.sqrt(Math.sqrt(groundFlux/stefanBoltzmann));
  		if(groundTemp==0) groundTemp=2.725; //Tcmb


  		Nw = Math.round((ps*Math.exp(-L/R/groundTemp)/Math.pow(groundTemp,2)))+1;
  		console.log(Nw);
  		curNw = 0;
  		for (var i = theParticles.length - 1; i >= 0; i--) {
  			if(theParticles[i].species == h2o) curNw++;
  		};
  		inLake = maxNw-curNw;

  		if(curNw!= maxNw && curNw<Nw) {
  			var toAdd = Math.min(Nw-curNw,maxNw-curNw);
  			addWater(Math.round(Math.min(toAdd,5)));
  		}
  		else if(curNw>Nw) {
  			var toRemove = curNw-Nw;
  			var removed =0;
  			while(removed <toRemove) {
  				for (var i = 0; i <theParticles.length; i++) {
  					if(theParticles[i].species==h2o) {
  						theParticles.splice(i,1);
  						removed++;
  					}
  				};
  			}
  		}

  		var currCo2 = 0;
  		Nco2 = Number(Vslider.value);
  		for (var i = theParticles.length - 1; i >= 0; i--) {
  			if(theParticles[i].species == co2) currCo2++;
  		};
  		var co2Diff = Nco2-currCo2;
  		if(co2Diff>0) {
  			volcanicEmmision(Math.min(Nco2-currCo2,5));
  		}
  		else if(co2Diff<0){
  			var removed =0;
  			while(removed <-co2Diff) {
  				for (var i = 0; i <theParticles.length; i++) {
  					if(theParticles[i].species==co2) {
  						theParticles.splice(i,1);
  						removed++;
  					}
  				};
  			}
  		}
	}

	function groundEmit() {
		science();
  		var groundToAtmos = Math.min(Math.ceil(.1*N),S);
  		var groundToSpace = S-groundToAtmos/2;

  		var photsToSpace = 0;
  		var photsToAtmos =0;
  		for (var i = photons.length - 1; i >= 0; i--) {
  			phot = photons[i];
  			if(phot.dest == 0) {
  				photsToSpace++;
  			}
  			else if(phot.toRec != null) {
  				photsToAtmos++;
  			}
  		};
  		for( var i=0; i< (groundToAtmos-photsToAtmos); i++)
  		{
  			launchPhotonToAtmos();
  		};
  		for( var i=0; i< (groundToSpace-photsToSpace); i++)
  		{
  			launchPhotonToSpace(60*Math.random()*c*t);
  		};

	}
	function moveParts() {
		for (var i = 0; i < theParticles.length; i++) {
			part = theParticles[i];
			part.move(w,h);
			if(part.releasesPhoton) {
				emitPhoton(part);
			}
		};
		
		for (var i = 0; i < photons.length; i++) {
			photons[i].move(h);
			if(photons[i].absorbed()) {
				photons.splice(i,1);
			}
		};

		for(var i =0; i<solarPhotons.length; i++)
		{
			solarPhotons[i].move(h);
		}
		for(var i =0; i<nitrogen.length; i++)
		{
			nitrogen[i].move(h);
		}
	}

	function drawTemp() {
		tempContext.clearRect(0,0,tempCanvas.width, tempCanvas.height);
		var goalHeight=(groundTemp-200)*dT;
		if(tempHeight!=goalHeight) {
			var diff = goalHeight-tempHeight;
			tempHeight= tempHeight+diff/tempDiffInFrames;
		}
		if(tempHeight<0) tempHeight=0;
		tempContext.fillRect(thermoBaseX,thermoBaseY-tempHeight,thermoWidth,tempHeight);
	}

	function drawAts() { //draws atmosphere canvas
		theContext.clearRect(0,0,theCanvas.width, theCanvas.height);
		theContext.fillStyle="blue"
		var cld = inLake*lakeD/maxNw;
		theContext.fillRect(170,490-cld,183,cld);
		var n = theParticles.length;
		for (var i = 0; i <n; i++) {
			var part = theParticles[i];
			if(part.excited.length>=1) {
				if(!hideParticles.checked) {
					theContext.beginPath();
					theContext.arc(part.x,part.y,r+2,0,2*Math.PI);
					theContext.fillStyle = "red"
					theContext.fill();
				}
			}
			if(!hideParticles.checked) {
				theContext.beginPath();
				theContext.arc(part.x,part.y,r,0,2*Math.PI);
				theContext.fillStyle = part.species.color;
				theContext.fill();
			}
		};
		n = nitrogen.length;
		for (var i = 0; i <n; i++) {
			var part = nitrogen[i];
			if(!hideParticles.checked) {
				theContext.beginPath();
				theContext.arc(part.x,part.y,r,0,2*Math.PI);
				theContext.fillStyle = part.species.color;
				theContext.fill();
			}
		};
		
		n = photons.length;
		var offscreen =[];
		for (var i = 0; i <n; i++) {
			var part = photons[i];

			if(part.y<0) {
				offscreen.push(i);
			}
			if(part.y>h && part.dest!=0) {
				offscreen.push(i);
			}
			else {
				theContext.beginPath();
				theContext.arc(part.x,part.y,pr,0,2*Math.PI);
				theContext.fillStyle = photonColor
				theContext.fill();
			}
		};
		for (var i=offscreen.length-1; i>=0; i--){
			photons.splice(offscreen[i],1);
		}

		n = solarPhotons.length;
		offscreen=[];
		for(var i=0; i<n; i++) {
			var part = solarPhotons[i];
			if(part.y>h) {
				offscreen.push(i);
			}
			else {
				theContext.beginPath();
				theContext.arc(part.x,part.y,pr,0,2*Math.PI);
				theContext.fillStyle = solarColor
				theContext.fill();
			}
		}
		for (var i=offscreen.length-1; i>=0; i--){
			solarPhotons[offscreen[i]].y = (solarMaxY-solarMinY)*Math.random()+solarMinY;
			solarPhotons[offscreen[i]].x = (solarMaxX-solarMinX)*Math.random()+solarMinX;
		}

	}
	
	document.getElementById("startButton").onclick = function() {
		window.clearTimeout(timer);
		update();
	}
	document.getElementById("stopButton").onclick = function() {
		window.clearTimeout(timer);
	}	
	addParts(10,n2);
	addParts(1,h2o);
	addSolar(S);
	drawAts();
	theContext.fillStyle="blue"
	theContext.fillRect(170,430,183,60);
	
});