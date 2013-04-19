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
    room_step,  // Current step of person in the room
    gThis,
    temp = true;

/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	// Create an empty array to store players
	players = [];
    room_step = [];
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

    for(t in players){
        room = players[t];
        for(s in room){
            if(room[s].id == this.id){
                // Remove player from players array
                room.splice(room.indexOf(room[s], 1));
                // Broadcast removed player to connected socket clients
                socket.sockets.in(room).emit("remove player", {id: this.id});
            }
        }
    }
};

//function(size, orgX, orgY, orgDir, color, ai, number, team, updated)
//0 - blank, 1 - sweets, 2 - dead, 4-9 - players

// New player has joined
function onNewPlayer(data) {
	// Create a new player
    var newPlayer = new Snake(data.nick, data.size, data.x, data.y, data.orgDir,
        data.color, data.ai, data.number, data.team);
    newPlayer.id = this.id;

    var room = data.room;
    var roomPlayers = getRoom(room);

	// Broadcast new player to connected socket clients
    socket.sockets.in(room).emit("new player", {id: newPlayer.id, nick: newPlayer.getNick(), size: newPlayer.getSize(),
        x: newPlayer.getX(), y: newPlayer.getY(), orgDir: newPlayer.getDir(), color: newPlayer.getColor(),
            ai: newPlayer.getAi(), number: newPlayer.getNumber(), team: newPlayer.getTeam()});

	// Send existing players to the new player
	var i, existingPlayer;

	for (i = 0; i < roomPlayers.length; i++) {
		existingPlayer = roomPlayers[i];
		this.emit("new player", {id: existingPlayer.id, nick: existingPlayer.getNick(), size: existingPlayer.getSize(),
            x: existingPlayer.getX(), y: existingPlayer.getY(), orgDir: existingPlayer.getDir(),
                color: existingPlayer.getColor(), ai: existingPlayer.getAi(), number: existingPlayer.getNumber(),
                    team: existingPlayer.getTeam()});
	};

	// Add new player to the players array
    roomPlayers.push(newPlayer);

    if(roomPlayers.length == 2 * pvpNo)
        gameStart(room);
};

// Player has moved
function onMovePlayer(data) {
	// Find player in array
	var movePlayer = playerById(this.id);
    var room = data.room;

	// Player not found
	if (!movePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

        for(s in players[room]){
            if(players[room][s].id == this.id){
                players[room][s].setArray(data.snakeA);
                players[room][s].setStep(data.step);
            }
    }

	// Broadcast updated position to connected socket clients
    socket.sockets.in(room).emit("move player", {id: movePlayer.id, step: movePlayer.getStep(),
        snakeA: movePlayer.getArray()});
};

function onRequestData(data){

    // Change to session Group later

    that = this;
    that.join(data.sessionRoom);

    requestData(data.sessionUser, data.sessionRoom, function(room, value){

        retrieveFromDB(data.sessionRoom, function(messages){

            that.emit("init player", {nick: data.sessionUser, size: value['size'], orgX: value['orgX'],
                orgY: value['orgY'], orgDir: value['orgDir'], color: value['color'], ai: "false",
                    number: value['number'], team: value['team'], cW: room['width'], cH: room['height'], dim: 20,
                        pvpNo: pvpNo, id: that.id, messages: messages});
        });
    });
}

// Add to the DB the last message from the user and pull the messages for the last 6 minutes with an array
// (nick, message)
function onReceiveMessage(data){

        addMessageDB(data.nick, data.message, data.sessionRoom, function(messages){
            socket.sockets.in(data.sessionRoom).emit("receive message", {messages: messages});
        });
}

function gameStart(room){

    socket.sockets.in(room).emit("start");
    room_step[room] = 1;
    updateStep();
}

/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {

    for(t in players){
        for(s in players[t]){
            if(players[t][s].id == id)
                return players[t][s];
        }
    }
	return false;
};

//uStep checks if all the values were updated
function updateStep(){

    for(t in players){
        uStep = true;
        room = t;
        roomArr = players[t];
        for(s in roomArr){
            if(roomArr[s].getStep() != getRoomStep(room))
                uStep = uStep && false;
            else
                uStep = uStep && true;
        }
        if(uStep){
            socket.sockets.in(room).emit("update");
            util.log('Room ' + room + ' step ' + getRoomStep(room));
            roomStepUp(room);
        }
    }
    loop = setTimeout(updateStep, 1000/2);
}

function getRoomStep(room){

    return room_step[room];
}

function roomStepUp(room){
    room_step[room]++;
}

function getRoom(room){

    if(players[room] == null){
        players[room] = [];
        return players[room];
    }else{
        return players[room];
    }
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
            retrieveFromDB(roomName, callback);

        }else{
            throw err;
        }
    });
}

//Retrieve the latest messages from the DB
function retrieveFromDB(roomName, callback){

    mysql.query('SELECT nick, message FROM chat_' + roomName + ' WHERE NOW() - p_time < 600 ORDER BY p_time', function(err, results){
        if(!err){
            callback(results);
        }else{
            throw err;
        }
    });
}

