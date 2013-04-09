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
?>