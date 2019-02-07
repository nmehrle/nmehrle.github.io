function Asset(x, y, width, height, v) {
  //x, y are center position

  this.x = x;
  this.y = y;

  this.width  = (width  === undefined ? 50 : width);
  this.height = (height === undefined ? 50 : height);

  this.setEdges();

  this.v = (v === undefined ? 0 : v);
}

Asset.prototype.setEdges = function() {
  this.left   = this.x - this.width/2;
  this.right  = this.x + this.width/2;

  this.bottom = this.y + this.height/2;
  this.top    = this.y - this.height/2;
}

Asset.prototype.move = function() {
  this.x = this.x+this.v;
  this.setEdges();
}

Asset.prototype.draw = function(ctx, zoom, shift) {
  if (zoom === undefined) {
    zoom = 1;
  }

  if (shift === undefined) {
    shift = 0;
  }

  ctx.fillRect(this.left, this.top, this.width, this.height);
  ctx.fill();
}
  
//////IMG ASSET
  function ImgAsset(img, x, y, width, height, v) {
      Asset.call(this, x, y, width, height, v);

      this.img = img;
  }

  ImgAsset.prototype = Object.create(Asset.prototype);
  ImgAsset.prototype.constructor = ImgAsset;

  ImgAsset.prototype.draw = function(ctx, zoom, shift) {
    if (zoom === undefined) {
      zoom = 1;
    }

    if (shift === undefined) {
      shift = 0;
    }

    ctx.drawImage(this.img, zoom*(this.left + shift), this.bottom-(1+zoom)*this.height/2, zoom*this.width, zoom*this.height);
  }

////////Animated
  function Animated(static, spritesheet, frames, x, y, width, height, v) {
    Asset.call(this, x, y, width, height, v);

    this.static = static;
    this.spritesheet = spritesheet;
    this.frames = frames;
    this.frameIndex = 0;
    this.playing = false;
  }

  Animated.prototype = Object.create(Asset.prototype);
  Animated.prototype.constructor = Animated;

  Animated.prototype.draw = function(ctx,zoom,shift) {
    if (zoom === undefined) {
      zoom = 1;
    }

    if (shift === undefined) {
      shift = 0;
    }

    if(this.frameIndex == this.frames) {
      this.frameIndex = 0;
      this.playing = false;
    }

    if(this.playing) {
      //TODO


      // context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
      ctx.drawImage(this.spritesheet, 
        this.frameIndex*(this.spritesheet.width/this.frames), 0 ,
        this.spritesheet.width/this.frames, this.spritesheet.height,
        zoom*(this.left + shift), this.bottom-zoom*this.height,
        zoom*this.spritesheet.width/this.frames, zoom*this.height);

      this.frameIndex += 1;
    }
    else { 
      ctx.drawImage(this.static, zoom*(this.left + shift), this.bottom-(1+zoom)*this.height/2, zoom*this.width, zoom*this.height);
    }
  }

  Animated.prototype.toggleAnimation = function() {
    this.playing = !this.playing;

    //TODO SET STATIC
  }

////////WAVEFRONT
  function Wavefront(x, y, r, v) {
    this.r = (r === undefined ? 10 : r);
    Asset.call(this, x, y, this.r*2, this.r*2, v);

    this.setEdges();

    this.arcMin = -0.25 * Math.PI;
    this.arcMax =  0.25 * Math.PI;
    this.rGrow  = 1;
  }

  Wavefront.prototype = Object.create(Asset.prototype);
  Wavefront.prototype.constructor = Wavefront;

  Wavefront.prototype.setEdges = function() {
    this.left   = this.x - this.r;
    this.right  = this.x + this.r;

    this.bottom = this.y + this.r;
    this.top    = this.y - this.r;
  }

  Wavefront.prototype.move = function() {
    this.x = this.x+this.v;
    this.r = this.r+this.rGrow;
    this.y = this.y + this.rGrow;
    this.setEdges();
  }

  Wavefront.prototype.draw = function(ctx, zoom, shift) {
    if (zoom === undefined) {
      zoom = 1;
    }

    if (shift === undefined) {
      shift = 0;
    }

    ctx.beginPath();
    ctx.arc(zoom*(this.x+shift), this.y-(zoom*this.r), zoom*this.r, this.arcMin, this.arcMax);
    ctx.fillStyle = 'black';
    ctx.lineWidth = 4;
    ctx.stroke();
  }