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
var NUM_SHEEP = 20

var ALLOWED_MOVES = [
  {x: -1, y: -1}, {x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: -1},
  {x: 0, y: 1}, {x: 1, y: -1}, {x: 1, y: 0}, {x: 1, y: 1}
]

function clamp(value, min, max) {
  if (min > max) return min;
  return Math.min(Math.max(value, min), max);
}
