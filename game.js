var context = null
var canvasDirty = true
var nextEntity = 0;

var cameraPosition = {x: 0, y: 0};
var resources = {};

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

    // Push out entities
    if (grid.hasEntity(x, y)) {
      var entity = grid.at(x, y);
      var entityPos = grid.positions[entity]
      if (entityPos.free(x + offX, y + offY)) {
        entityPos.move(x + offX, y + offY)
      }
    }

    if (farmer.position.free(x,y)) farmer.position.move(x, y);
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

var mapWidth, mapHeight;
var grid, sprites, sheeps, flowers, farmer;
var grassHeights, grassEaten, grassWin, flowersDie;

function freshLevel(width, height) {
  mapWidth = width;
  mapHeight = height;
  grassHeights = constantGrid(mapWidth, mapWidth, 0);
  grid = new Grid(mapWidth, mapHeight);
  sprites = new Sprites(TILE_SIZE, grid);
  sheeps = new Sheeps(sprites, grid);
  flowers = new Flowers(sheeps, sprites, grid);
  farmer = new Farmer(sprites, grid)
  grassEaten = 0;
  grassWin = 10;
  flowersDie = 0;
}

function generateGrass(width, height) {
  return onGrid(width, height, function() {
    return _.random(0, GRASS_MAX_LEVEL)
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

function randomLevel() {
  freshLevel(20, 20);
  grassHeights = generateGrass(mapWidth, mapHeight)
  generateEntities(mapWidth, mapHeight)
}

function switchLevel(name) {
  $.getJSON(name + ".json", function(data) {
    freshLevel(data.width, data.height);
    farmer.position.move(data.farmer.x, data.farmer.y);
    grassWin = data.grassWin;
    grassHeights = data.grass;
    flowersDie = data.flowersDie;

    _.each(data.sheeps, function(s) {
      sheeps.allocate(s.x, s.y);
    });
    _.each(data.flowers, function(f) {
      flowers.allocate(f.x, f.y);
    });
  });
}

function loadImages() {
  IMAGES.forEach(function(fileName) {
    var newImage = new Image()
    newImage.src = RESOURCES_PREFIX + fileName
    resources[fileName] = newImage
  })
}

window.onload = function() {
  window.onresize = scheduleRender
  window.setInterval(gameStep, STEP_DELAY)
  window.onkeydown = function(event) {
    farmer.handleKeyDown(event);
  }

  $(window).on("flowers:changed", function() {
    flowerCount.innerHTML = flowers.alive;
  });
  $(window).on("grass:eaten", function(e, g) {
    grassEaten += g;
    var percent = Math.min(grassEaten/grassWin, 100);
    $("#progressBar span").css("width", percent + "%");
  });

  loadImages();
  var canvas = document.getElementById("gameCanvas")
  context = canvas.getContext("2d")

  randomLevel();
  switchLevel("level0");
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
    TILE_SIZE * mapWidth - CANVAS_WIDTH);
  cameraPosition.y = clamp(cameraPosition.y, 0,
    TILE_SIZE * mapHeight - CANVAS_HEIGHT);
}

function gameRender() {
  if (!canvasDirty) return;

  positionCamera()
  var minX = Math.max(Math.floor(cameraPosition.x / TILE_SIZE), 0);
  var minY = Math.max(Math.floor(cameraPosition.y / TILE_SIZE), 0);
  var maxX = Math.min(Math.ceil((cameraPosition.x + CANVAS_WIDTH) / TILE_SIZE), mapWidth);
  var maxY = Math.min(Math.ceil((cameraPosition.y + CANVAS_HEIGHT) / TILE_SIZE), mapHeight);

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
  onGrid(mapWidth, mapHeight, function(x,y) {
    grassHeights[x][y] = Math.min(grassHeights[x][y] + GROWING_RATE, GRASS_MAX_LEVEL)
  });

  scheduleRender()
}
