/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,			// Canvas DOM element
	ctx,			// Canvas rendering context
	keys,			// Keyboard input
	localPlayer,	// Local player
	socket,         // Socket connection
    grid,
    snakeT,         // Snakes teams
    snakesMap,
    dim,
    sweets,
    ate,
    endGame,
    noOfx,
    noOfy,
    pvpNo,
    sessionRoom,    // MySQL table of the current game
    sessionUser;


/**************************************************
** GAME INITIALISATION
**************************************************/
function init(table, p_name) {
	// Declare the canvas and rendering context
    sessionRoom = table;
    sessionUser = p_name;
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");
	// Initialise keyboard controls
	keys = new Keys();
	// Initialise socket connection
	socket = io.connect("http://localhost", {port: 8000, transports: ["websocket"]});
	// Initialise remote players array
    snakeT = [];
    grid = [];
    sweets = [];        // Position of sweets
    snakesMap = {};
    endGame = false;
    // Didn't yet eat anything
    ate = false;
	// Start listening for events
	setEventHandlers();
};


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Keyboard
	window.addEventListener("keypress", onKeyPress, false);
	window.addEventListener("keyup", onKeyUp, false);

	// Window resize
	//window.addEventListener("resize", onResize, false);

	// Socket connection successful
	socket.on("connect", onSocketConnected);

    // Socket get local player details
    socket.on("init player", onLocalPlayer);

    // Socket start game
    socket.on("start", onStart);

    // Socket update game
    socket.on("update", onUpdate);

	// Socket disconnection
	socket.on("disconnect", onSocketDisconnect);

	// New player message received
	socket.on("new player", onNewPlayer);

	// Player move message received
	socket.on("move player", onMovePlayer);

	// Player removed message received
	socket.on("remove player", onRemovePlayer);
};

// Keyboard key down
function onKeyPress(e) {
	if (localPlayer) {
		keys.onKeyPress(localPlayer, e);
	};
};

// Keyboard key up
function onKeyUp(e) {
	if (localPlayer) {
		keys.onKeyUp(localPlayer, e);
	};
};

// Browser window resize
function onResize(e) {
	// Maximise the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};

// Socket connected
function onSocketConnected() {
	console.log("Connected to socket server");

    socket.emit("request data", {sessionUser : sessionUser, sessionRoom: sessionRoom});

	// Send local player data to the game server
};

//Local player setup
function onLocalPlayer(data){
    console.log("Created a local player " + data.size + " " + data.cW);

    canvas.width = data.cW;
    canvas.height = data.cH;
    dim = data.dim;
    pvpNo = data.pvpNo;

    //grid size
    noOfx = Math.floor(data.cW / dim);
    noOfy = Math.floor(data.cH / dim);

    initializeGrid();
    initCircles();

    localPlayer = new Snake(data.size, data.orgX, data.orgY, data.orgDir, data.color, data.ai, data.number, data.team);
    localPlayer.id = data.id;

    snakeT.push(localPlayer);

    socket.emit("new player", {size: localPlayer.getSize(), x: localPlayer.getX(),
        y: localPlayer.getY(), orgDir: localPlayer.getDir(), color: localPlayer.getColor(),
        ai: localPlayer.getAi(), number: localPlayer.getNumber(), team: localPlayer.getTeam()});
}

// Socket disconnected
function onSocketDisconnect() {
	console.log("Disconnected from socket server");
};

// New player
function onNewPlayer(data) {

	// Initialise the new player
	var newPlayer = new Snake(data.size, data.x, data.y, data.orgDir,
        data.color, data.ai, data.number, data.team);
	newPlayer.id = data.id;


    //snakes.splice(1, 1);
    snakeT.push(newPlayer);

};

// Move player
function onMovePlayer(data) {
	var movePlayer = playerById(data.id);

	// Player not found
	if (!movePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	// Update player position
    movePlayer.setStep(data.step);
    movePlayer.setArray(data.snakeA);
};

// Remove player
function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);

	// Player not found
	if (!removePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};


	// Remove player from array
	snakeT.splice(snakeT.indexOf(removePlayer), 1);
};

function onStart(){

    console.log("Game started");

        for(s in snakeT)
            snakesMap[snakeT[s].number] = snakeT[s].team;

    //snakeLoop();
    onUpdate();
    gameLoop();
}

