var STEP_DELAY = 1000

var TILE_SIZE = 64
var CANVAS_WIDTH = 800
var CANVAS_HEIGHT = 600
var MAP_WIDTH = 20
var MAP_HEIGHT = 20

var RESOURCES_PREFIX = "resources/"
var IMAGES = [
    "grass0.png", "grass1.png", "grass2.png", "grass3.png",
    "sheep.png"
]

var EATING_RATE = 0.4
var GROWING_RATE = 0.1
var GRASS_MAX_LEVEL = 3
var SHEEP_MOVE_LIKELIHOOD = 0.1
var NUM_SHEEP = 20

var ALLOWED_MOVES = [
    {x: -1, y: -1},
    {x: -1, y: 0},
    {x: -1, y: 1},
    {x: 0, y: -1},
    {x: 0, y: 1},
    {x: 1, y: -1},
    {x: 1, y: 0},
    {x: 1, y: 1}
]

var context = null
var canvasDirty = true

var cameraPosition = {x: 0, y: 0}

var resources = {}

var grassHeights = []
var sheeps = []
var entities = []

// Takes an array of possibilities and a function that returns the relative
// weight of each option and returns the randomly selected option.
function rouletteSelection(options, weightFunction) {
    var summedWeight = 0
    options.forEach(function(option) {
        summedWeight += weightFunction(option)
    })

    var selector = Math.random() * summedWeight
    var selected
    options.forEach(function(option) {
        if (selector >= 0) {
            selected = option
        }
        selector -= weightFunction(option)
    })

    return selected
}

function Sheep(position) {
    var self = this

    self.position = position
    entities[position.x][position.y] = self

    var moveTo = function(position) {
        entities[self.position.x][self.position.y] = null
        self.position = position
        entities[position.x][position.y] = self
    }

    self.render = function() {
        var x = self.position.x
        var y = self.position.y
        context.drawImage(resources["sheep.png"], x * TILE_SIZE, y * TILE_SIZE)
    }

    self.step = function() {
        var x = self.position.x
        var y = self.position.y

        // Eat the grass under the sheep
        grassHeights[x][y] = Math.max(grassHeights[x][y] - EATING_RATE, 0)

        // Possibly move the sheep
        if (Math.random() < SHEEP_MOVE_LIKELIHOOD) {
            var possiblePositions = ALLOWED_MOVES.map(function(offset) {
                return {x: offset.x + x, y: offset.y + y}
            }).filter(function(pos) {
                return pos.x >= 0 && pos.x < MAP_WIDTH && pos.y >= 0 && pos.y < MAP_HEIGHT && entities[pos.x][pos.y] === null
            })

            if (possiblePositions.length > 0) {
                moveTo(rouletteSelection(possiblePositions, function(position) {
                    return grassHeights[position.x][position.y]
                }))
            }
        }
    }
}

function loadImages() {
    for (var index in IMAGES) {
        var newImage = new Image()
        newImage.src = RESOURCES_PREFIX + IMAGES[index]
        resources[IMAGES[index]] = newImage
    }
}

function generateEntities() {

    // Make entities a 2D null array of MAP_WIDTH by MAP_HEIGHT
    for (var x = 0; x < MAP_WIDTH; x++) {
        var column = []
        for (var y = 0; y < MAP_HEIGHT; y++) {
            column.push(null)
        }
        entities.push(column)
    }

    // Generate random sheep
    for (var n = 0; n < NUM_SHEEP; n++) {
        do {
            var position = {
                x: Math.floor(Math.random() * MAP_WIDTH),
                y: Math.floor(Math.random() * MAP_HEIGHT)
            }
        } while(entities[position.x][position.y] !== null)
        sheeps.push(new Sheep(position))
    }
}

function generateGrass() {
    for (var x = 0; x < MAP_WIDTH; x++) {
        var column = []
        for (var y = 0; y < MAP_HEIGHT; y++) {
            column.push(Math.min(Math.random() * (GRASS_MAX_LEVEL + 1), GRASS_MAX_LEVEL))
        }
        grassHeights.push(column)
    }
}

window.onload = function() {
    window.onresize = scheduleRender
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

            cameraPosition.x = Math.min(Math.max(cameraPosition.x, 0), TILE_SIZE * MAP_WIDTH - CANVAS_WIDTH)
            cameraPosition.y = Math.min(Math.max(cameraPosition.y, 0), TILE_SIZE * MAP_HEIGHT - CANVAS_HEIGHT)

            scheduleRender()
        }

        canvas.onmouseleave = canvas.onmouseup = function() {
            canvas.onmousemove = null
        }
    }

    loadImages()

    generateGrass()
    generateEntities()

    scheduleRender()
}

function scheduleRender() {
    canvasDirty = true
    window.setTimeout(gameRender, 0)
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
            var grassImage = "grass" + Math.floor(grassHeights[x][y]) + ".png"
            context.drawImage(resources[grassImage], x * TILE_SIZE, y * TILE_SIZE)

            if (entities[x][y] !== null) {
                entities[x][y].render()
            }
        }
    }
    context.restore()
}

function gameStep() {
    for (var sheep in sheeps) {
        sheeps[sheep].step()
    }

    for (var x = 0; x < MAP_WIDTH; x++) {
        for (var y = 0; y < MAP_HEIGHT; y++) {
            grassHeights[x][y] = Math.min(grassHeights[x][y] + GROWING_RATE, GRASS_MAX_LEVEL)
        }
    }

    scheduleRender()
}
