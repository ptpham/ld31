window.onload = function() {
  $(window).on("flowers:changed", function() {
    if (gamePaused) return;
    var remain = Math.max(flowers.alive - flowersDie, 0);
    flowerCount.innerHTML = remain;
    if (remain == 0) {
      $("#overlayLose").show();
      gamePaused = true;
    }
  });

  $(window).on("grass:eaten", function(e, g) {
    if (gamePaused) return;
    grassEaten += g;
    var percent = Math.min(100*grassEaten/grassWin, 100);
    $("#progressBar span").css("width", percent + "%");
    if (percent == 100) {
      $("#overlayWin").show();
      gamePaused = true;
    }
  });

  $(".levelSwitch").on("click", function() {
    if (this.id == "levelRandom") {
      randomLevel();
    } else {
      switchLevel(this.id);
    }
  });

  $(".overlay").on("click", function(e) {
    if (e.target.tagName.toLowerCase() == "button") $(this).hide();
  });

  $("#overlayLevel").on("click", function() {
    gamePaused = false;
    $(window).trigger("flowers:changed");
    $(window).trigger("grass:eaten", 0);
  });

  $("#levelSelect").on("click", function() {
    gamePaused = true;
    $("#overlaySelect").show();
  });

  $("#resume").on("click", function() {
    gamePaused = false;
  });

  $("#startGame").on("click", function() {
    $("#launchScreen").css("display", "none")
    $("#gameScreen").css("display", "inline-block")
    gameInit()
  });

  loadImages();
}
