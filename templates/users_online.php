<script type="text/javascript">
    function statusIcon(status, callback){

        switch(status){
            case(0):
                callback("../images/offline.png");
                break;
            case(1):
                callback("../images/online.png");
                break;
            case(2):
                callback("../images/away.png");
                break;
        }
    }
</script>

<?php

define('INCLUDE_CHECK',true);

require_once "login.php";
require "functions.php";

// Starting the session
session_name('tzLogin');

// Making the cookie live for 2 weeks
session_set_cookie_params(2*7*24*60*60);

session_start();

// We don't want web bots accessing this page:
if(is_bot()) die();

// Selecting the 15 player
$counter = 0;
$result = mysql_query("	SELECT nick,status
						FROM online
						ORDER BY status DESC
						LIMIT 15");
$msg = '';
while($row=mysql_fetch_assoc($result))
{
	$msg .=
	'<div class="geoRow">
	    <a href="../profile/'.$row['nick'].'" class="user_link">
            <div class="avatar"><img src="'.mysql_fetch_row(mysql_query("SELECT avatar FROM users
             WHERE nick='".$row['nick']."'"))[0].'" width="11" height="11" /></div>';

    if($_SESSION['id']){
                if($row['nick'] != $_SESSION['nick']){
         $msg .= '</a><div class="user" onclick="requestPvP(\'bottomLeft\',
                    \'Would you like to play against \' + $(this).html() + \'?\', $(this).html());">'
                        .$row['nick'].'</div>';
        }else{
                $msg .= '<div class="user">'.$row['nick'].'</div></a>';
        }
    }else{
        $msg .= '<div class="user">'.$row['nick'].'</div></a>';
    }
        $msg .= '<div class="status"><img id="status_icon'.$counter.'" src="" width="8" height="8"/></div>
            <script type="text/javascript">statusIcon('.$row['status'].',
                function(image){ document.getElementById("status_icon'.$counter.'").src = image; });
            </script>
        </div>';
    $counter++;
}
$counter = 0;
echo $msg;
?>

<!--<script type="text/javascript">statusIcon('.$row['status'].', function(image){ return image;});</script>-->