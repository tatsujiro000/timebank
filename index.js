//変数

// const tl = gsap.timeline({});

// let circle = document.getElementsByClassName("orange");
// const drop = document.getElementsByClassName("drop");

// $(".button").click(function (e) { 
//   tl.set(circle, {opacity: 1, transformOrigin: "50% 50%"})
//     .set(drop, {opacity: 0, transformOrigin: "50% 50%"})
//     .to(drop, {duration: .5, opacity: 1, y: 100}, .5)
//     .to(circle, {duration: .1, scaleY:.8 }, "+=.0005")
//     .to(circle, {duration: .4, scale: 1.1, ease:Elastic.easeOut.config(.6, .05)}, );
// });

let random = setInterval(function() {
  Math.random() * 360
}, 1000);

let canvas, ctx;
let render, init;
let blob;


//.button押したら時間増える
$(".button").click(function (e) {
  console.log(blob.radius); 

  let start = Date.now();

      let timer = setInterval(function() {
        //開始からの経過時間を定義
        let timePassed = Date.now() - start;
        blob.radius += timePassed / 5000; //blobの半径をおよそ5ずつ追加

        if (timePassed > 1000) clearInterval(timer);//1秒後にクリア

      }, 20);
});





//Blobクラス
class Blob {
  constructor() {
    this.points = [];
    
  }
  
  //分割ポイントの初期化
  init() {
    for(let i = 0; i < this.numPoints; i++) {
      let point = new Point(this.divisional * ( i + 1 ), this);
      // point.acceleration = -1 + Math.random() * 2;
      this.push(point);
    }
  }
  
  render() {
    let canvas = this.canvas;
    let ctx = this.ctx;
    let position = this.position;
    let pointsArray = this.points;
    let radius = this.radius;
    let points = this.numPoints;
    let divisional = this.divisional;
    let center = this.center;
    
    ctx.clearRect(0,0,canvas.width,canvas.height);
    
    pointsArray[0].solveWith(pointsArray[points-1], pointsArray[1]);

    let p0 = pointsArray[points-1].position;
    let p1 = pointsArray[0].position;
    let _p2 = p1;

    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.moveTo( (p0.x + p1.x) / 2, (p0.y + p1.y) / 2 );

    for(let i = 1; i < points; i++) {
      
      pointsArray[i].solveWith(pointsArray[i-1], pointsArray[i+1] || pointsArray[0]);

      let p2 = pointsArray[i].position;
      const xc = (p1.x + p2.x) / 2;
      const yc = (p1.y + p2.y) / 2;
      ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);
      // ctx.lineTo(p2.x, p2.y);

      ctx.fillStyle = '#000000';
      // ctx.fillRect(p1.x-2.5, p1.y-2.5, 5, 5);

      p1 = p2;
    }

    const xc = (p1.x + _p2.x) / 2;
    const yc = (p1.y + _p2.y) / 2;
    ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);
    // ctx.lineTo(_p2.x, _p2.y);

    // ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#000000';
    // ctx.stroke();
    
/*
    ctx.fillStyle = '#000000';
    if(this.mousePos) {
      let angle = Math.atan2(this.mousePos.y, this.mousePos.x) + Math.PI;
      ctx.fillRect(center.x + Math.cos(angle) * this.radius, center.y + Math.sin(angle) * this.radius, 5, 5);
    }
*/
    requestAnimationFrame(this.render.bind(this));
  }
  
  push(item) {
    if(item instanceof Point) {
      this.points.push(item);
    }
  }
  


  set color(value) {
    // this._color = "value";
    this._color = `hsl(${random}, 80%, 60%)`;
  }
  // get color() {
  //   return this._color || 'rgb(255,165,0)';
  // }
  get color() {
    return this._color || `hsl(${random}, 80%, 60%)`;
  }
  
  set canvas(value) {
    if(value instanceof HTMLElement && value.tagName.toLowerCase() === 'canvas') {
      this._canvas = canvas;
      this.ctx = this._canvas.getContext('2d');
    }
  }
  get canvas() {
    return this._canvas;
  }
  
  //円の反応ポイント数をセット
  set numPoints(value) {
    if(value > 2) {
      this._points = value;
    }
  }
  get numPoints() {
    return this._points || 24; //円の反応ポイント数
  }
  
  //円の半径
  set radius(value) {
    if(value > 0) {
      this._radius = value;
    }
  }
  get radius() {
    return this._radius || 100;
  }
  
  set position(value) {
    if(typeof value == 'object' && value.x && value.y) {
      this._position = value;
    }
  }
  get position() {
    return this._position || { x: 0.5, y: 0.5 };
  }
  
  //円の分割
  get divisional() {
    return Math.PI * 2 / this.numPoints;
  }
  
  get center() {
    return { x: this.canvas.width * this.position.x, y: this.canvas.height * this.position.y };
  }
  
  set running(value) {
    this._running = value === true;
  }
  get running() {
    return this.running !== false;
  }
}


