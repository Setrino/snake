var width = 500,
//width of the canvas
  height = 320,
//height of the canvas
  dim = 20,
//if someone ate the sweet
  ate = false,

  startGame = true,
  endGame = false,
  endGamePrev = false,

  grid = null,
  snakes = [],
//map player no. -> team no.
  snakesMap = {},
//map player no. -> snake instance
  snakesIns = {},

  c = document.getElementById('c'),
//canvas itself
  ctx = c.getContext('2d');
//and two-dimensional graphic context of the
//canvas, the only one supported by all 
//browsers for now
  localPlayer = null;

c.width = width;
c.height = height;
//setting canvas size

//grid size
noOfx = Math.floor(width / dim);
noOfy = Math.floor(height / dim);

//Game grid used for AI to navigate and to place sweets
function initializeGrid(){

    console.log("Grid");

        grid = new Array(noOfy);
    for(var i = 0; i < noOfy; i++){
        grid[i] = new Array(noOfx);
        for(var j = 0; j < noOfx; j++){
            grid[i][j] = 0;
        }
    }
}

function addSweets(){

        if(!ate){
            grid[3][3] = 1;
        }
}

var clear = function(){
  ctx.fillStyle = '#d0e7f9';
//UPDATE - as 'Ped7g' noticed - using clearRect() in here is useless, we cover whole surface of the canvas with blue rectangle two lines below. I just forget to remove that line
//ctx.clearRect(0, 0, width, height);
//clear whole surface
  ctx.beginPath();
//start drawing
  ctx.rect(0, 0, width, height);
//draw rectangle from point (0, 0) to
//(width, height) covering whole canvas
  ctx.closePath();
//end drawing
  ctx.fill();
//fill rectangle with active
//color selected before
}

var howManyCircles = 10, circles = [];

for (var i = 0; i < howManyCircles; i++) 
  circles.push([Math.random() * width, Math.random() * height, Math.random() * 100, Math.random() / 2]);
//add information about circles into
//the 'circles' Array. It is x & y positions, 
//radius from 0-100 and transparency 
//from 0-0.5 (0 is invisible, 1 no transparency)

var DrawCircles = function(){
  for (var i = 0; i < howManyCircles; i++) {
    ctx.fillStyle = 'rgba(255, 255, 255, ' + circles[i][3] + ')';
//white color with transparency in rgba
    ctx.beginPath();
    ctx.arc(circles[i][0], circles[i][1], circles[i][2], 0, Math.PI * 2, true);
//arc(x, y, radius, startAngle, endAngle, anticlockwise)
//circle has always PI*2 end angle
    ctx.closePath();
    ctx.fill();
  }
};

var MoveCircles = function(deltaY){
  for (var i = 0; i < howManyCircles; i++) {
    if (circles[i][0] - circles[i][2] > width) {
//the circle is under the screen so we change
//informations about it 
      circles[i][1] = Math.random() * height;
      circles[i][2] = Math.random() * 100;
      circles[i][0] = 0 - circles[i][2];
      circles[i][3] = Math.random() / 2;
    } else {
//move circle deltaY pixels down
      circles[i][0] += deltaY;
    }
  }
};

//originalPosition, dim (predefined at the beginning), direction of travel (n = 0, e = 1, s = 2, w = 3), size of
//original array, colour of snake, computer or human controlled, step is used to track number of movements made,
//number of sweets eaten
function Snake(size, orgP, orgDir, color, ai, number, team){

    this.keypressed = false;
    this.step = 0;
    this.sweets = 0;
    this.alive = true;
    this.color = color;
    this.size = size;
    this.orgX = this.orgY = orgP;
    this.orgDir = orgDir;
    this.snakeA = [];
    this.ai = ai;
    this.number = number;
    this.team = team;

    this.create();
}


//OriginalX, Original Y, OriginalDirection (n = 0, e = 1, s = 2, w = 3)
Snake.prototype.create = function(){

    for(var i = 0; i < this.size; i++){
        this.snakeA.push([this.orgX, this.orgY, this.orgDir]);
    }
}

