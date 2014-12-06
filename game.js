var TILE_SIZE = 64
var STEP_DELAY = 1000
var CANVAS_WIDTH = 800
var CANVAS_HEIGHT = 600
var MAP_WIDTH = 20
var MAP_HEIGHT = 20

var IMAGES = ["grass0.png", "grass1.png", "grass2.png", "grass3.png"]

var context = null
var cameraPosition = {"x": 0, "y": 0}
var grassHeights = []
var resources = {}
var canvasDirty = true

function clamp(num, min, max) {
    return Math.max(Math.min(num, max), min)
}

function loadImages() {
    for (index in IMAGES) {
        var newImage = new Image();
        newImage.src = "resources/" + IMAGES[index]
        resources[IMAGES[index]] = newImage
    }
    console.log(resources)
}

function scheduleRefresh() {
    canvasDirty = true
    window.setTimeout(gameRender, 0)
}

window.onload = function() {
    window.onresize = scheduleRefresh
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

            scheduleRefresh()
        }

        canvas.onmouseleave = canvas.onmouseup = function() {
            canvas.onmousemove = null
        }
    }

    for (var x = 0; x < MAP_WIDTH; x++) {
        var column = []
        for (var y = 0; y < MAP_HEIGHT; y++) {
            column.push(Math.floor(Math.random() * 4))
        }
        grassHeights.push(column)
    }

    loadImages()

    scheduleRefresh()
}

function gameRender() {
    if (canvasDirty) {
        canvasDirty = false
    } else {
        return
    }

    var minX = Math.floor(cameraPosition.x / TILE_SIZE)
    var minY = Math.floor(cameraPosition.y / TILE_SIZE)
    var maxX = Math.ceil((cameraPosition.x + CANVAS_WIDTH) / TILE_SIZE)
    var maxY = Math.ceil((cameraPosition.y + CANVAS_HEIGHT) / TILE_SIZE)

    context.save()
    context.translate(-cameraPosition.x, -cameraPosition.y)
    for (var x = minX; x < maxX; x++) {
        for (var y = minY; y < maxY; y++) {
            var grassImage = "grass" + grassHeights[x][y] + ".png"
            context.drawImage(resources[grassImage], x * TILE_SIZE, y * TILE_SIZE)
        }
    }
    context.restore()
}

function gameStep() {
    console.log("Stepping game")
}
