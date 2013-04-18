/**************************************************
** NODE.JS REQUIREMENTS
**************************************************/
var util = require("util"),					// Utility resources (logging, object inspection, etc)
    connect = require("mysql"),             // MySQL database
    io = require("socket.io"),              // Socket.IO
	Snake = require("./Snake").Snake;	    // Player class

/**************************************************
** GAME VARIABLES
**************************************************/
var socket,		// Socket controller
    connect,
	players,
    pvpNo,      // Array of connected players
    step,       // Step is the current value
    gThis,
    temp = true;

/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	// Create an empty array to store players
	players = [];
	// Set up Socket.IO to listen on port 8000
	socket = io.listen(8000);

    mysql = connect.createConnection({
        host     : 'localhost',
        port     : '8889',
        user     : 'sk',
        password : 'oznEFer',
        database : 'snake'
    });

    mysql.connect(function(err){ if(err) throw err});

	// Configure Socket.IO
	socket.configure(function() {
		// Only use WebSockets
		socket.set("transports", ["websocket"]);

		// Restrict log output
		socket.set("log level", 2);
	});

	// Start listening for events
	setEventHandlers();
};


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Socket.IO
	socket.on("connection", onSocketConnection);
};

// New socket connection
function onSocketConnection(client) {

    client.join('group');

    util.log("New player has connected: " + client.id);

	// Listen for client disconnected
	client.on("disconnect", onClientDisconnect);

	// Listen for new player message
	client.on("new player", onNewPlayer);

	// Listen for move player message
	client.on("move player", onMovePlayer);

    // Listen for move player message
    client.on("request data", onRequestData);

    //Received message from player
    client.on("receive message", onReceiveMessage);
};

// Socket client has disconnected
function onClientDisconnect() {
	util.log("Player has disconnected: "+this.id);

	var removePlayer = playerById(this.id);

	// Player not found
	if (!removePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	// Remove player from players array
	players.splice(players.indexOf(removePlayer), 1);

	// Broadcast removed player to connected socket clients
	this.broadcast.emit("remove player", {id: this.id});
};

//function(size, orgX, orgY, orgDir, color, ai, number, team, updated)
//0 - blank, 1 - sweets, 2 - dead, 4-9 - players

// New player has joined
function onNewPlayer(data) {
	// Create a new player
    var newPlayer = new Snake(data.size, data.x, data.y, data.orgDir,
        data.color, data.ai, data.number, data.team);
    newPlayer.id = this.id;

	// Broadcast new player to connected socket clients
	this.broadcast.emit("new player", {id: newPlayer.id, size: newPlayer.getSize(), x: newPlayer.getX(),
        y: newPlayer.getY(), orgDir: newPlayer.getDir(), color: newPlayer.getColor(),
        ai: newPlayer.getAi(), number: newPlayer.getNumber(), team: newPlayer.getTeam()});

	// Send existing players to the new player
	var i, existingPlayer;

	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("new player", {id: existingPlayer.id, size: existingPlayer.getSize(), x: existingPlayer.getX(),
            y: existingPlayer.getY(), orgDir: existingPlayer.getDir(), color: existingPlayer.getColor(),
            ai: existingPlayer.getAi(), number: existingPlayer.getNumber(), team: existingPlayer.getTeam()});
	};

	// Add new player to the players array
	players.push(newPlayer);

    if(players.length == 2 * pvpNo)
        gameStart();
};

// Player has moved
function onMovePlayer(data) {
	// Find player in array
	var movePlayer = playerById(this.id);

	// Player not found
	if (!movePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	// Update player position
    movePlayer.setArray(data.snakeA);
    movePlayer.setStep(data.step);

	// Broadcast updated position to connected socket clients
	this.broadcast.emit("move player", {id: movePlayer.id, step: movePlayer.getStep(), snakeA: movePlayer.getArray()});
};

function onRequestData(data){

    // Change to session Group later

    that = this;

    requestData(data.sessionUser, data.sessionRoom, function(room, value){

        if(temp) {
            that.emit("init player", {size: value['size'], orgX: value['orgX'], orgY: value['orgY'],
                orgDir: value['orgDir'], color: value['color'], ai: "false", number: value['number'],
                team: value['team'], cW: room['width'], cH: room['height'], dim: 20, pvpNo: pvpNo,
                id: that.id});

            temp = false;
        }else{
            team = players.length % 2;
            that.emit("init player", {size: 5, orgX: 4, orgY: 14, orgDir: 0, color: "orange",
                ai: "false", number: 5, team: team, cW: 500, cH: 320, dim: 20, pvpNo: pvpNo, id: that.id});
            temp = true;
        }
    });
}

// Add to the DB the last message from the user and pull the messages for the last 6 minutes with an array
// (nick, message)
function onReceiveMessage(data){

        addMessageDB(data.nick, data.message, data.sessionRoom, function(messages){
            socket.sockets.in('group').emit("receive message", {messages: messages});
        });
}

function gameStart(){

    socket.sockets.in('group').emit("start");
    step = 1;
    updateStep();
}

/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	};

	return false;
};

//uStep checks if all the values were updated
function updateStep(){

    uStep = true;

    for(s in players){
        if(players[s].getStep() != step)
            uStep = uStep && false;
        else
            uStep = uStep && true;
    }

    if(uStep){
        socket.sockets.in('group').emit("update");
        step++;
    }
    loop = setTimeout(updateStep, 1000/2);
}

/**************************************************
** RUN THE GAME
**************************************************/
init();

//Retrieve user details
function requestData(user, roomName, callback){

    mysql.query('SELECT room FROM online WHERE nick=?', [user], function(err, results){

        if(!err){

            row = results[0];

            if(row['room'] == roomName){
                if(row['room'] != null){
                    mysql.query('SELECT * FROM rooms WHERE name=?',[row['room']], function(err, results){
                        if(!err){

                            pvpNo = results[0]['pvpNo'];
                            room = results[0];

                            mysql.query('SELECT * FROM ' + row['room'].toString() +
                                ' WHERE nick=?',[user], function(err, results){
                                if(!err){
                                    //Room information, User data in the room
                                    callback(room, results[0]);
                                }else{
                                    throw err;
                                }
                            });
                        }else{
                            throw err;
                        }
                    });
                }
            }else{
                throw err;
            }
        }else {
            throw err;
        }
    });
}

//Posts the message to the database
function addMessageDB(user, message, roomName, callback){


    mysql.query('INSERT INTO chat_' + roomName + '(nick, p_time, message)  VALUES( \''
        + user + '\', NOW(), ?)', message, function(err, results){

        if(!err){

            mysql.query('SELECT nick, message FROM chat_' + roomName + ' WHERE NOW() - p_time < 360 ORDER BY p_time', function(err, results){
                if(!err){
                    callback(results);
                }else{
                    throw err;
                }
            });
        }else{
            throw err;
        }
    });


}

