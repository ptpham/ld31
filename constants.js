var STEP_DELAY = 1000

var TILE_SIZE = 64
var CANVAS_WIDTH = 800
var CANVAS_HEIGHT = 600

var RESOURCES_PREFIX = "resources/"

var IMAGES = [
  "grass0.png", "grass1.png", "grass2.png", "grass3.png",
  "flower_blue.png",
  "sheep.png",
  "farmer.png"
]

var GROWING_RATE = 0.0
var GRASS_MAX_LEVEL = 3
var NUM_SHEEP = 20

var LEVELS = { 
  level0: {
    width: 5, height: 5,
    farmer: { x: 0, y: 0 },
    sheeps: [ {x: 1, y: 1 } ],
    flowers: [ {x: 4, y: 4 }],
    flowersDie: 0,
    grassWin: 1,
    grass: [
      [3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3]
    ]
  }
}

var ALLOWED_MOVES = [
  {x: -1, y: -1}, {x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: -1},
  {x: 0, y: 1}, {x: 1, y: -1}, {x: 1, y: 0}, {x: 1, y: 1}
]

function clamp(value, min, max) {
  if (min > max) return min;
  return Math.min(Math.max(value, min), max);
}

