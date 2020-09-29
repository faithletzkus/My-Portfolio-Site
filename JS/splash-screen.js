//code to start the animation or not
//the animation will only happen the first time the page is loaded on your browser
var once = false;
/*
 *This is the initial function called when the screen loads.
 *If there is a once boolean stored in the browser,
 *it gets this variable and sets local value to the the browser's value
*/
const init = function(e) {
  once = JSON.parse(localStorage.getItem("once"));
  if (once === true) {
    document.getElementById("body").style.overflow = "auto";
  }
  else {
    document.getElementById("h1").style.color = "black";
    document.getElementById("h2").style.color = "black";
    //idea = put all animation stuff in a function that I call after i get the once value and know that it is false
    doAnimation();
  }
  console.log("the value of once " + once);
};

/*
 *When the screen loads, this calls init()
*/
document.addEventListener("DOMContentLoaded", function() {
  init();
});



function doAnimation() {
  //this function contains the only code that I did not write
  //this was by Alex Zaworski and posted to CodePen
  //https://codepen.io/alexzaworski/pen/mEkvAG
  //The code I have here, I have edited a little bit, but it is primarily unchanged
  var c = document.getElementById("title-panel");
  var ctx = c.getContext("2d");
  var cH;
  var cW;
  var bgColor = "white";
  var animations = [];
  var circles = [];

  function removeAnimation(animation) {
    var index = animations.indexOf(animation);
    if (index > -1) animations.splice(index, 1);
  }

  function calcPageFillRadius(x, y) {
    var l = Math.max(x - 0, cW - x);
    var h = Math.max(y - 0, cH - y);
    return Math.sqrt(Math.pow(l, 2) + Math.pow(h, 2));
  }

  function addClickListeners() {
    //document.addEventListener("touchstart", handleEvent);
    document.addEventListener("mousedown", handleEvent);
  };

  var q = 0;

  var once = false;
  function handleEvent(e) {
    navScrolling = true;
    //don't need
      // if (e.touches) {
      //   e.preventDefault();
      //   e = e.touches[0];
      // }
    //
      if (once === false ) {


      var currentColor = "white";//colorPicker.current();
      var nextColor = "#005961";//colorPicker.next();
      var targetR = calcPageFillRadius(e.pageX, e.pageY);
      var rippleSize = Math.min(200, (cW * .4));
      var minCoverDuration = 1000;

      document.getElementById("h1").style.color = "transparent";
      document.getElementById("h2").style.color = "transparent";

      var pageFill = new Circle({
        x: e.pageX,
        y: e.pageY,
        r: 0,
        fill: nextColor
      });
      var fillAnimation = anime({
        targets: pageFill,
        r: targetR,
        duration:  Math.max(targetR / 2 , minCoverDuration ),
        easing: "easeOutQuart",
        complete: function(){
          bgColor = pageFill.fill;
          removeAnimation(fillAnimation);
        }
      });




      var ripple = new Circle({
        x: e.pageX,
        y: e.pageY,
        r: 0,
        fill: currentColor,
        stroke: {
          width: 3,
          color: currentColor
        },
        opacity: 1
      });
      var rippleAnimation = anime({
        targets: ripple,
        r: rippleSize,
        opacity: 0,
        easing: "easeOutExpo",
        duration: 900,
        //complete: removeAnimation
        complete: function(){
          //bgColor = pageFill.fill;
          removeAnimation(rippleAnimation);
        }
      });



      var particles = [];
      for (var i=0; i<32; i++) {
        var particle = new Circle({
          x: e.pageX,
          y: e.pageY,
          fill: currentColor,
          r: anime.random(24, 48)
        })
        particles.push(particle);
      }
      var particlesAnimation = anime({
        targets: particles,
        x: function(particle){
          return particle.x + anime.random(rippleSize, -rippleSize);
        },
        y: function(particle){
          return particle.y + anime.random(rippleSize * 1.15, -rippleSize * 1.15);
        },
        r: 0,
        easing: "easeOutExpo",
        duration: anime.random(1000,1300),
        //complete: removeAnimation
        complete: function(){
          //bgColor = pageFill.fill;
          removeAnimation(rippleAnimation);
        }
      });
      if (q === 0) {
         animations.push(fillAnimation, rippleAnimation, particlesAnimation);
      }
      q++;
      document.getElementById("h1").style.color = "white";
      document.getElementById("h2").style.color = "white";
      document.getElementById("title").style.backgroundColor = "transparent";

      setTimeout(scrollPage, 1000);
      once = true;
      localStorage.setItem("once", JSON.stringify(once));
    }
  }


  function extend(a, b){
    for(var key in b) {
      if(b.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }
    return a;
  }

  var Circle = function(opts) {
    extend(this, opts);
  }

  Circle.prototype.draw = function() {
    ctx.globalAlpha = this.opacity || 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    if (this.stroke) {
      ctx.strokeStyle = this.stroke.color;
      ctx.lineWidth = this.stroke.width;
      ctx.stroke();
    }
    if (this.fill) {
      ctx.fillStyle = this.fill;
      ctx.fill();
    }
    ctx.closePath();
    ctx.globalAlpha = 1;
  }

  var animate = anime({
    duration: Infinity,
    update: function() {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, cW, cH);
      animations.forEach(function(anim) {
        anim.animatables.forEach(function(animatable) {
          animatable.target.draw();
        });
      });
    }
  });

  var resizeCanvas = function() {
    cW = window.innerWidth;
    cH = window.innerHeight;
    c.width = cW * devicePixelRatio;
    c.height = cH * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
  };

  (function init() {
    resizeCanvas();
    // if (window.CP) {
    //   // CodePen's loop detection was causin' problems
    //   // and I have no idea why, so...
    //   window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 6000;
    // }
    window.addEventListener("resize", resizeCanvas);
    addClickListeners();
    if (!!window.location.pathname.match(/fullcpgrid/)) {
      startFauxClicking();
    }
    handleInactiveUser();
  })();

  function handleInactiveUser() {
    var inactive = setTimeout(function(){
      fauxClick(cW/2, cH/2);
    }, 1200);

    function clearInactiveTimeout() {
      clearTimeout(inactive);
      document.removeEventListener("mousedown", clearInactiveTimeout);
      document.removeEventListener("touchstart", clearInactiveTimeout);
    }

    document.addEventListener("mousedown", clearInactiveTimeout);
    //document.addEventListener("touchstart", clearInactiveTimeout);
  }

  function startFauxClicking() {
    setTimeout(function(){
      fauxClick(anime.random( cW * .2, cW * .8), anime.random(cH * .2, cH * .8));
      startFauxClicking();
    }, anime.random(200, 900));
  }

  function fauxClick(x, y) {
    var fauxClick = new Event("mousedown");
    fauxClick.pageX = x;
    fauxClick.pageY = y;
    document.dispatchEvent(fauxClick);
  }
}
