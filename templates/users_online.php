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

// We don't want web bots accessing this page:
if(is_bot()) die();

// Selecting the 15 player
$counter = 0;
$result = mysql_query("	SELECT nick,status
						FROM online
						ORDER BY status DESC
						LIMIT 15");
while($row=mysql_fetch_assoc($result))
{
	echo '
	<div class="geoRow">
	    <a href="../profile/'.$row['nick'].'" class="user_link">
            <div class="avatar"><img src="'.mysql_fetch_row(mysql_query("SELECT avatar FROM users
             WHERE nick='".$row['nick']."'"))[0].'" width="11" height="11" /></div>
            <div class="user">'.$row['nick'].'</div>
		</a>
		<div class="status"><img id="status_icon'.$counter.'" src="" width="8" height="8" /></div>
		<script type="text/javascript">statusIcon('.$row['status'].',
		 function(image){ document.getElementById("status_icon'.$counter.'").src = image; });</script>
	</div>
	';
    $counter++;
}

?>

<!--<script type="text/javascript">statusIcon('.$row['status'].', function(image){ return image;});</script>-->