//Draw snake on canvas and upgrade the grid position if the snake has died.
Snake.prototype.draw = function(){

    ctx.fillStyle = this.color;

    for(var i = 0; i < this.snakeA.length; i++){
        ctx.fillRect(this.snakeA[i][0] * dim, this.snakeA[i][1] * dim, dim, dim);
    }
    this.drawFace();
}

Snake.prototype.died = function(){

    this.number = 2;
    this.color = "#000";
    this.alive = false;
    this.toGrid();
}

//Main snake logic. KeyStroke recognition, Sending data, Receiving data
Snake.prototype.update = function(){

    var prev = [this.snakeA[0][0], this.snakeA[0][1], this.snakeA[0][2]];

    this.randomDirection();

    //Left, Top is (0,0)
    switch(this.snakeA[0][2]){

        case 0:
            this.snakeA[0][1] -=1;
            break;
        case 1:
            this.snakeA[0][0] +=1;
            break;
        case 2:
            this.snakeA[0][1] +=1;
            break;
        case 3:
            this.snakeA[0][0] -=1;
            break;
    }

    if(this.snakeA[0][0] < 0){
        this.snakeA[0][0] = 0;
    }else if(this.snakeA[0][1] < 0){
        this.snakeA[0][1] = 0;
    }

    //console.log(this.snakeA[0][0] + " " + this.snakeA[0][1] + " " + this.snakeA[0][2]);

    if(this.step != 0){
    for(var i = 1; i < this.snakeA.length; i++){
        var temp = [this.snakeA[i][0], this.snakeA[i][1], this.snakeA[i][2]];

        if(this.snakeA[0][0] == this.snakeA[i][0] && this.snakeA[0][1] == this.snakeA[i][1]){
                this.died();
        }
        this.snakeA[i][0] = prev[0];
        this.snakeA[i][1] = prev[1];
        this.snakeA[i][2] = prev[2];
        prev = temp.slice();
        }
    }

    try{
        value = grid[this.snakeA[0][1]][this.snakeA[0][0]];
    }catch(err){
        console.log("Snake at " + this.snakeA[0][1] + " " + this.snakeA[0][0]);
        console.log("Grid size " + grid.length + " " + grid[0].length);
    }

    if(grid[this.snakeA[0][1]][this.snakeA[0][0]] == 2){
        console.log("DIED");
    }

    if(value != 0){

        switch(value){
            case 0:
                break;
            case 1:
                this.sweets++;
                ate = true;
                this.add();
                grid[this.snakeA[0][1]][this.snakeA[0][0]] = 0;
                this.toGrid();
                break;
            case 2:
                this.died();
                break;
            /*default:
                if(value.indexOf('_') != -1){
                    console.log("COOL");
                    getSnakeInstance(value.substring(0, value.indexOf('_'))).died();
                    this.died();
                }else{
                    this.died();
                }
                break;*/
        }
    }else{
                this.toGrid();
    }

    this.step++;
    this.keypressed = false;
}

//Using keystroke turn the snake
Snake.prototype.turn = function(turnDir){

    if(this.keypressed == false){
        if(turnDir != this.snakeA[0][2] && (turnDir + 2) % 4 != this.snakeA[0][2]){
            this.snakeA[0][2] = turnDir;
            console.log(turnDir);
        }
    }
    this.keypressed = true;
}

