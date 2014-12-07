function Sheeps(sprites, grid) {
  var SHEEP_MOVE_LIKELIHOOD = 0.5
  var EATING_RATE = 0.4
  var HUNGER_MIN = 0;

  var sheeps = this;
  this.entities = {};
  this.allocate = function(x, y) {
    var id = nextEntity++;
    this.entities[id] = { hunger: 0 };
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
      var eaten = oldHeight - newHeight;
      grassHeights[x][y] = newHeight;
      if (eaten == 0) sheep.hunger++;
      else if (sheep.hunger > HUNGER_MIN) sheep.hunger--;
      total += eaten;

      // Move toward a grassy tile globally when it is hungry
      var moved = false;
      if (sheep.hunger > 0) {
        if (!sheep.hasTarget) {
          var x = _.random(grid.width-1);
          var y = _.random(grid.height-1);
          if (grassHeights[x][y] > 1) {
            sheep.hasTarget = true;
            sheep.targetX = x;
            sheep.targetY = y;
          }
        } else {
          var dx = sheep.targetX - x;
          var dy = sheep.targetY - y;
          if (dx == 0 && dy == 0) sheep.hasTarget = false;
          var directionX = Math.abs(dx) > Math.abs(dy);
          var delta = directionX ? dx : dy;
          var sign = delta > 0 ? 1 : -1;
          if (directionX) x += sign;
          else y += sign;

          // If the sheep can't make any progress toward its goal,
          // it gives up and tries to find another target in the future.
          if (pos.free(x, y)) {
            pos.move(x, y);
            moved = true;
          } else sheep.hasTarget = false;
        }
      }

      // Move the sheep when it didn't make any progress to where it wanted to
      // go or when it's not hungry and it randomlly feels like it.
      var x = pos.x, y = pos.y;
      if ((sheep.hunger > 0 && !moved) ||
        (sheep.hunger <= 0 && Math.random() < SHEEP_MOVE_LIKELIHOOD)) {
        var possiblePositions = ALLOWED_MOVES.map(function(offset) {
          return {x: offset.x + x, y: offset.y + y}
        }).filter(function(target) {
          return pos.free(target.x, target.y);
        })

        var choice = rouletteSelection(possiblePositions, function(target) {
          return grassHeights[target.x][target.y] + 1;
        });
        if (choice) pos.move(choice.x, choice.y);
      }

    });

    $(window).trigger("grass:eaten", total);
  }
}

