// Defining variables and arrays
var player
var objs = []
var walls = []
var bullets = []
var crashloc
var canvdim = [Math.floor(window.innerWidth / 100) * 100 || Maths.floor(document.body.clientWidth / 100) * 100, window.innerHeight - 25 || document.body.clientHeight - 25] // set canvas resolution
var timeOfLastShot = 0
var numOfObjs = canvdim[0] / 100
var i
var u
var o

function startGame() {
  // Creating visible / interactive game objects
  player = new Component(50, 50, 'green', canvdim[0] / 2, canvdim[1] / 4 * 3)
  walls[0] = new Component(1, canvdim[1], 'black', -1, 0)
  walls[1] = new Component(1, canvdim[1], 'black', canvdim[0], 0)
  for (i = 0; i < numOfObjs; i++) {
    objs[i] = new Component(50, 50, 'red', i * 100 + 25, 25)
  }
  myGameArea.start()
}

// This displays a message in the center of the canvas
function message(msg) {
  var ctx = myGameArea.canvas.getContext("2d");
  ctx.font = "30px Courier";
  var textString = msg
  var textWidth = ctx.measureText(textString).width
  var textHeight = ctx.measureText(textString).height
  ctx.fillText(textString, (canvdim[0] / 2) - (textWidth / 2), canvdim[1] / 2);
}

// Creates a bullet
function shoot(xstart, ystart) {
  bullets.push(new Component(10, 10, 'blue', xstart - 5, ystart - 5))
  console.log('BANG')
}

// Checks if a bullet can be created and creates one if yes
function button() {
  if (myGameArea.keys && myGameArea.keys[32] && bullets.length == 0) { // <-- (currently waiting for other shot to have disappeared to
    shoot(player.x + (player.width / 2), player.y - 6)                 // allow new bullet spawn) use "new Date() - timeOfLastShot > 250"
    timeOfLastShot = new Date()                                        // instead of "bullets.length == 0" for adjustable time in ms
  }                                                                    // between shots
}

// Check if bullet went offscreen
function checkShotGone(bullet, num) {
  if (bullet[num].y < 0) {
    bullet.splice(num, 1)
    return true
  }
}

// Check if bullet hit something
function checkShotHit(bullet, num, object, onum) {
  if (object[onum].crashWith(bullet[num])) {
    bullet.splice(num, 1)
    object.splice(onum, 1)
    return true
  }
}

// Creates canvas
var myGameArea = {
  canvas: document.createElement('canvas'),
  start: function() {
    this.canvas.x = 0
    this.canvas.y = 0
    this.canvas.width = canvdim[0]
    this.canvas.height = canvdim[1]
    this.context = this.canvas.getContext('2d')
    document.body.insertBefore(this.canvas, document.body.childNodes[0])
    this.interval = setInterval(updateGameArea, 1)
    window.addEventListener('keydown', function(e) {
      myGameArea.keys = (myGameArea.keys || [])
      myGameArea.keys[e.keyCode] = true
    })
    window.addEventListener('keyup', function(e) {
      myGameArea.keys = (myGameArea.keys || [])
      myGameArea.keys[e.keyCode] = false
    })
  },
  clear: function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}

// Creates a rectangle of a color at a point
function Component(width, height, color, x, y) {
  this.color = color
  this.width = width
  this.height = height
  this.speedX = 0
  this.speedY = 0
  this.x = x
  this.y = y
  this.update = function() {
    var ctx
    ctx = myGameArea.context
    ctx.fillStyle = color
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
  this.newPos = function() {
    this.x += this.speedX
    this.y += this.speedY
  }
  // collision detection
  this.crashWith = function(otherobj) {
    var myleft = this.x
    var myright = this.x + (this.width)
    var mytop = this.y
    var mybottom = this.y + (this.height)
    var otherleft = otherobj.x + 1
    var otherright = otherobj.x + (otherobj.width) - 1
    var othertop = otherobj.y + 1
    var otherbottom = otherobj.y + (otherobj.height) - 1
    var b_collision = otherbottom - this.y
    var t_collision = mybottom - otherobj.y
    var l_collision = myright - otherobj.x
    var r_collision = otherright - this.x
    var crash = true

    if ((mybottom < othertop) ||
      (mytop > otherbottom) ||
      (myright < otherleft) ||
      (myleft > otherright)) {
      crash = false
    }
    if (t_collision < b_collision && t_collision < l_collision && t_collision < r_collision) {
      crashloc = 'top'
    }
    if (b_collision < t_collision && b_collision < l_collision && b_collision < r_collision) {
      crashloc = 'bottom'
    }
    if (l_collision < r_collision && l_collision < t_collision && l_collision < b_collision) {
      crashloc = 'right'
    }
    if (r_collision < l_collision && r_collision < t_collision && r_collision < b_collision) {
      crashloc = 'left'
    }
    return crash
  }
}

// updates all game objects and checks for movements (arrow keys), collisions, shots (shooting bullets with space) and hits
function updateGameArea() {
  var moveSpeed = canvdim[0] / 3000
  var uncrashSpeed = moveSpeed * (objs.length + bullets.length + walls.length - 1)
  for (o = 0; o < walls.length; o++) {
    // player / wall collisions
    if (player.crashWith(walls[o])) {
      switch (crashloc) {
        case 'right':
          player.x = player.x - uncrashSpeed
          break
        case 'left':
          player.x = player.x + uncrashSpeed
          break
      }
    } else {
      myGameArea.clear()
      for (i = 0; i < objs.length; i++) {
        objs[i].update()
        objs[i].newPos()
      }
      player.update()
      player.newPos()
      player.speedX = 0
      player.speedY = 0
      if (myGameArea.keys && myGameArea.keys[37]) {
        player.speedX -= moveSpeed
      }
      if (myGameArea.keys && myGameArea.keys[39]) {
        player.speedX += moveSpeed
      }
      button()
      if (bullets.length > 0) {
        for (u = 0; u < bullets.length; u++) {
          for (i = 0; i < objs.length; i++) {
            if (checkShotHit(bullets, u, objs, i)) {
              break
            }
          }
        }
      }
      for (i = 0; i < bullets.length; i++) {
        bullets[i].y = bullets[i].y - canvdim[1] / 700
        bullets[i].update()
        if (checkShotGone(bullets, i)) {
          break
        }
      }
    }
  }
}
