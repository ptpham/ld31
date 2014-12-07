window.onload = function() {
  $(window).on("flowers:changed", function() {
    if (gameOver) return;
    var remain = Math.max(flowers.alive - flowersDie, 0);
    flowerCount.innerHTML = remain;
    if (remain == 0) {
      $("#overlayLose").show();
      gameOver = true;
    }
  });

  $(window).on("grass:eaten", function(e, g) {
    if (gameOver) return;
    grassEaten += g;
    var percent = Math.min(100*grassEaten/grassWin, 100);
    $("#progressBar span").css("width", percent + "%");
    if (percent == 100) {
      $("#overlayWin").show();
      gameOver = true;
    }
  });

  $(".levelSwitch").on("click", function() {
    if (this.id == "levelRandom") {
      randomLevel();
    } else {
      switchLevel(this.id);
    }
  });

  $(".overlay button").on("click", function() {
    $(".overlay").hide();
  });

  $("#startGame").on("click", function() {
    $("#launchScreen").css("display", "none")
    $("#gameScreen").css("display", "inline-block")
    gameInit()
  });

  loadImages();
}