function onUpdate(){

    emptyGrid();

    for(s in snakeT){
        if(snakeT[s].alive){
            if(snakeT[s] == localPlayer){
                snakeT[s].update(grid);
                localPlayer.stepUp();
                socket.emit("move player", {step: localPlayer.getStep(), snakeA: localPlayer.getArray()});
            }
        }
        else
            snakeT[s].toGrid();
    }
    winGame();
}

/**************************************************
** GAME ANIMATION LOOP
**************************************************/
function animate() {
    if(localPlayer){
	update();
	draw();
	// Request a new animation frame using Paul Irish's shim
	window.requestAnimFrame(animate);
    }
};


/**************************************************
** GAME UPDATE
**************************************************/


/**************************************************
** GAME DRAW
**************************************************/

/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < snakeT.length; i++) {
		if (snakeT[i].id == id)
			return snakeT[i];
	};
	return false;
};

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

function getTeam(player){

    return snakesMap[player];
}

function emptyGrid(){

    for(var i = 0; i < grid.length; i++){
        for(var j = 0; j < grid[0].length; j++){
            grid[i][j] = 0;
        }
    }

    addSweets();
}

function addSweets(){

    if(!ate){
        grid[3][3] = 1;
    }
}

function gameOver(){

    console.log("Game Over");
}

var clear = function(){
    ctx.fillStyle = '#d0e7f9';
//UPDATE - as 'Ped7g' noticed - using clearRect() in here is useless, we cover whole surface of the canvas with blue rectangle two lines below. I just forget to remove that line
//ctx.clearRect(0, 0, width, height);
//clear whole surface
    ctx.beginPath();
//start drawing
    ctx.rect(0, 0, canvas.width, canvas.height);
//draw rectangle from point (0, 0) to
//(width, height) covering whole canvas
    ctx.closePath();
//end drawing
    ctx.fill();
//fill rectangle with active
//color selected before
}

var howManyCircles = 10, circles = [];

var initCircles = function(){

    for (var i = 0; i < howManyCircles; i++)
        circles.push([Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 100, Math.random() / 2]);
    //add information about circles into
    //the 'circles' Array. It is x & y positions,
    //radius from 0-100 and transparency
    //from 0-0.5 (0 is invisible, 1 no transparency)
}

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
        if (circles[i][0] - circles[i][2] > canvas.width) {
//the circle is under the screen so we change
//informations about it
            circles[i][1] = Math.random() * canvas.height;
            circles[i][2] = Math.random() * 100;
            circles[i][0] = 0 - circles[i][2];
            circles[i][3] = Math.random() / 2;
        } else {
//move circle deltaY pixels down
            circles[i][0] += deltaY;
        }
    }
};

function winGame(){

    teamAliveA = [];
    for(var i = 0; i < pvpNo; i++)
        teamAliveA.push(false);

    for(s in snakeT)
        teamAliveA[snakeT[s].team] = teamAliveA[snakeT[s].team] || snakeT[s].alive;

    for(a in teamAliveA){
        if(teamAliveA[a] == false)
            endGame = true;
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

function debugGrid(){

    for(var i = 0; i < grid.length; i++){
        temp = "";
        for(var j = 0; j < grid[0].length; j++){
            temp += grid[i][j] + " ";
        }
        console.log("Row " + i + "| " + temp);
    }
}

/**************************************************
 ** GAME LOOPS
 **************************************************/
var snakeLoop = function(){

    emptyGrid();

        for(s in snakeT){

            if(snakeT[s].alive){
                temp = snakeT[s].update(grid);
                if(snakeT[s] === localPlayer && temp)
                    socket.emit("move player", {dir: localPlayer.getDir(), step: localPlayer.getStep()});

            }else{
                snakeT[s].toGrid();
            }
        }

    //debugGrid();

    winGame();

    if(!endGame)
        gLoop = setTimeout(snakeLoop, 1000 / 2);
}

var gameLoop = function(){
    clear();
    MoveCircles(4);
    DrawCircles();
    drawItems();

    for(s in snakeT)
          snakeT[s].draw(ctx);

    drawGrid(noOfx, noOfy);

    if(!endGame){
        gLoop = setTimeout(gameLoop, 1000 / 40);
    }else{
        gameOver();
    }
}