//Provide turning options for the snake in case of collision with the walls, or after some time with different
//probabilities
Snake.prototype.randomDirection = function(){

    prev = this.snakeA[0][2];

    if(this.step % 10 == 0 && this.ai && Math.random() < 0.7){

        temp = Math.random();
        if(temp > 0.2 && temp < 0.6){
          this.snakeA[0][2] = (this.snakeA[0][2] + 1) % 4;
        }else if(temp > 0.6){
          this.snakeA[0][2] = (this.snakeA[0][2] + 3) % 4;
        }
    }

    if(this.snakeA[0][0] == this.snakeA[0][1] && this.snakeA[0][0] == 0){
        switch(this.snakeA[0][2]){
            case 0:
                this.snakeA[0][2] = 1;
                break;
            case 3:
                this.snakeA[0][2] = 2;
                break;
        }
    }else if(this.snakeA[0][0] == (noOfx - 1) && this.snakeA[0][1] == (noOfy - 1)){
        switch(this.snakeA[0][2]){
            case 1:
                this.snakeA[0][2] = 0;
                break;
            case 2:
                this.snakeA[0][2] = 3;
                break;
        }
    }else if(this.snakeA[0][0] == (noOfx - 1) && this.snakeA[0][1] == 0){
        switch(this.snakeA[0][2]){
            case 0:
                this.snakeA[0][2] = 3;
                break;
            case 1:
                this.snakeA[0][2] = 2;
                break;
        }
    }else if(this.snakeA[0][1] == (noOfy - 1) && this.snakeA[0][0] == 0){
        switch(this.snakeA[0][2]){
            case 2:
                this.snakeA[0][2] = 1;
                break;
            case 3:
                this.snakeA[0][2] = 0;
                break;
        }
    }else if(this.snakeA[0][1] == (noOfy - 1) && this.snakeA[0][2] == 2
        || this.snakeA[0][1] == 0 && this.snakeA[0][2] == 0){
        this.snakeA[0][2] = Math.random() < 0.5 ? 1 : 3;
    }
    else if(this.snakeA[0][0] == (noOfx - 1) && this.snakeA[0][2] == 1
        || this.snakeA[0][0] == 0 && this.snakeA[0][2] == 3){
        this.snakeA[0][2] = Math.random() < 0.5 ? 0 : 2;
    }

    if(this.snakeA[0][2] == (prev + 2) % 4){
        this.snakeA[0][2] = prev;
    }
}

//Adds one extra block for the snake
Snake.prototype.add = function(){

    tail = this.snakeA.length - 1;

    switch(this.snakeA[tail][2]){
        case 0:
            this.snakeA.push([this.snakeA[tail][0], this.snakeA[tail][1] + 1, 0]);
            break;
        case 1:
            this.snakeA.push([this.snakeA[tail][0] - 1, this.snakeA[tail][1], 0]);
            break;
        case 2:
            this.snakeA.push([this.snakeA[tail][0], this.snakeA[tail][1] - 1, 0]);
            break;
        case 3:
            this.snakeA.push([this.snakeA[tail][0] + 1, this.snakeA[tail][1], 0]);
            break;
    }
}

Snake.prototype.toGrid = function(){

    if(this.alive){
        grid[this.snakeA[0][1]][this.snakeA[0][0]] = this.number + "_";
        for(var i = 1; i < this.snakeA.length; i++){
            grid[this.snakeA[i][1]][this.snakeA[i][0]] = this.number;
        }
    }else{
        for(var i = 0; i < this.snakeA.length; i++){
            grid[this.snakeA[i][1]][this.snakeA[i][0]] = this.number;
        }
    }
}

Snake.prototype.drawFace = function(){

    ctx.strokeStyle = "#000";
    qDim = dim / 4;
    tDim = dim / 10;
    var x;
    var y;

    //20 + 6, 40 + 15
    if(this.snakeA[0][2] == 0){
        x = this.snakeA[0][0] * dim + qDim + 1;
        y = this.snakeA[0][1] * dim + qDim;
    }else if(this.snakeA[0][2] == 1){
        x = this.snakeA[0][0] * dim + 3 * qDim;
        y = this.snakeA[0][1] * dim + qDim + 1;
    }else if(this.snakeA[0][2] == 2){
        x = this.snakeA[0][0] * dim + qDim + 1;
        y = this.snakeA[0][1] * dim +  3 * qDim;
    }else if(this.snakeA[0][2] == 3){
        x = this.snakeA[0][0] * dim + qDim;
        y = this.snakeA[0][1] * dim + qDim + 1;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, tDim, 0, Math.PI * 2, false);
    ctx.stroke();
    if(x == this.snakeA[0][0] * dim + qDim + 1){
        ctx.moveTo(x + qDim + 2, y);
        ctx.arc(x + qDim + 2, y, tDim, 0, Math.PI * 2, false);
    }else if(y == this.snakeA[0][1] * dim + qDim + 1){
        ctx.moveTo(x, y + qDim + 2);
        ctx.arc(x, y + qDim + 2, tDim, 0, Math.PI * 2, false);
    }
    ctx.stroke();
    ctx.closePath();
}

