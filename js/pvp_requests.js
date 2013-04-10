// AJAX call to retrieve current number of games for each pvp type (1v1, 2v2, 3v3, 4v4)
function currentPvP(){

    $('.info').html('<img src="../images/preloader.gif" align="absmiddle">&nbsp;Checking available games...');

    $.ajax({
        type: "POST",
        url: "../templates/pvp_requests.php",
        data: "join="+true,
        success: function(msg){

            if(msg == 'ERROR')
            {
                $('.info').html('<span>Failed to load PvP Numbers</span>');
            }
            else
            {
                $('.info').html(msg);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert(textStatus+" - "+errorThrown);
        }
    });
}

/**
    type - 1v1, 2v2, 3v3, 4v4
    lP - localPlayer nick
 */
function joinPvP(lP, type){

    $('.info').html('<img src="../images/preloader.gif" align="absmiddle">&nbsp;Joining a ' +
        type + 'v' + type + ' game...');

    $.ajax({
        type: "POST",
        url: "../templates/pvp_requests.php",
        data: {"type": type, "lP" : lP},
        success: function(msg){

            if(msg == 'ERROR')
            {
                $('.info').html('<span>Failed to join a PvP Game</span>');
            }
            else
            {
                $('.info').html(msg);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert(textStatus+" - "+errorThrown);
        }
    });
}