var player
var objs = []
var walls = []
var bullets = []
var crashloc
var canvdim = [1600, 900]
var timeOfLastShot = 0


function startGame() {
  player = new Component(50, 50, 'green', canvdim[0] / 2, canvdim[1] / 4 * 3)
  walls[0] = new Component(1, canvdim[1], 'black', -1, 0)
  walls[1] = new Component(1, canvdim[1], 'black', canvdim[0], 0)
  objs[0] = new Component(50, 50, 'red', canvdim[0] / 2, canvdim[1] / 4)
  myGameArea.start()
}

function message(msg) {
  var ctx = myGameArea.canvas.getContext("2d");
  ctx.font = "30px Courier";
  var textString = msg
  var textWidth = ctx.measureText(textString).width
  var textHeight = ctx.measureText(textString).height
  ctx.fillText(textString, (canvdim[0] / 2) - (textWidth / 2), canvdim[1] / 2);
}

function shoot(xstart, ystart) {
  bullets.push(new Component(10, 10, 'blue', xstart - 5, ystart - 5))
  console.log('BANG')
}

function button() {
  if (myGameArea.keys && myGameArea.keys[32] && new Date() - timeOfLastShot > 250) {
    shoot(player.x + (player.width / 2), player.y - 6)
    timeOfLastShot = new Date()
  }
}
// Check if bullet went offscreen
function checkShotGone(bullet, num) {
  bullet.splice(bullet[num], 1)
}
// Check if bullet hit something
function checkShotHit(bullet, num, object, onum) {
  if (bullet[num].crashWith(object[onum])) {
    object.splice(object[onum], 1)
    bullet.splice(bullet[num], 1)
  }
}

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

function updateComponent(component) {
  var ctx
  ctx = myGameArea.context
  ctx.fillStyle = component.color
  ctx.fillRect(component.x, component.y, component.width, component.height)
}

function updateGameArea() {
  var moveSpeed = 0.5
  var o
  for (o = 0; o < walls.length; o++) {
    if (player.crashWith(walls[o])) {
      var uncrashSpeed = moveSpeed * (objs.length + bullets.length - 1)
      switch (crashloc) {
        case 'top':
          player.y = player.y - uncrashSpeed
          break
        case 'bottom':
          player.y = player.y + uncrashSpeed
          break
        case 'right':
          player.x = player.x - uncrashSpeed
          break
        case 'left':
          player.x = player.x + uncrashSpeed
          break
      }
    } else {
      myGameArea.clear()
      var i
      var u
      for (i = 0; i < objs.length; i++) {
        objs[i].update()
        objs[i].newPos()
      }
      updateComponent(player)
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
      for (i = 0; i < bullets.length; i++) {
        bullets[i].y = bullets[i].y - 0.5
        updateComponent(bullets[i])
      }
      if (bullets.length > 0) {
        for (u = 0; u < bullets.length; u++) {
          for (i = 0; i < objs.length; i++) {
            checkShotHit(bullets, u, objs, i)
          }
          if (bullets[u].y < 0) {
            checkShotGone(bullets, u)
          }
        }
      }
    }
  }
}
