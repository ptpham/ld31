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
  return options[_.sortedIndex(weights, selector)];
}

function Sprites(size, grid) {
  this.fixed = [];
  this.fixedLayers = { };

  this.render = function() {
    _.each(this.fixed, function(layer) {
      _.each(layer, function(img, id) {
        var pos = grid.positions[id];
        context.drawImage(resources[img], size * pos.x, size * pos.y);
      });
    });
  };
  
  this.ensureLayer = function(layer) {
    while (this.fixed.length <= layer) this.fixed.push({});
  }
  
  this.addFixed = function(id, img, layer) {
    this.ensureLayer(layer);
    this.fixed[layer][id] = img;
    this.fixedLayers[id] = layer;
  }

  this.removeFixed = function(id) {
    var layer = this.fixedLayers[id];
    if (layer === undefined) return;
    this.ensureLayer(layer);
    delete this.fixed[layer][id];
    delete this.fixedLayers[id];
  }
}

function Farmer(sprites, grid) {
  this.entity = nextEntity++;
  this.position = grid.allocate(this.entity, 0, 0);
  sprites.addFixed(this.entity, "farmer.png", 4);

  var farmer = this
  var moveTo = function(offX, offY) {
    var x = farmer.position.x + offX
    var y = farmer.position.y + offY
    if (!grid.inBounds(x,y)) return;

    // Push out entities
    if (grid.hasEntity(x, y)) {
      var entity = grid.at(x, y);
      var entityPos = grid.positions[entity]
      if (entityPos.free(x + offX, y + offY)) {
        entityPos.move(x + offX, y + offY)
      }
    }

    farmer.position.move(x, y);
    scheduleRender()
  }

  this.handleKeyDown = function(event) {
    var offX = 0, offY = 0;
    if (event.keyCode == 37) offX = -1;
    if (event.keyCode == 38) offY = -1;
    if (event.keyCode == 39) offX = 1;
    if (event.keyCode == 40) offY = 1;

    if (offX != 0 || offY != 0) moveTo(offX, offY)
  }
}

var grid = new Grid(MAP_WIDTH, MAP_HEIGHT);
var sprites = new Sprites(TILE_SIZE, grid);
var sheeps = new Sheeps(sprites, grid);
var flowers = new Flowers(sheeps, sprites, grid);
var farmer = new Farmer(sprites, grid)

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
  _.times(40, function() {
    var p = _.random(width*height);
    flowers.allocate(p % width, Math.floor(p/width));
  });
}

window.onload = function() {
  window.onresize = scheduleRender
  window.setInterval(gameStep, STEP_DELAY)
  window.onkeydown = _.bind(farmer.handleKeyDown, farmer)
  $(window).on("flowers:changed", function() {
    flowerCount.innerHTML = flowers.alive;
  });

  loadImages();
  grassHeights = generateGrass(MAP_WIDTH, MAP_HEIGHT)
  generateEntities(MAP_WIDTH, MAP_HEIGHT)

  var canvas = document.getElementById("gameCanvas")
  context = canvas.getContext("2d")

  scheduleRender()
}

function scheduleRender() {
  canvasDirty = true
  window.setTimeout(gameRender, 0)
}

function positionCamera() {
  cameraPosition.x = (farmer.position.x + 0.5) * TILE_SIZE - CANVAS_WIDTH / 2
  cameraPosition.y = (farmer.position.y + 0.5) * TILE_SIZE - CANVAS_HEIGHT / 2

  cameraPosition.x = clamp(cameraPosition.x, 0,
    TILE_SIZE * MAP_WIDTH - CANVAS_WIDTH);
  cameraPosition.y = clamp(cameraPosition.y, 0,
    TILE_SIZE * MAP_HEIGHT - CANVAS_HEIGHT);
}

function gameRender() {
  if (!canvasDirty) return;

  positionCamera()
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
  flowers.step();
  onGrid(MAP_WIDTH, MAP_HEIGHT, function(x,y) {
    grassHeights[x][y] = Math.min(grassHeights[x][y] + GROWING_RATE, GRASS_MAX_LEVEL)
  });

  scheduleRender()
}