var snake;

function reset(){

    console.log("Restart");

    endGamePrev = endGame;
    endGame = false;
    ate = false;
    grid = [];
    snakes = [];
    snakesMap = {};
    snakesIns = {};

    initializeGrid();

    snake = new Snake(5, 2, 2, "red", false, 4, 0);
var snake2 = new Snake(6, 5, 0, "orange", true, 5, 0);
    var snake3 = new Snake(7, 8, 1, "blue", true, 6, 1);
var snake4 = new Snake(8, 14, 3, "green", true, 7, 1);

    t1 = [snake, snake2];
    t2 = [snake3, snake4];
    snakes.push(t1, t2);

    for(t in snakes){
        for(s in snakes[t]){
            snakesMap[snakes[t][s].number] = snakes[t][s].team;
            snakesIns[snakes[t][s].number] = snakes[t][s];
        }
    }
}
reset();

//----------- Game Loops -----------//

var snakeLoop = function(){

    emptyGrid();

    for(t in snakes){
        for(s in snakes[t]){
            if(snakes[t][s].alive){
                snakes[t][s].update();
            }else{
                snakes[t][s].toGrid();
            }
        }
    }

    debugGrid();

    winGame();

    if(!endGame)
    gLoop = setTimeout(snakeLoop, 1000 / 2);
}
snakeLoop();

var gameLoop = function(){
  clear();
  MoveCircles(4);
  DrawCircles();
  drawItems();

  for(t in snakes){
      for(s in snakes[t]){
          snakes[t][s].draw();
      }
  }
  drawGrid(noOfx, noOfy);

  if(!endGame){
    gLoop = setTimeout(gameLoop, 1000 / 40);
  }else{
      gameOver();
  }
}
gameLoop();

//----------- Game Loops -----------//

//Click on the restart button on the overlay window calls the restart option
function restart(){

    reset();
    if(endGamePrev){
    snakeLoop();
    gameLoop();
    }
    doOverlayClose();
}

function getTeam(player){

    return snakesMap[player];
}

//Provide player number and return a player object instance
//snakesIns[] - map player no. -> snake
function getSnakeInstance(player){

    return snakesIns[player];
}

function drawGrid(x, y){

    ctx.beginPath();
    ctx.strokeStyle = "black";

    for(var i = 1; i < noOfy; i++){

        ctx.moveTo(0, i * dim);
        ctx.lineTo(noOfx * dim, i * dim);
        ctx.stroke();
    }

    for(var i = 1; i < noOfx; i++){

        ctx.moveTo(i * dim, 0);
        ctx.lineTo(i * dim, noOfy * dim);
        ctx.stroke();
    }
    ctx.closePath();
}

function emptyGrid(){

        for(var i = 0; i < grid.length; i++){
            for(var j = 0; j < grid[0].length; j++){
                grid[i][j] = 0;
            }
        }

    addSweets();
}

function debugGrid(){


    console.log("--- " + snake.step + " -------------------------------------")

        for(var i = 0; i < grid.length; i++){
            temp = "";
            for(var j = 0; j < grid[0].length; j++){
                temp += grid[i][j] + " ";
            }
            console.log("Row " + i + "| " + temp);
        }
}

//Draw sweets on the grid
function drawItems(){

    ctx.beginPath();
    ctx.fillStyle = "#696969";

    for(var i = 0; i < grid.length; i++){
        for(var j = 0; j < grid[0].length; j++){

            if(grid[i][j] == 1)
                ctx.fillRect(i * dim, j * dim, dim, dim);
        }
    }
    ctx.closePath();
}

function winGame(){

    teamAlive = false;

    for(var i = 0; i < snakes.length; i++){
        for (s in snakes[i]){

            teamAlive = teamAlive || snakes[i][s].alive;
        }
            if(teamAlive == false){
                endGame = true;
            }
    }
}

function gameOver(){

    /*
    console.log("Game Over");
    ctx.fillStyle = "red";
    ctx.font = "10pt Arial";
    ctx.fillText("GAME OVER", width / 2 - 40, height / 2 - 40);
    ctx.fillText("YOUR RESULT:" + snakes[0][0].sweets, width / 2 - 50, height / 2 - 20);
    */
    doOverlayOpen();
}

