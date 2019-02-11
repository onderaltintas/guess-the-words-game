function Game(){
  this.dictionary = {};
  this.difficulty = 0;
  this.currentDifficulty = 1;
  this.score = 0;
}

Game.prototype.init = function(){
  this.dictionary = this.loadDictionary();
  this.difficulties = this.dictionary.getDifficulties();
  this.loadNextLevel(this.difficulties[this.difficulty]);
}

Game.prototype.nextLevel = function(){
  this.difficulty++;
  this.clearEnvironment();
  this.loadNextLevel(this.difficulties[this.difficulty]);
}

Game.prototype.clearEnvironment = function(){
  document.getElementById("puzzleContainer").innerHTML = "";
  document.getElementById("lettersContainer").innerHTML = "";
}

Game.prototype.loadNextLevel = function(difficulty){
  this.currentDifficulty = difficulty;
  var puzzle = this.dictionary.getPuzzle(this.currentDifficulty);
  this.createEnvironment(puzzle, this);
}

Game.prototype.loadDictionary = function(){
  var dictionary = new Dictionary();
  return dictionary;
}

Game.prototype.createEnvironment = function(puzzle){
  this.createUpperPlace(puzzle.sentence);
  this.createBottomPlace(puzzle.sentence);
}

Game.prototype.createUpperPlace = function(sentence, game){
  var puzzleContainer = document.getElementById("puzzleContainer");
  var sentenceLength = sentence.length;
  var words = sentence.split(' ');
  var longestWordLength = 0;
  for(var w = 0; w < words.length; w++){
    if(words[w].length > longestWordLength){
      longestWordLength = words[w].length;
    }
  }
  
  var upperPuzzlePlace = document.getElementById("upperPuzzlePlace");
  var upperWidth = upperPuzzlePlace.offsetWidth;
  var upperHeight = upperPuzzlePlace.offsetHeight;
  var twoPercentHeight = (upperHeight*2/100);
  var twoPercentWidth = (upperWidth*2/100);
  this.blockHeight = Math.floor((upperHeight - (twoPercentHeight*2) - (words.length - 1 * twoPercentHeight)) / words.length);
  this.blockWidth = Math.floor((upperWidth - twoPercentWidth*2) / longestWordLength);
  this.puzzleContainerWidth = (longestWordLength * this.blockWidth + 2);
  puzzleContainer.style.width = this.puzzleContainerWidth + "px";
  var wordContainer = createWordContainer();
  var numLetter = 0;
  for(var i = 0; i < sentenceLength; i++){
    var letter = sentence[i];
    if(letter === ' '){
      wordContainer.style.marginLeft = Math.floor((this.puzzleContainerWidth - (numLetter * this.blockWidth)) / 2) - 2 + "px";
      numLetter = 0;
      puzzleContainer.appendChild(wordContainer);
      var breakPoint = createLineBreak();
      puzzleContainer.appendChild(breakPoint);
      wordContainer = createWordContainer();
      continue;
    }
    
    numLetter++;
    var aLetter = createLetter(this.blockWidth, this.blockHeight, letter);
    aLetter.classList.add("notFoundYet");
    aLetter.setAttribute("data-hiddenVal", letter);  
    wordContainer.appendChild(aLetter);
  }
  
  wordContainer.style.marginLeft = Math.floor((this.puzzleContainerWidth - (numLetter * this.blockWidth)) / 2) - 2 + "px";
  puzzleContainer.appendChild(wordContainer);
}

Game.prototype.createBottomPlace = function(sentence, game){
  var letters = removeSpaces(sentence);
  letters = shuffle(letters);
  var lettersContainer = document.getElementById("lettersContainer");
  lettersContainer.style.width = this.puzzleContainerWidth + "px";
  for(var i = 0; i < letters.length;i++){
    var l = createLetter(this.blockWidth, this.blockHeight, letters[i]);
    l.innerHTML = letters[i];
    this.addListeners(l);
    lettersContainer.appendChild(l);
  }
}

