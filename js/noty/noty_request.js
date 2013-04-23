var layout = 'bottomLeft';
nick = '';

// Request a PvP
function requestPvP(layout, text, user) {
    var n = noty({
        text: text,
        type: 'information',
        dismissQueue: true,
        layout: layout,
        theme: 'defaultTheme',
        buttons: [
            {addClass: 'btn btn-primary', text: 'Yes', onClick: function($noty) {
                $noty.close();

                var wait = noty({dismissQueue: true, force: true, layout: layout, theme: 'defaultTheme',
                    text: 'Sending request to ' + user, type: 'warning'});
                var b = '';
                roomPresence(function(room){
                    addNotyDB(user, 'request', room, nick, function(msg){
                        setTimeout(function(){wait.close()}, 1000);
                        if(msg != 'ERROR'){
                            var y = noty({dismissQueue: true, force: true, layout: layout, theme: 'defaultTheme',
                                text: user + ' was notified', type: 'success'});

                            setTimeout(function(){y.close()}, 2000);
                        }else{
                            setTimeout(function(){wait.close()}, 1000);
                            var c = noty({dismissQueue: true, force: true, layout: layout, theme: 'defaultTheme',
                                text: user + ' could not be notified', type: 'error'});
                            setTimeout(function(){c.close()}, 2000);
                        }
                    });
                });
            }
            },
            {addClass: 'btn btn-danger', text: 'No', onClick: function($noty) {
                $noty.close();
                var c = noty({dismissQueue: true, force: true, layout: layout, theme: 'defaultTheme',
                    text: 'You cancelled your request', type: 'error'});
                setTimeout(function(){c.close()}, 2000);
            }
            }
        ]
    });
    console.log('html: '+n.options.id);
}

function receiveRequest(from, text, type){
    var n = noty({
        text: from + ' would like to play against you',
        type: 'information',
        dismissQueue: true,
        layout: layout,
        theme: 'defaultTheme',
        buttons: [
            {addClass: 'btn btn-primary', text: 'Accept', onClick: function($noty) {
                $noty.close();
                var wait = noty({dismissQueue: true, force: true, layout: layout, theme: 'defaultTheme',
                    text: 'Sending approval to ' + from, type: 'warning'});
                if(text != ''){
                    removeNotyDB(type, from, function(){});
                    addNotyDB(from, 'accept', text, nick, function(msg){
                        setTimeout(function(){wait.close()}, 1000);
                        if(msg != 'ERROR'){
                            joinRoom(from, text, type);
                            var y = noty({dismissQueue: true, force: true, layout: layout, theme: 'defaultTheme',
                                text: from + ' received approval.', type: 'success'});
                            setTimeout(function(){y.close()}, 2000);
                            }
                        });
                }else{
                    removeNotyDB(type, from, function(){});
                    addNotyDB(from, 'accept', '', nick, function(msg){
                        setTimeout(function(){wait.close()}, 1000);
                        if(msg != 'ERROR'){
                            var y = noty({dismissQueue: true, force: true, layout: layout, theme: 'defaultTheme',
                                text: from + ' received approval. Wait for room', type: 'success'});
                            setTimeout(function(){y.close()}, 2000);
                            }
                        });
                }
            }
            },
            {addClass: 'btn btn-danger', text: 'Decline', onClick: function($noty) {
                $noty.close();
                removeNotyDB(type, from, function(){});
                addNotyDB(from, 'decline', '', nick, function(msg){
                    if(msg != 'ERROR'){
                        var c = noty({dismissQueue: true, force: true, layout: layout, theme: 'defaultTheme',
                            text: 'You declined the request', type: 'error'});
                        setTimeout(function(){c.close()}, 2000);
                    }
                });
            }
            }
        ]
    });
}

function acceptRequest(from, text, type){

    var y = noty({dismissQueue: true, force: true, layout: layout, theme: 'defaultTheme',
        text: from + ' has accepted your request', type: 'success'});
    setTimeout(function(){y.close()}, 2000);

    if(text != ''){
        removeNotyDB(type, from, function(){
            //personalRoom(text);
        });
    }else{
        requestSinglePvP(function(text){ sendRoom(from, text);
            removeNotyDB(from, type, function(){
            joinRoom (from, text, type);});
        });
    }
}

function declineRequest(from, type){

    removeNotyDB(type, from, function(){
        var c = noty({dismissQueue: true, force: true, layout: layout, closeWith: ['click', 'hover'],
            theme: 'defaultTheme', text: from + ' declined your request', type: 'error'});
    });
}

function roomAccept(from, text, type){
    joinRoom(from, text, type);
}

