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
                var n = noty({dismissQueue: true, force: true, layout: layout, theme: 'defaultTheme', text: 'Sending request to ' + user, type: 'warning'});
                addNotyDB(user, 'request', '', nick, function(msg){
                    n.close();
                    if(msg != 'ERROR'){
                        var y = noty({dismissQueue: true, force: true, layout: layout, theme: 'defaultTheme', text: user + ' was notified', type: 'success'});
                        setTimeout(function(){y.close()}, 2000);
                    }else{
                        var c = noty({dismissQueue: true, force: true, layout: layout, theme: 'defaultTheme', text: user + ' could not be notified', type: 'error'});
                        setTimeout(function(){c.close()}, 2000);
                    }
                });
            }
            },
            {addClass: 'btn btn-danger', text: 'No', onClick: function($noty) {
                $noty.close();
                var c = noty({dismissQueue: true, force: true, layout: layout, theme: 'defaultTheme', text: 'You cancelled your request', type: 'error'});
                setTimeout(function(){c.close()}, 2000);
            }
            }
        ]
    });
    console.log('html: '+n.options.id);
}

function promptNotifications(user, callback){

    nick = user;
    callback();
}


function requestNotification(){

    console.log(nick);
    //setTimeout(requestNotification, 5000);
}

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


function removeNotyDB(text){

}