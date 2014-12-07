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
    name: "Level 0: The Grove",
    flowersCanEat: 6,
    grassWin: 130,
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
  },
  level1: {
    name: "Level 1: The Garden Path",
    flowersCanEat: 25,
    grassWin: 100,
    map: [
      ["3f", "3f", "20", "10", "20", "3f", "3f", "3f", "3f"],
      ["3f", "3f", "20", "2s", "2m", "2s", "3f", "3f", "3f"],
      ["3f", "3f", "3f", "20", "20", "20", "3f", "3f", "3f"],
      ["3f", "3f", "3f", "3f", "20", "20", "20", "3f", "3f"],
      ["3f", "3f", "3f", "3f", "20", "10", "20", "20", "3f"],
      ["3f", "3f", "3f", "3f", "20", "10", "20", "20", "3f"],
      ["3f", "3f", "3f", "20", "20", "20", "20", "3f", "3f"],
      ["3f", "3f", "20", "20", "20", "20", "3f", "3f", "3f"],
      ["3f", "20", "20", "10", "20", "3f", "3f", "3f", "3f"],
      ["20", "20", "10", "10", "20", "3f", "3f", "3f", "3f"],
      ["20", "20", "10", "10", "20", "3f", "3f", "3f", "3f"],
      ["3f", "20", "10", "10", "20", "20", "3f", "3f", "3f"],
      ["3f", "20", "20", "10", "10", "20", "20", "3f", "3f"],
      ["3f", "3f", "20", "20", "10", "10", "20", "3f", "3f"],
      ["3f", "3f", "3f", "20", "20", "10", "20", "20", "3f"],
      ["3f", "3f", "3f", "3f", "20", "20", "20", "20", "20"],
      ["3f", "3f", "3f", "3f", "3f", "20", "10", "20", "20"],
      ["3f", "3f", "3f", "3f", "20", "20", "10", "12", "20"],
      ["3f", "3f", "3f", "20", "20", "10", "12", "12", "3f"],
      ["3f", "3f", "20", "20", "10", "12", "12", "3f", "3f"],
      ["3f", "3f", "20", "10", "10", "12", "3f", "3f", "3f"],
      ["3f", "3f", "20", "10", "12", "3f", "3f", "3f", "3f"],
      ["3f", "3f", "20", "10", "12", "3f", "3f", "3f", "3f"],
    ]
  },
  level2: {
    name: "Level 2: The Hedge Patio",
    flowersCanEat: 11,
    grassWin: 100,
    map: [
      ["10", "10", "10", "10", "10", "3f", "00", "00", "00", "3f", "10", "10", "10", "10", "10"],
      ["1s", "10", "10", "10", "10", "3f", "00", "3f", "00", "3f", "10", "10", "10", "10", "10"],
      ["10", "10", "10", "10", "10", "3f", "00", "3f", "00", "3f", "10", "2f", "20", "2f", "10"],
      ["1s", "10", "3f", "10", "10", "3f", "00", "3f", "00", "3f", "10", "20", "20", "20", "10"],
      ["10", "1s", "30", "30", "10", "3f", "00", "3f", "00", "3f", "10", "20", "20", "20", "10"],
      ["1s", "30", "3m", "30", "3f", "3f", "00", "3f", "00", "3f", "10", "20", "20", "20", "10"],
      ["10", "1s", "30", "30", "10", "3f", "00", "3f", "00", "3f", "10", "20", "20", "20", "10"],
      ["1s", "10", "3f", "10", "10", "3f", "00", "3f", "00", "3f", "10", "20", "20", "20", "10"],
      ["10", "10", "10", "10", "10", "3f", "00", "3f", "00", "3f", "10", "2f", "20", "2f", "10"],
      ["1s", "10", "10", "10", "10", "3f", "00", "3f", "00", "3f", "00", "10", "10", "10", "10"],
      ["10", "10", "10", "10", "10", "00", "00", "3f", "00", "00", "00", "00", "10", "10", "10"]
    ]
  },
  hungerTestLevel: {
    flowersCanEat: 60,
    grassWin: 150,
    map: [
      ["3f", "30", "30", "30", "30", "30", "30", "30", "3f"],
      ["3f", "30", "30", "30", "30", "30", "30", "30", "30"],
      ["30", "30", "30", "30", "3m", "30", "30", "30", "30"],
      ["00", "00", "00", "00", "00", "00", "00", "00", "00"],
      ["00", "00", "00", "00", "00", "00", "00", "00", "00"],
      ["00", "00", "0f", "00", "00", "00", "00", "00", "00"],
      ["00", "00", "0f", "0f", "00", "00", "0f", "00", "00"],
      ["00", "00", "00", "0f", "00", "0f", "00", "00", "00"],
      ["0s", "0s", "0s", "0s", "0s", "0s", "0s", "0s", "0s"],
      ["0s", "0s", "0s", "0s", "0s", "0s", "0s", "0s", "0s"],
      ["0s", "0s", "0s", "0s", "0s", "0s", "0s", "0s", "0s"],
      ["0s", "0s", "0s", "0s", "0s", "0s", "0s", "0s", "0s"]
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