function aiLogic(){

    for(var i = 0; i < snakes; i++){
        for(var j = 0; j < snakes[i]; j++){
            if(snakes[i][j].ai)
            closestEnemy(i, j + 4, snakes[i][j], snakes[i][j].snakeA[0]);
        }
    }
}

/*
0 - empty cell, 1 - sweet, 2 - dead/wall, 4-9 - player
(n = 0, e = 1, s = 2, w = 3)
p - current ai, minD is the distance to the closest enemy body
temp - Euclid/Pythagoras formula for distance
*/
function closestEnemy(team, p, snake, head){

    tempSnake = [];
    minD = null;

    for(var i = 0; i < grid.length; i++){
        for(var j = 0; j < grid[0].length; j++){

            switch(grid[i][j]){
                case 1:
                    break;
                case 2:
                    break;
                case 3:
                    break;
                default:
                    temp = Math.sqrt(Math.pow(i - head[0], 2)+ Math.pow(j - head[1], 2));
                    if(getTeam(grid[i][j]) != team && (minD == null || minD > temp)){
                        minD = temp;
                        tempSnake = [i, j, grid[i][j]];
                    }
                    break;
            }
        }
    }

    angle = Math.atan2(head[1] - tempSnake[1], head[0] - tempSnake[0]);

    if(0 <= angle && angle < Math.PI / 4){
                switch(snake[0][2]){
                    case 0:
                    case 2:
                        snake[0][2] = 1;
                        break;
                    case 3:
                        snake[0][2] = 0;
                        break;
                }
    }else if(Math.PI / 4 <= angle && angle < Math.PI / 2){
                switch(snake[0][2]){
                    case 1:
                    case 3:
                        snake[0][2] = 0;
                        break;
                    case 2:
                        snake[0][2] = 1;
                        break;
                }
    }else if(Math.PI / 2 <= angle && angle < 3 / 4 * Math.PI){
                switch(snake[0][2]){
                    case 1:
                    case 3:
                        snake[0][2] = 0;
                        break;
                    case 2:
                        snake[0][2] = 3;
                        break;
                }
    }else if(3 * 4 / Math.PI <= angle && angle < Math.PI){
                switch(snake[0][2]){
                    case 0:
                    case 2:
                        snake[0][2] = 3;
                        break;
                    case 1:
                        snake[0][2] = 0;
                        break;
                }
    }else if(Math.PI <= angle && angle < 5 / 4 * Math.PI){
                switch(snake[0][2]){
                    case 0:
                    case 2:
                        snake[0][2] = 3;
                        break;
                    case 1:
                        snake[0][2] = 2;
                        break;
                }
    }else if(5 / 4 * Math.PI <= angle && angle < 3 * 2 / Math.PI){
                switch(snake[0][2]){
                    case 0:
                        snake[0][2] = 3;
                        break;
                    case 1:
                    case 3:
                        snake[0][2] = 2;
                        break;
                }
    }else if(3 * 2 / Math.PI <= angle && angle < 7 * 4 / Math.PI){
                switch(snake[0][2]){
                    case 0:
                        snake[0][2] = 1;
                        break;
                    case 1:
                    case 3:
                        snake[0][2] = 2;
                        break;
                }
    }else if(7 * 4 / Math.PI <= angle && angle < 0){
                switch(snake[0][2]){
                    case 0:
                    case 2:
                        snake[0][2] = 1;
                        break;
                    case 3:
                        snake[0][2] = 2;
                        break;
                }
    }
}

document.onkeypress = function(e){

    var temp = e.charCode;
    if(e.charCode > 96 && e.charCode < 123){
        temp -= 32;
    }

    switch(temp){
        //W 87
        case 87:
            console.log("Up");
            snake.turn(0);
            break;
        //D 68
        case 68:
            console.log("Right");
            snake.turn(1);
            break;
        //S 83
        case 83:
            console.log("Down");
            snake.turn(2);
            break;
        //A 65
        case 65:
            console.log("Left");
            snake.turn(3);
            break;
    }
}

