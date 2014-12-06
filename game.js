var TILE_SIZE = 64
var STEP_DELAY = 1000
var CANVAS_WIDTH = 800
var CANVAS_HEIGHT = 600
var MAP_WIDTH = 20
var MAP_HEIGHT = 20

var context = null
var cameraPosition = {"x": 0, "y": 0}

function clamp(num, min, max) {
    return Math.max(Math.min(num, max), min)
}

window.onload = function() {
    window.onresize = gameRender
    window.setInterval(gameStep, STEP_DELAY)

    var canvas = document.getElementById("gameCanvas")
    context = canvas.getContext("2d")

    canvas.onmousedown = function(event) {
        var lastX = event.clientX
        var lastY = event.clientY

        canvas.onmousemove = function(event) {
            cameraPosition.x += (lastX - event.clientX)
            cameraPosition.y += (lastY - event.clientY)
            lastX = event.clientX
            lastY = event.clientY

            cameraPosition.x = clamp(cameraPosition.x, 0, TILE_SIZE * MAP_WIDTH - CANVAS_WIDTH)
            cameraPosition.y = clamp(cameraPosition.y, 0, TILE_SIZE * MAP_HEIGHT - CANVAS_HEIGHT)

            gameRender()
        }

        canvas.onmouseup = function() {
            canvas.onmousemove = null
        }
    }

    gameRender()
}

function gameRender() {
    context.fillStyle = "black"
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
}

function gameStep() {
    console.log("Stepping game")
}