Game.prototype.checkWin = function(){
  var self = this;
  var notFoundLetters = document.getElementsByClassName("notFoundYet");
  if(!notFoundLetters.length){
    toasty();
    setTimeout(function(){
      self.nextLevel(self.difficulty);
    });
  }
}

Game.prototype.addListeners = function(elem){
  var self = this;
  var dragItem = elem;
  var active = false;
  var currentX;
  var currentY;
  var initialX;
  var initialY;
  var xOffset = 0;
  var yOffset = 0;
  function dragStart(e) {
    if (e.type === "touchstart") {
      initialX = e.touches[0].clientX - xOffset;
      initialY = e.touches[0].clientY - yOffset;
    } else {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
    }

    if (e.target === dragItem) {
      dragItem.style.zIndex = 9999;
      active = true;
    }
  }

  function dragEnd(e) {
    var x,y;
    if (e.type === "touchend") {
      x = e.touches.length?e.touches[0].clientX:e.changedTouches[0].clientX;
      y = e.touches.length?e.touches[0].clientY:e.changedTouches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }
    
    var found = false;
    var elementsAtPosition = document.elementsFromPoint(x,y);
    for(var i =0; i <elementsAtPosition.length;i++){
      if(elementsAtPosition[i].getAttribute("data-hiddenval") === e.currentTarget.innerHTML){
        elementsAtPosition[i].innerHTML = e.currentTarget.innerHTML;
        elementsAtPosition[i].classList.remove("notFoundYet");
        e.currentTarget.parentElement.removeChild(e.currentTarget);
        found = true;
        break;
      }
    }
    
    if(!found){
      xOffset = initialX = currentX = 0;
      yOffset = initialY = currentY = 0;
      dragItem.style.zIndex = 1;
      active = false;
      setTranslate(0,0,e.currentTarget);
    }
    
    self.checkWin();
  }

  function drag(e) {
    if (active) {
      e.preventDefault();
    
      if (e.type === "touchmove") {
        currentX = e.touches[0].clientX - initialX;
        currentY = e.touches[0].clientY - initialY;
      } else {
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
      }

      xOffset = currentX;
      yOffset = currentY;

      setTranslate(currentX, currentY, dragItem);
    }
  }

  function setTranslate(xPos, yPos, el) {
    el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
  }
  
  elem.addEventListener("touchstart", dragStart, false);
  elem.addEventListener("touchend", dragEnd, false);
  elem.addEventListener("touchmove", drag, false);

  elem.addEventListener("mousedown", dragStart, false);
  elem.addEventListener("mouseup", dragEnd, false);
  elem.addEventListener("mousemove", drag, false);
}

function createWordContainer(){
  var wordContainer = document.createElement("div");
  wordContainer.classList.add("wordContainer");
  return wordContainer;
}

function createLineBreak(){
  var b = document.createElement("div");
  b.classList.add("newLine");
  return b;
}

function createLetter(blockWidth, blockHeight, letter){
  var d = document.createElement("div");
  //d.innerHTML = letter;
  d.classList.add("aLetter");
  d.classList.add("card");
  d.classList.add("card-2");
  d.style.width = blockWidth+"px";
  d.style.height = blockHeight+"px";
  return d;
}

function removeSpaces(sentence){
  var letters = [];
  for(var i =0; i < sentence.length; i++){
    if(sentence[i] !== ' '){
      letters.push(sentence[i]);
    }
  }
  
  return letters;
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function toasty(){
  document.getElementById("toastyDiv").style.right = "0px";
  document.getElementById("toastyDiv").style.bottom = "0px";
  playToasty();
  setTimeout(function(){
    document.getElementById("toastyDiv").style.right = "-400px";
    document.getElementById("toastyDiv").style.bottom = "-400px";
  },3000)
}

function playToasty(){
  var audio = new Audio('../sound/toasty.ogg');
  audio.play();
}

var game = new Game();
game.init();

