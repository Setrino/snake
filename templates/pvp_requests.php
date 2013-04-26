<?php

define('INCLUDE_CHECK',true);
require_once "login.php";
require_once "functions.php";

// Checks number of joinable rooms for each type
if(isset($_POST['join'])){

    $sql_check = mysql_query("SELECT pvpNo, count(*) from rooms GROUP BY pvpNo") or die(mysql_error());

    if($sql_check){
        $rows = mysql_num_rows($sql_check);
        $temp = '<table class="noGames"><tr>';
        $v1 = $v2 = $v3 = $v4 = '<td>0</td>';

        for($i = 0; $i < $rows; $i++){

            $row = mysql_fetch_row($sql_check);

            switch($row[0]){
                case 1:
                    $v1 = '<td>'.$row[1].'</td>';
                    break;
                case 2:
                    $v2 = '<td>'.$row[1].'</td>';
                    break;
                case 3:
                    $v3 = '<td>'.$row[1].'</td>';
                    break;
                case 4:
                    $v4 = '<td>'.$row[1].'</td>';
                    break;
            }
        }

        $temp .= $v1.$v2.$v3.$v4.'</tr></table>';
        echo $temp;

    }else{
        echo 'ERROR';
    }
}

/*
 * JOIN
 * type - 1v1, 2v2, 3v3, 4v4
 * lp - localPlayer nick
 * Get the user details from the users database (color, size)
 * Get all the current pvp games that the user can join which are in waiting state
 * Find the optimal game for you and join it
 */
if(isset($_POST['type']) && isset($_POST['lP'])){

    $type = $_POST['type'];
    $nick = $_POST['lP'];
    $color = '';
    $size = '';

    $user_data = mysql_query("SELECT color, size FROM users WHERE nick='".$nick."'") or die (mysql_error());

    if($user_data){

        $u_rows = mysql_fetch_array($user_data, MYSQL_ASSOC);
        $color = $u_rows['color'];
        $size = $u_rows['size'];


    $pvpRooms = mysql_query("SELECT name FROM rooms WHERE pvpNo='".$type."' && state=0") or die(mysql_error());

        if($pvpRooms){

            $p_no_rows = mysql_num_rows($pvpRooms);
                $selected = '';
            for($i = 0; $i < $p_no_rows; $i++){

                $room = mysql_fetch_row($pvpRooms);

                $pvpRoom = mysql_query("SELECT * FROM $room[0]") or die(mysql_error());

                if($pvpRoom){

                    $room_player_rows = mysql_num_rows($pvpRoom);

                    for($j = 0; $j < $room_player_rows; $j++){

                        $player = mysql_fetch_row($pvpRoom);

                            if(abs($player[7] - $size) < 3){
                                $selected = $room[0];
                                break;
                            }
                    }
                }else{
                    echo 'ERROR';
                }
            }
            echo $selected;
        }else{
            echo 'ERROR';
        }
    }else{
        echo 'ERROR';
    }
}

/*
 * HOST
 * type - 1v1, 2v2, 3v3, 4v4
 * lp - localPlayer nick
 * Get the user details from the users database (color, size)
 * Get all the current pvp games that the user can join which are in waiting state
 * Find the optimal game for you and join it
 */
if(isset($_POST['type']) && isset($_POST['player'])){

    $type = $_POST['type'];
    $nick = $_POST['player'];
    $color = '';
    $size = '';

    $user_data = mysql_query("SELECT color, size FROM users WHERE nick='".$nick."'") or die (mysql_error());
    $roomID = uniqid('p');

    if($user_data){

        $u_rows = mysql_fetch_array($user_data, MYSQL_ASSOC);
        $color = $u_rows['color'];
        $size = $u_rows['size'];

        $pvpRooms = mysql_query("INSERT INTO rooms(name, pvpNo, width, height, state) VALUES('".$roomID."',
         '".$type."', 500, 320, 0)") or die(mysql_error());

        if($pvpRooms){

        $pvp_room = mysql_query("CREATE TABLE $roomID(nick VARCHAR (32) NOT NULL, team INT(1) NOT NULL, number INT(1)
         NOT NULL, status INT(1) NOT NULL DEFAULT 0, color VARCHAR(10) NOT NULL, orgX INT(3) NOT NULL, orgY INT(3)
          NOT NULL, size INT(2) NOT NULL, orgDir INT(1) NOT NULL DEFAULT 0,
           UNIQUE KEY(nick)) engine myisam") or die (mysql_error());

            if($pvp_room){

                $add_User = mysql_query("INSERT INTO $roomID VALUES('$nick', 0, 4, 0, '$color', 4, 14, '$size', 0)")
                    or die(mysql_error());
                            mysql_query("UPDATE online SET room='$roomID', status=2 WHERE nick='$nick'") or die(mysql_error());

                $chat_room = mysql_query("CREATE TABLE chat_$roomID(id int UNSIGNED NOT NULL auto_increment, nick VARCHAR(32)
                  NOT NULL, p_time datetime NOT NULL, message VARCHAR(255) NOT NULL, PRIMARY KEY(id)) engine myisam") or die (mysql_error());

                if($chat_room){

                    echo $roomID;

                }else{
                    echo 'ERROR';
                }
            }else{
                echo 'ERROR';
            }
        }else{
            echo 'ERROR';
        }
    }else{
        echo 'ERROR';
    }
}

