
function Flowers(sheeps, sprites, grid) {
  this.entities = {};
  this.alive = 0;

  var flowers = this;
  this.allocate = function(x, y) {
    var id = nextEntity++;
    this.entities[id] = { };
    var color = _.sample(["blue", "maroon", "orange"]);
    sprites.addFixed(id, "shrub_" + color + ".png", 0);
    grid.positions[id] = { x: x, y: y };
    this.alive++;
    $(window).trigger("flowers:changed");
    return id;
  }

  this.deallocate = function(id) {
    delete this.entities[id];
    delete grid.positions[id];
    sprites.removeFixed(id);
  }

  this.step = function() {
    _.each(this.entities, function(flower, id) {
      var pos = grid.positions[id];
      var other = grid.taken[pos.x][pos.y];
      if (other in sheeps.entities) { 
        sprites.addFixed(id, "shrub_eaten.png", 0);
        this.alive--;
        $(window).trigger("flowers:changed");
      }
    });
  }
}
