<?php

define('INCLUDE_CHECK',true);
require_once "login.php";
require_once "functions.php";

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

            for($i = 0; $i < $p_no_rows; $i++){

                $room = mysql_fetch_row($pvpRooms);

                $pvpRoom = mysql_query('SELECT * FROM '.$room[0]) or die(mysql_error());

                if($pvpRoom){

                    $r_rows = mysql_fetch_array($pvpRoom, MYSQL_BOTH);

                    foreach($r_rows as $r_row){

                        if(abs($r_row['size'] - $size) < 3){
                            echo $room[0];
                            break;
                        }
                    }
                }else{
                    echo 'ERROR';
                }
            }
        }else{
            echo 'ERROR';
        }
    }else{
        echo 'ERROR';
    }
}
?>