/*
 * JOIN the room
 * room - name of the room to join
 * nick - localPlayer nick
 * Get the all user details from the users database (color, size)
 * Add them all to the current room
 */
if(isset($_POST['room']) && isset($_POST['nick']) && isset($_POST['join'])){

    $roomID = $_POST['room'];
    $nick = $_POST['nick'];
    $color = '';
    $size = '';

        $user_data = mysql_query("SELECT color, size FROM users WHERE nick='".$nick."'") or die (mysql_error());

        if($user_data){

            $u_rows = mysql_fetch_array($user_data, MYSQL_ASSOC);
            $color = $u_rows['color'];
            $size = $u_rows['size'];

                    $add_User = mysql_query("REPLACE INTO $roomID VALUES('$nick', 1, 4, 0, '$color', 4, 4, '$size', 2)")
                        or die(mysql_error());
            if($add_User){
                    mysql_query("UPDATE online SET room='$roomID', status=2 WHERE nick='$nick'") or die(mysql_error());
            }else{
                echo 'ERROR';
            }
        }else{
            echo 'ERROR';
        }
}

/*
 * Add notification to the database for a specific user
 * to - nick which receives the notification
 * r_type - type of notification (request, accept, decline, room)
 * text - text includes the room name, otherwise is blank
 * from - from_who the message is coming from
 */
if(isset($_POST['to']) && isset($_POST['r_type']) && isset($_POST['text']) && isset($_POST['from'])){

    $nick = $_POST['to'];
    $type = $_POST['r_type'];
    $text = $_POST['text'];
    $from_who = $_POST['from'];
    $query = mysql_query("REPLACE INTO notifications(nick, text, type, from_who) VALUES('".$nick."',
     '".$text."', '".$type."', '".$from_who."') ") or die (mysql_error());

    if(!$query)
        echo 'ERROR';
}

// Remove the message from notifications
// nick = who's message
// type = type of message removed
// from = from_who came the message
if(isset($_POST['nick']) && isset($_POST['type']) && isset($_POST['from'])){

    $nick = $_POST['nick'];
    $type = $_POST['type'];
    $from_who = $_POST['from'];

    $query = mysql_query("DELETE FROM notifications WHERE nick='".$nick."' && type='".$type."'
     && from_who='".$from_who."'") or die (mysql_error());

    if(!$query)
        echo 'ERROR';


}

// Get all the notifications for the current user
if(isset($_POST['nick']) && isset($_POST['notifications'])){

    $nick = $_POST['nick'];
             mysql_query('SET CHARACTER SET utf8');
    $query = mysql_query("SELECT * FROM notifications WHERE nick='".$_POST['nick']."'") or die (mysql_error());

    if($query){

        $rows = array();
        while($row = mysql_fetch_assoc($query)) {
            $rows[] = $row;
        }
        echo json_encode($rows);

    }else{
        echo 'ERROR';
    }
}

// Check whether a user has an active room
if(isset($_POST['nick']) && isset($_POST['room'])){

    $nick = $_POST['nick'];

    $query = mysql_query("SELECT room FROM online WHERE nick='".$_POST['nick']."'") or die (mysql_error());

    if($query){

        echo mysql_fetch_array($query, MYSQL_ASSOC)['room'];

    }else{
        echo 'ERROR';
    }
}

?>