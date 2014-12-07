function Sheeps(sprites, grid) {
  var SHEEP_MOVE_LIKELIHOOD = 0.1
  var EATING_RATE = 0.4

  var sheeps = this;
  this.entities = {};
  this.allocate = function(x, y) {
    var id = nextEntity++;
    this.entities[id] = {};
    var pos = grid.allocate(id, x, y);
    sprites.addFixed(id, "sheep.png", 4);
    return id;
  }

  this.deallocate = function(id) {
    delete entities[id];
    sprites.removeFixed(id);
    grid.deallocate(id);
  }

  this.step = function() {
    var total = 0;
    _.each(this.entities, function(sheep, id) {
      var pos = grid.positions[id]; 
      var x = pos.x, y = pos.y;

      // Eat the grass under the sheep
      var oldHeight = grassHeights[x][y];
      var newHeight = Math.max(oldHeight - EATING_RATE, 0);
      total += oldHeight - newHeight;
      grassHeights[x][y] = newHeight;

      // Possibly move the sheep
      if (Math.random() < SHEEP_MOVE_LIKELIHOOD) {
        var possiblePositions = ALLOWED_MOVES.map(function(offset) {
          return {x: offset.x + x, y: offset.y + y}
        }).filter(function(target) {
          return pos.free(target.x, target.y);
        })

        var choice = rouletteSelection(possiblePositions, function(target) {
          return grassHeights[target.x][target.y];
        });
        if (choice) pos.move(choice.x, choice.y);
      }
    });
    $(window).trigger("grass:eaten", total);
  }
}

