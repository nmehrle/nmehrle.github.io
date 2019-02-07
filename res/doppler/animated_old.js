function Animated(x, y, width, height, v) {
  //x, y are center position

  this.x = x;
  this.y = y;

  this.width  = (width  === undefined ? 50 : width);
  this.height = (height === undefined ? 50 : height);

  this.setEdges();

  this.v = (v === undefined ? 0 : v);
}

Animated.prototype.setEdges = function() {
  this.left   = this.x - this.width/2;
  this.right  = this.x + this.width/2;

  this.bottom = this.y + this.height/2;
  this.top    = this.y - this.height/2;
}

Animated.prototype.move = function() {
  this.x = this.x+this.v;
  this.setEdges();
}

Animated.prototype.zoomShiftDraw = function(ctx, zoom, shift) {
  if (shift === undefined) {
    shift = 0;
  }

  if (zoom === undefined) {
    zoom = 1;
  }

  ctx.fillRect(this.left, this.top, this.width, this.height);
  ctx.fill();
}

Animated.prototype.draw = function(ctx) {
  this.zoomShiftDraw(ctx, 1, 0);
}


// CANNONBALL
  function Cannonball(x, y, r, v) {
    this.r = (r === undefined ? 10 : r);
    Animated.call(this, x, y, this.r*2, this.r*2, v);

    this.setEdges();
  }

  Cannonball.prototype = Object.create(Animated.prototype);
  Cannonball.prototype.constructor = Cannonball;

  Cannonball.prototype.setEdges = function() {
    this.left   = this.x - this.r;
    this.right  = this.x + this.r;

    this.bottom = this.y + this.r;
    this.top    = this.y - this.r;
  }

  Cannonball.prototype.zoomShiftDraw = function(ctx, zoom, shift) {
    if (shift === undefined) {
      shift = 0;
    }

    if (zoom === undefined) {
      zoom = 1;
    }

    ctx.beginPath();
    ctx.arc(zoom*(this.x+shift), this.y-(zoom*this.r), zoom*this.r, 0, 2*Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
  }

//WaveFront
  function WaveFront(x, y, r, v) {
    Cannonball.call(this, x, y ,r, v);

    this.arcMin = -0.25 * Math.PI;
    this.arcMax =  0.25 * Math.PI;
    this.rGrow  = 1;
  }

  WaveFront.prototype = Object.create(Cannonball.prototype);
  WaveFront.prototype.constructor = WaveFront;

  WaveFront.prototype.move = function() {
    this.x = this.x+this.v;
    this.r = this.r+this.rGrow;
    this.y = this.y + this.rGrow;
    this.setEdges();
  }

  WaveFront.prototype.zoomShiftDraw = function(ctx, zoom, shift) {
    if (shift === undefined) {
      shift = 0;
    }

    if (zoom === undefined) {
      zoom = 1;
    }

    ctx.beginPath();
    ctx.arc(zoom*(this.x+shift), this.y-(zoom*this.r), zoom*this.r, this.arcMin, this.arcMax);
    ctx.fillStyle = 'black';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // function SineWave()

// Images
  function AnimatedImg(img, x, y, width, height, v) {
    Animated.call(this, x, y, width, height, v);

    this.img = img;
  }

  AnimatedImg.prototype = Object.create(Animated.prototype);
  AnimatedImg.prototype.constructor = AnimatedImg;

  AnimatedImg.prototype.zoomShiftDraw = function(ctx, zoom, shift) {
    if (shift === undefined) {
      shift = 0;
    }

    if (zoom === undefined) {
      zoom = 1;
    }

    ctx.drawImage(this.img, zoom*(this.left + shift), this.bottom-zoom*this.height, zoom*this.width, zoom*this.height);
  }