function sendRoom(from, text){

    var wait = noty({dismissQueue: true, force: true, layout: layout, theme: 'defaultTheme',
        text: 'Sending room name to ' + from, type: 'warning'});

    addNotyDB(from, 'room', text, nick, function(msg){
        setTimeout(function(){wait.close()}, 1000);
        if(msg != 'ERROR'){
            var y = noty({dismissQueue: true, force: true, layout: layout, theme: 'defaultTheme',
                text: from + ' received the room ID', type: 'success'});

            setTimeout(function(){y.close()}, 2000);
        }
    });
}

// type of request sent (accept, decline, request, room)
function joinRoom(from, text, type){

    updateUserRoom(text, function(){
        var join = noty({
            text: 'Join the room ' + text + ' with ' + from,
            type: 'information',
            dismissQueue: true,
            layout: layout,
            theme: 'defaultTheme',
            buttons: [
                {addClass: 'btn btn-success', text: 'Join', onClick: function($noty) {
                    $noty.close();
                    removeNotyDB(type, from, function(){window.location.href = '../pvp/' + text});
                }
                }
            ]});
    });
}

function personalRoom(text){

    if(text != ''){
        displayRoomNoty(text);
    }else{
        roomPresence(function(room){
            if(room != '' || room != null || room != undefined){
                displayRoomNoty(room);
            }
        });
    }
}

function displayRoomNoty(text){

    noty({
        text: 'Your current room is ' + text,
        type: 'information',
        dismissQueue: true,
        layout: layout,
        theme: 'defaultTheme',
        buttons: [
            {addClass: 'btn btn-success', text: 'Enter', onClick: function($noty) {
                $noty.close();
                window.location.href = '../pvp/' + text;
            }
            },
            {addClass: 'btn btn-warning', text: 'Hide', onClick: function($noty) {
                $noty.close();
                }
            }
        ]});
}

function promptNotifications(user, callback){

    nick = user;
    personalRoom('');
    callback();
}

function requestNotification(){

    $.ajax({
        type: "POST",
        url: "../templates/pvp_requests.php",
        data: {"nick" : nick, "notifications": true},
        success: function(msg){

            if(msg != 'ERROR'){

                var array = eval ("(" + msg + ")");

                for(i in array){

                    switch(array[i].type){

                        case 'request':
                            receiveRequest(array[i].from_who, array[i].text, array[i].type);
                            break;
                        case 'accept':
                            acceptRequest(array[i].from_who, array[i].text, array[i].type);
                            break;
                        case 'decline':
                            declineRequest(array[i].from_who, array[i].type);
                            break;
                        case 'room':
                            roomAccept(array[i].from_who, array[i].text, array[i].type);
                            break;
                    }
                }

            }else{

            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert(textStatus+" - "+errorThrown);
        }
    });
    //setTimeout(requestNotification, 5000);
}

/*
 *  Add a notifcation to the database
 *  to - nick to which the notification is addressed
 *  type - type of notification (request, accept, decline, room)
 *  text - text is room ID
 *  from - from_who the notification was sent
 */
function addNotyDB(to, type, text, from, callback){

    $.ajax({
        type: "POST",
        url: "../templates/pvp_requests.php",
        data: {"to" : to, "r_type" : type, "text" : text, "from" : from},
        success: function(msg){

            callback(msg);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert(textStatus+" - "+errorThrown);
        }
    });
}

// Remove the notification from the database
function removeNotyDB(type, from, callback){
    $.ajax({
        type: "POST",
        url: "../templates/pvp_requests.php",
        data: {"type" : type, "nick" : nick, "from" : from},
        success: function(msg){

            if(msg != 'ERROR'){
                callback();
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert(textStatus+" - "+errorThrown);
        }
    });
}

// Check the online array for an active room with this player
function roomPresence(callback){

    $.ajax({
        type: "POST",
        url: "../templates/pvp_requests.php",
        data: {"nick" : nick, "room" : true},
        success: function(msg){

            if(msg != 'ERROR'){
                callback(msg);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert(textStatus+" - "+errorThrown);
        }
    });
}

// Create a 1v1 game for the local user (nick)
function requestSinglePvP(){

    $.ajax({
        type: "POST",
        url: "../templates/pvp_requests.php",
        data: {"type": 1, "player" : nick},
        success: function(msg){

            callback(msg);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert(textStatus+" - "+errorThrown);
        }
    });
}

function updateUserRoom(text, callback){

    $.ajax({
        type: "POST",
        url: "../templates/pvp_requests.php",
        data: {"room": text, "nick" : nick, "join" : true},
        success: function(msg){

            if(msg != 'ERROR'){
                callback();
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert(textStatus+" - "+errorThrown);
        }
    });
}