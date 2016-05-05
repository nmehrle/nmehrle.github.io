function Particle(x,y,th,species) {
	this.x = x;
	this.y = y;
	this.theta = th;
	this.excited=[];
	this.species=species
	this.releasesPhoton =false;
}

Particle.prototype.move = function(w,h) {
	this.releasesPhoton=false;
	var dx = v*t*Math.cos(this.theta);
	var dy = -v*t*Math.sin(this.theta); //negative b/c y=0 is top
	var newx = this.x+dx;
	var newy = this.y+dy;

	if( (newx+r>=w) || (newx-r<=0) ) { //hit side walls
		var newTheta = Math.PI - this.theta;
		if(newTheta<0) {newTheta=newTheta+Math.PI*2};
		if(newTheta>2*Math.PI) {newTheta=newTheta-Math.PI*2};
		newx = this.x-dx
		this.theta = newTheta;
	}
	if( (newy+r>=h) || (newy-r<=topOfAtmos)) { //hit earth or top of atmos.
		var newTheta = 2*Math.PI-this.theta;
		newy = this.y-dy;
		this.theta=newTheta
	}
	this.x=newx;
	this.y=newy;
	
	var deexcite = [];
	for (var i = this.excited.length - 1; i >= 0; i--) {
		this.excited[i]--;
		if(this.excited[i]<=0) {
			this.releasesPhoton=true;
			deexcite.push(i);
		}
	};
	for (var i = deexcite.length - 1; i >= 0; i--) {
		this.excited.splice(deexcite[i],1);
	};
};


function Photon(x,y,dest,toRec) {
	this.x=x;
	this.y=y;
	this.dest=dest;
	this.toRec = toRec;
}

Photon.prototype.move = function(h) {
	var dy = -c*t;
	if(this.dest >= h) {
		dy=-dy;
	}
	this.y = this.y+dy;
}

Photon.prototype.absorbed = function() {
	if( this.toRec!= null && Math.abs(this.dest-this.y) <= c*t) {
		if(Math.random()<=this.toRec.species.absorbP) {
			this.toRec.excited.push(excitedTime);
			return true;
		}
	}
	return false;
}

function solarPhoton(h) {
	this.x = (solarMaxX-solarMinX)*Math.random()+solarMinX;
	this.y = (solarMaxY-solarMinY)*Math.random()+solarMinY;
	this.delay = Math.floor(Math.random() *(h/(c*t)+1));
}

solarPhoton.prototype.move = function(h) {
	if(this.delay<=0) {
		this.y = this.y+c*t;
	}
	else{
		this.delay--;
	}
}

