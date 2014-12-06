
function onGrid(width, height, fn) {
  return _.times(width, function(x) {
    return _.times(height, function(y) { return fn(x,y) })
  })
}

function constantGrid(width, height, constant) {
  return onGrid(width, height, _.constant(constant))
}

function Grid(width, height) {
  this.width = width;
  this.height = height;
  this.taken = constantGrid(width, height, -1);
  this.positions = {};

  var grid = this;
  function Position(id, x, y) {
    this.x = x;
    this.y = y;
    this.move = function(x, y) {
      if (this.x >= 0 && this.x < width &&
        this.y >= 0 && this.y < height) {
        grid.taken[this.x][this.y] = -1;
      }

      this.x = x;
      this.y = y;
      grid.taken[x][y] = id;
    }

    this.free = function(x, y) {
      if (!grid.inBounds(x,y)) return false;
      var taken = grid.taken[x][y];
      return taken < 0 || taken == id;
    }
  }

  this.inBounds = function(x, y) {
    return x >= 0 && x < width && y >= 0 && y < height;
  }

  this.allocate = function(id, x, y) {
    this.positions[id] = new Position(id, x,y);
    this.taken[x][y] = id;
    return this.positions[id];
  };

  this.deallocate = function(id) {
    var pos = this.positions[id];
    this.taken[pos.x][pos.y] = -1;
    delete this.positions[id];
  }

  this.at = function(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return null;
    return this.taken[x][y]
  }
  
  this.hasEntity = function(x, y) {
    if (!this.inBounds(x,y)) return false;
    return this.taken[x][y] != -1;
  }
}





