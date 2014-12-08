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

  $("#overlayLevel").on("click", function(e) {
    if (e.target.tagName.toLowerCase() == "button") {
      gamePaused = false;
      $(window).trigger("flowers:changed");
      $(window).trigger("grass:eaten", 0);
    }
  });

  $(".levelSelector").on("click", function() {
    gamePaused = true;
    $("#overlaySelect").show();
  });

  $("#resume").on("click", function() {
    gamePaused = false;
  });

  $("#nextLevel").on("click", function() {
    if (currentLevel != null) switchLevel(currentLevel.next);
    else randomLevel();
  });

  $("#retry").on("click", function() {
    switchLevel(currentLevel.id);
  });

  $("#startGame").on("click", function() {
    $("#launchScreen").css("display", "none")
    $("#gameScreen").css("display", "inline-block")
    gameInit()
  });

  loadImages();
}
