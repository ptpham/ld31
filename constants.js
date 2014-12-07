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
    flowersCanEat: 6,
    grassWin: 150,
    map: [
      ["3f", "30", "20", "10", "10", "20", "30", "30", "3f"],
      ["3f", "30", "20", "20", "10", "20", "20", "30", "30"],
      ["30", "20", "20", "2s", "2m", "2s", "20", "20", "30"],
      ["30", "20", "20", "30", "2s", "20", "20", "2s", "30"],
      ["20", "20", "30", "30", "20", "20", "30", "30", "20"],
      ["20", "20", "3f", "30", "20", "20", "30", "30", "20"],
      ["1s", "20", "3f", "3f", "30", "20", "3f", "30", "20"],
      ["10", "20", "30", "3f", "30", "3f", "30", "30", "20"],
      ["10", "20", "30", "30", "3f", "3f", "3f", "2s", "20"],
      ["20", "20", "20", "30", "30", "3f", "20", "20", "20"],
      ["30", "20", "20", "20", "20", "20", "20", "20", "30"],
      ["3f", "30", "20", "20", "20", "10", "20", "30", "3f"]
    ]
  }
}

var ALLOWED_MOVES = [
  {x: -1, y: 0}, {x: 0, y: -1},
  {x: 0, y: 1}, {x: 1, y: 0}
]

function clamp(value, min, max) {
  if (min > max) return min;
  return Math.min(Math.max(value, min), max);
}

