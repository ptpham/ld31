var context;

window.onload = function() {
    window.onresize = gameRender
    window.setInterval(gameStep, 1000)

    var c = document.getElementById("gameCanvas")
    context = c.getContext("2d")

    gameRender()
}

function gameRender() {
    context.fillStyle = "black"
    context.fillRect(0, 0, 800, 600)
}

function gameStep() {
    console.log("Stepping game")
}