document.onkeyup = function(e){

    e = e || window.event;
    switch(e.keyCode){
        //Up 38
        case 38:
            snake.turn(0);
            break;
        //Right 39
        case 39:
            snake.turn(1);
            break;
        //Down 40
        case 40:
            snake.turn(2);
            break;
        //Left 37
        case 37:
            snake.turn(3);
            break;
    }
}


var isOpen = false;

function showOverlayBox() {
    //if box is not set to open then don't do anything
    if( isOpen == false ) return;
    // set the properties of the overlay box, the left and top positions
    if(snake.alive)
    $('.player').html('Player 1').css({color: snake.color});
    console.log(snake.sweets);
    $('.score').html('Your score is ' + snake.sweets);

    $('.overlayBox').css({
        display:'block',
        left:( $(window).width() - $('.overlayBox').width() )/2,
        top:( $(window).height() - $('.overlayBox').height() )/2 -20,
        position:'absolute'
    });
    // set the window background for the overlay. i.e the body becomes darker
    $('.bgCover').css({
        display:'block',
        width: $(window).width(),
        height:$(window).height()
    });
}

function alignLaunchLink(){
    $('.launchLink').css({
        left:( $('#c').width() - $('.launchLink').width() + 1 ),
        top:( $('.launchLink').height() - $('#c').height() + 18 )
    });
}

function pvp(player){

    localPlayer = player;

    //$('.info').html('The PvP is not yet available');
    $('#play').html('<span><input type="button" value="Host" onclick="host()" class="pvpHJ"></span>' +
        '<span><input type="button" value="Join" onclick="join()" class="pvpHJ"></span>');
}

function pvc(){

    $('#play').css('display', 'none');
    $('#gameData').css('display', 'block');
    restart();
    doOverlayClose();
    startGame = false;
}

function setupPvP(callback){

    $('#play').html('<span><input type="button" value="1v1" class="pvpNumb"></span>' +
        '<span><input type="button" value="2v2" class="pvpNumb"></span>' +
        '<span><input type="button" value="3v3" class="pvpNumb"></span>' +
        '<span><input type="button" value="4v4" class="pvpNumb"></span>' +
        '<p class="info"></p>');

    $('.pvpNumb').on('click', function(){ pvpNumber(this.value, callback)});
}

function host(){

    setupPvP(hostPvP);
}

function join(){

    setupPvP(joinPvP);
    currentPvP();
}

function pvpNumber(number, callback){

    switch(number){
        case '1v1':
            callback(localPlayer, 1);
            break;
        case '2v2':
            callback(localPlayer, 2);
            break;
        case '3v3':
            callback(localPlayer, 3);
            break;
        case '4v4':
            callback(localPlayer, 4);
            break;
    }
}

function doOverlayOpen() {
    //set status to open
    isOpen = true;
    if(endGame){
        if(startGame){
        $('#play').css('display', 'block');
        $('#gameData').css('display', 'none');
        }else{
        $('#play').css('display', 'block').removeClass('play').addClass('play-not');
        $('#gameData').css('display', 'block');
        }
    }else{
        $('#play').css('display', 'none');
        $('#gameData').css('display', 'block');
    }
    showOverlayBox();
    $('.bgCover').css({opacity:0}).animate( {opacity:0.5, backgroundColor:'#000'} );
    // don't follow the link : so return false.
    return false;
}

function doOverlayClose() {
    //set status to closed
    isOpen = false;
    $('.info').html('');
    $('.overlayBox').css( 'display', 'none' );
    // now animate the background to fade out to opacity 0
    // and then hide it after the animation is complete.
    $('.bgCover').animate( {opacity:0}, null, null, function() { $(this).hide(); } );
}
// if window is resized then reposition the overlay box

$(document).ready(function(){

    alignLaunchLink();
    endGame = true;
    doOverlayOpen();

    $(window).bind('resize',showOverlayBox);
// activate when the link with class launchLink is clicked
    $('a.launchLink').click(doOverlayOpen);
// close it when closeLink is clicked
    $('a.closeLink').click(doOverlayClose);
// reset the game
    $('input.restart').click(restart);
});