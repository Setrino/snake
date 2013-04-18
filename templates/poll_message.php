<?php

define('INCLUDE_CHECK',true);
require_once "login.php";
require_once "functions.php";

// Starting the session
session_name('tzLogin');

// Making the cookie live for 2 weeks
session_set_cookie_params(2*7*24*60*60);

session_start();

/* make sure the person is logged in. */
if(!isset($_SESSION['id'])){
    exit;
}


$cur_time = NOW();

/* maintains this user's state as active. */
mysql_query("UPDATE online SET last_on = '" . $cur_time . "'
                WHERE nick = " . $_SESSION['nick']) or die(mysql_error());

/* grab any messages posted since the last time we checked.
Notice we say >= and <. This is to guarantee that we don't miss any
messages that are posted at the same instant this query is
executed.*/
$query = "SELECT message,nick
          FROM chat_p516ef3ca0f8cf
          WHERE p_time >= '" . $_SESSION['prev_time'] . "'
            AND p_time < '" . $cur_time . "'
          ORDER BY p_time";
$res = mysql_query($query) or die(mysql_error());
?>