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

function onGrid(width, height, fn) {
    return _.times(width, function(x) {
        return _.times(height, function(y) { return fn(x,y) })
    })
}

function constantGrid(width, height, constant) {
    return onGrid(width, height, _.constant(constant))
}

function generateGrass(width, height) {
    return onGrid(width, height, function() {
        return _.random(0, GRASS_MAX_LEVEL)
    })
}

function clamp(value, min, max) {
  if (min > max) return min;
  return Math.min(Math.max(value, min), max);
}

// Takes an array of possibilities and a function that returns the relative
// weight of each option and returns the randomly selected option.
function rouletteSelection(options, weightFunction) {
    var weights = _.map(options, weightFunction);
    _.times(weights.length - 1, function(i) { weights[i+1] += weights[i]; });
    var selector = Math.random() * _.last(weights);
    var result = options[_.sortedIndex(weights, selector)];
    return result;
}

function Sheep(position) {
    var self = this

    self.position = position
    entities[position.x][position.y] = self

    var moveTo = function(position) {
        if (!position) return;
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

            moveTo(rouletteSelection(possiblePositions, function(position) {
                return grassHeights[position.x][position.y]
            }))
        }
    }
}

function loadImages() {
    IMAGES.forEach(function(fileName) {
        var newImage = new Image()
        newImage.src = RESOURCES_PREFIX + fileName
        resources[fileName] = newImage
    })
}

function generateEntities(width, height) {
    entities = constantGrid(width, height, null);
    var raw = _.sample(_.range(width * height), NUM_SHEEP);
    _.each(raw, function(p) {
      var position = { x: p % MAP_WIDTH, y: Math.floor(p / MAP_WIDTH) };
      sheeps.push(new Sheep(position));
    });
}

window.onload = function() {
    window.onresize = scheduleRender
    window.setInterval(gameStep, STEP_DELAY)

    var canvas = document.getElementById("gameCanvas")
    context = canvas.getContext("2d")

    var mousedown = false, lastX, lastY;
    canvas.onmousedown = function(event) {
        lastX = event.clientX;
        lastY = event.clientY;
        mousedown = true;
    }

    canvas.onmousemove = function(event) {
        if (!mousedown) return;
        cameraPosition.x += (lastX - event.clientX);
        cameraPosition.y += (lastY - event.clientY);
        lastX = event.clientX;
        lastY = event.clientY;

        cameraPosition.x = clamp(cameraPosition.x, 0,
          TILE_SIZE * MAP_WIDTH - CANVAS_WIDTH);
        cameraPosition.y = clamp(cameraPosition.y, 0,
          TILE_SIZE * MAP_HEIGHT - CANVAS_HEIGHT);

        scheduleRender();
    }

    canvas.onmouseleave = canvas.onmouseup = function() { mousedown = false; }

    loadImages()

    grassHeights = generateGrass(MAP_WIDTH, MAP_HEIGHT)
    generateEntities(MAP_WIDTH, MAP_HEIGHT)

    scheduleRender()
}

function scheduleRender() {
    canvasDirty = true
    window.setTimeout(gameRender, 0)
}

function gameRender() {
    if (!canvasDirty) return;
    var minX = Math.max(Math.floor(cameraPosition.x / TILE_SIZE), 0);
    var minY = Math.max(Math.floor(cameraPosition.y / TILE_SIZE), 0);
    var maxX = Math.min(Math.ceil((cameraPosition.x + CANVAS_WIDTH) / TILE_SIZE), MAP_WIDTH);
    var maxY = Math.min(Math.ceil((cameraPosition.y + CANVAS_HEIGHT) / TILE_SIZE),  MAP_HEIGHT);

    context.save()
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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
    canvasDirty = false
}

function gameStep() {
    sheeps.forEach(function(sheep) { sheep.step() })

    onGrid(MAP_WIDTH, MAP_HEIGHT, function(x,y) {
        grassHeights[x][y] = Math.min(grassHeights[x][y] + GROWING_RATE, GRASS_MAX_LEVEL)
    });

    scheduleRender()
}
