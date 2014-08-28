canvasWidth = 720.0;
canvasHeight = 400.0;

length = 70.0; // 5'10"
thickness = 2.75;

scalar = (canvasWidth - 10) / length;


// controls
var widthSlider,
    tailWidthSlider;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  
  stroke(0);
  noFill();
  
  // Controls
  widthSlider = createSlider(0, 255, 127);
  tailWidthSlider = createSlider(0, 255, 127);
  
  board = new Surfboard(70, 2.75);
}

function draw() {
  background(255);
  translate(5, 5);
  scale(scalar);
  strokeWeight(1.5 / scalar);
  
  board.draw();
}

function Point(x, y) {
  this.x = x;
  this.y = y;
  
  this.draw = function() {
    vertex(this.x, this.y);
  };
}

function Vector(o, theta, r) {
  this.o      = o;
  this.theta  = theta;
  this.r      = r;
  this.v      = new Point(o.x + r * Math.cos(2 * Math.PI * theta),
                          o.y + r * Math.sin(2 * Math.PI * theta));
}

function BezierCurve(v1, v2) {
  this.v1 = v1;
  this.v2 = v2;
  
  this.draw = function() {
    bezierVertex(this.v1.v.x, this.v1.v.y, this.v2.v.x, this.v2.v.y, this.v2.o.x, this.v2.o.y);
  };
}

function Shape() {
  this.vectors = [];
  
  this.addVector = function(v) {
    this.vectors.push(v);
  };
  
  this.draw = function() {
    beginShape();
    this.vectors.forEach(function(v) {
      v.draw();
    })
    endShape();
  };
}

function Surfboard(len, thickness) {
  this.len                = len;
  this.thickness          = thickness;
  this.tailVolume         = 0.3;
  this.noseVolume         = 0.6;
  this.widePointDistance  = 0.4;
  
  this.width = function() {
    return widthSlider.value() / 255.0 * 20.0 + 10.0;
  };
  
  this.tailWidth = function() {
    return tailWidthSlider.value() / 255.0 * this.width();
  };
  
  this.tailPoint = function() {
    return new Point(0, this.width() / 2.0);
  };
  
  this.tailCornerPoint = function(isLeft) {
    var p;
    if (isLeft) {
      p = new Point(0, (this.width() - this.tailWidth()) / 2.0);
    } else {
      p = new Point(0, (this.width() + this.tailWidth()) / 2.0);
    }
    return p;
  };
  
  this.widePoint = function(isLeft) {
    var p;
    if (isLeft) {
      p = new Point(this.len * this.widePointDistance, 0);
    } else {
      p = new Point(this.len * this.widePointDistance, this.width());
    }
    return p;
  };
  this.widePointCurve = function(isLeft) {
    var p = this.widePoint(isLeft);
    var tp = this.tailCornerPoint(isLeft);
    var tv = new Vector(tp, 0, 0);
    var wpv = new Vector(p, 0.5, this.tailVolume * this.len);
    var c = new BezierCurve(tv, wpv);

    return c;
  };
  
  this.nosePoint = function() {
    return new Point(this.len, this.width() / 2.0);
  };
  this.noseCurve = function(isLeft) {
    var wp = this.widePoint(isLeft);
    var wpv = new Vector(wp, 0, this.noseVolume * this.len);
    var np = this.nosePoint();
    var npv = new Vector(np, 0, 0);
    var c = new BezierCurve(wpv, npv);
    
    return c;
  };
  
  this.draw = function(scale, offset) {
    var left = new Shape();
    left.addVector(this.tailPoint());
    left.addVector(this.tailCornerPoint(true));
    left.addVector(this.widePointCurve(true));
    left.addVector(this.noseCurve(true));
    left.draw();
    
    var right = new Shape();
    right.addVector(this.tailPoint());
    right.addVector(this.tailCornerPoint(false));
    right.addVector(this.widePointCurve(false));
    right.addVector(this.noseCurve(false));
    right.draw();
  };
}
