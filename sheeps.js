function Sheeps(sprites, grid) {
  var SHEEP_MOVE_LIKELIHOOD = 0.1
  var EATING_RATE = 0.4

  this.entities = {};
  this.allocate = function(x, y) {
    var id = nextEntity++;
    this.entities[id] = {};
    var pos = grid.allocate(id, x, y);
    sprites.fixed[id] = resources["sheep.png"];
    return id;
  }

  this.deallocate = function(id) {
    delete entities[id];
    delete sprites.fixed[id];
    grid.deallocate(id);
  }

  this.step = function() {
    _.each(this.entities, function(sheep, id) {
      var pos = grid.positions[id]; 
      var x = pos.x, y = pos.y;

      // Eat the grass under the sheep
      grassHeights[x][y] = Math.max(grassHeights[x][y] - EATING_RATE, 0)

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
        pos.move(choice.x, choice.y);
      }
    });
  }
}

