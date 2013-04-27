<?php

session_name('tzLogin');
session_set_cookie_params(2*7*24*60*60);
session_start();

define('INCLUDE_CHECK',true);

require_once "login.php";
require_once "functions.php";

// We don't want web bots scewing our stats:
if(is_bot()) die();

$stringIp = $_SERVER['REMOTE_ADDR'];

if($_SESSION['id']){
// Checking wheter the visitor is already marked as being online:
    $status = mysql_query("SELECT status FROM online WHERE id='".$_SESSION['id']."'");

    $status_row = mysql_fetch_row($status);

    if($status_row[0] == 0){

        mysql_query("UPDATE online SET status=1 WHERE id='".$_SESSION['id']."'");
        mysql_query("UPDATE online SET last_on=NOW() WHERE id='".$_SESSION['id']."'");

        }
}

// Removing entries not updated in the last 10 minutes:
//mysql_query("UPDATE online SET status=0 WHERE last_on < SUBTIME(NOW(), '0 0:10:0')");
//mysql_query("DELETE FROM tz_who_is_online WHERE dt<SUBTIME(NOW(),'0 0:10:0')");

// Counting all the online visitors:
list($totalOnline) = mysql_fetch_array(mysql_query("SELECT COUNT(*) FROM online WHERE status=1 || status=2"));

// Outputting the number as plain text:
echo $totalOnline;
?>