//分割点クラス
class Point {
  constructor(azimuth, parent) {
    this.parent = parent;
    this.azimuth = Math.PI - azimuth;
    this._components = { 
      x: Math.cos(this.azimuth),
      y: Math.sin(this.azimuth)
    };
    
    this.acceleration = -0.3 + Math.random() * 0.6;
  }
  
  solveWith(leftPoint, rightPoint) {
    this.acceleration = (-0.3 * this.radialEffect + ( leftPoint.radialEffect - this.radialEffect ) + ( rightPoint.radialEffect - this.radialEffect )) * this.elasticity - this.speed * this.friction;
  }
  
  set acceleration(value) {
    if(typeof value == 'number') {
      this._acceleration = value;
      this.speed += this._acceleration * 2;//変化の加速度
    }
  }
  get acceleration() {
    return this._acceleration || 0;
  }
  
  set speed(value) {
    if(typeof value == 'number') {
      this._speed = value;
      this.radialEffect += this._speed * 5;//水平方向の加速度
    }
  }
  get speed() {
    return this._speed || 0;
  }
  
  set radialEffect(value) {
    if(typeof value == 'number') {
      this._radialEffect = value;
    }
  }
  get radialEffect() {
    return this._radialEffect || 0;
  }
  
  get position() {
    return { 
      x: this.parent.center.x + this.components.x * (this.parent.radius + this.radialEffect), 
      y: this.parent.center.y + this.components.y * (this.parent.radius + this.radialEffect) 
    }
  }
  
  get components() {
    return this._components;
  }

  set elasticity(value) {
    if(typeof value === 'number') {
      this._elasticity = value;
    }
  }
  get elasticity() {
    return this._elasticity || 0.001;//弾力性
  }
  set friction(value) {
    if(typeof value === 'number') {
      this._friction = value;
    }
  }
  get friction() {
    return this._friction || 0.0085;//摩擦力
  }
}

blob = new Blob;

init = function() {
  //canvasを生成
  canvas = document.createElement('canvas');
  canvas.setAttribute('touch-action', 'none');

  document.body.appendChild(canvas);

  //canvasの領域を定義
  let resize = function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();
  
  //マウス位置を取得
  let oldMousePoint = { x: 0, y: 0};
  let hover = false;
  let mouseMove = function(e) {
    
    //blobの中央を取得
    let pos = blob.center;
    //マウス位置とblobの中央との差分をけ取得
    let diff = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    //距離の絶対値化
    let dist = Math.sqrt((diff.x * diff.x) + (diff.y * diff.y));
    let angle = null;
    
    
    blob.mousePos = { x: pos.x - e.clientX, y: pos.y - e.clientY };
    
    //マウス位置とblobの中央との差分が円の半径よりも小さい時、
    if(dist < blob.radius && hover === false) {
      let vector = { x: e.clientX - pos.x, y: e.clientY - pos.y };
      angle = Math.atan2(vector.y, vector.x);
      hover = true;
      // blob.color = '#77FF00';
      //マウス位置とblobの中央との差分が円の半径よりも大きいとき
    } else if(dist > blob.radius && hover === true){ 
      let vector = { x: e.clientX - pos.x, y: e.clientY - pos.y };
      angle = Math.atan2(vector.y, vector.x);
      hover = false;
      blob.color = null;
    }
    
    if(typeof angle == 'number') {
      
      let nearestPoint = null;
      let distanceFromPoint = 100;
      
      blob.points.forEach((point)=> {
        if(Math.abs(angle - point.azimuth) < distanceFromPoint) {
          // console.log(point.azimuth, angle, distanceFromPoint);
          nearestPoint = point;
          distanceFromPoint = Math.abs(angle - point.azimuth);
        }
        
      });

      //カーソル移動の速度に応じて、水の動きの強弱を制御
      if(nearestPoint) {
        let strength = { x: oldMousePoint.x - e.clientX, y: oldMousePoint.y - e.clientY };
        strength = Math.sqrt((strength.x * strength.x) + (strength.y * strength.y)) * 10;
        if(strength > 100) strength = 100;//水の動きを100まで拡張
        nearestPoint.acceleration = strength / 100 * (hover ? -1 : 1);
      }
    }
    
    oldMousePoint.x = e.clientX;
    oldMousePoint.y = e.clientY;
  }
  // window.addEventListener('mousemove', mouseMove);
  window.addEventListener('pointermove', mouseMove);
  
  blob.canvas = canvas;
  blob.init();
  blob.render();
}

init();
