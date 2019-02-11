function Application(){
  this.mainFrame = document.getElementById("mainFrame");
}

Application.prototype.init = function(){
  this.mainFrame.src = "Game.html";
}

var app = new Application();
app.init();