var context = null
var canvasDirty = true
var nextEntity = 0;

var cameraPosition = {x: 0, y: 0}
var resources = {}
var grassHeights = []

function generateGrass(width, height) {
  return onGrid(width, height, function() {
    return _.random(0, GRASS_MAX_LEVEL)
  })
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

function Sprites(size, grid) {
  this.fixed = {};
  this.render = function() {
    _.each(this.fixed, function(img, id) {
      var pos = grid.positions[id];
      context.drawImage(img, size * pos.x, size * pos.y);
    });
  };
}

var grid = new Grid(MAP_WIDTH, MAP_HEIGHT);
var sprites = new Sprites(TILE_SIZE, grid);
var sheeps = new Sheeps(sprites, grid);

function loadImages() {
  IMAGES.forEach(function(fileName) {
    var newImage = new Image()
    newImage.src = RESOURCES_PREFIX + fileName
    resources[fileName] = newImage
  })
}

function generateEntities(width, height) {
  var raw = _.sample(_.range(width*height), NUM_SHEEP);
  _.each(raw, function(p) {
    var position = { x: p % width, y: Math.floor(p/width) };
    sheeps.allocate(position.x, position.y);
  });
}

window.onload = function() {
  loadImages()
  grassHeights = generateGrass(MAP_WIDTH, MAP_HEIGHT)
  generateEntities(MAP_WIDTH, MAP_HEIGHT)

  window.onresize = scheduleRender
  window.setInterval(gameStep, STEP_DELAY)

  var canvas = document.getElementById("gameCanvas")
  context = canvas.getContext("2d")

  var farmer = nextEntity++;
  var farmerPos = grid.allocate(farmer, 0, 0);
  sprites.fixed[farmer] = resources["farmer.png"];
  window.onkeydown = function(event) {
    var x = farmerPos.x, y = farmerPos.y;
    if (event.keyCode == 37) x--;
    if (event.keyCode == 38) y--;
    if (event.keyCode == 39) x++;
    if (event.keyCode == 40) y++;
    if (farmerPos.free(x,y)) farmerPos.move(x,y);
  }

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
    }
  }

  sprites.render();
  context.restore()
  canvasDirty = false
}

function gameStep() {
  sheeps.step();
  onGrid(MAP_WIDTH, MAP_HEIGHT, function(x,y) {
    grassHeights[x][y] = Math.min(grassHeights[x][y] + GROWING_RATE, GRASS_MAX_LEVEL)
  });

  scheduleRender()
}
