class Joystick {
    // 建立Joystick的屬性
    constructor(x, y) {
      this.base = createVector(x, y);
      this.knob = this.base.copy();
      this.radius = 40;
      this.active = false;
    }
  
    // 更新Joystick的位置跟方向跟冷卻時間
    update() {
      this.active = false;
      this.knob = this.base.copy();
  
      let controllingPoint = null;
  
      if (touches.length > 0) {
        let closestTouch = null;
        let minDist = Infinity;
  
        for (let t of touches) {
          let d = dist(t.x, t.y, this.base.x, this.base.y);
          if (d < this.radius * 2.5 && d < minDist) {
            minDist = d;
            closestTouch = t;
          }
        }
  
        if (closestTouch) {
          controllingPoint = createVector(closestTouch.x, closestTouch.y);
        }
      } else if (mouseIsPressed) {
        let d = dist(mouseX, mouseY, this.base.x, this.base.y);
        if (d < this.radius * 2.5) {
          controllingPoint = createVector(mouseX, mouseY);
        }
      }
  
      if (controllingPoint) {
        this.knob = controllingPoint;
        this.active = true;
      }
    }
  
    // 得到方向
    getDirection() {
      return p5.Vector.sub(this.knob, this.base).limit(1);
    }
  
    display() {
      noFill();
      stroke(255);
      ellipse(this.base.x, this.base.y, this.radius * 2.5);
      fill(200);
      ellipse(this.knob.x, this.knob.y, this.radius);
    }
}
  
function touchMoved() {
    return false;
}