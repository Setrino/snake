<?php

define('INCLUDE_CHECK',true);
require_once "../templates/login.php";
require_once "../templates/functions.php";

// Starting the session
session_name('tzLogin');

// Making the cookie live for 2 weeks
session_set_cookie_params(2*7*24*60*60);

session_start();

if(get_magic_quotes_gpc()){
    $_POST = array_map('stripslash', $_POST);
}
function stripslash($value){
    if(is_array($value))
        return array_map('stripslash', $value);
    else
        return stripslashes($value);
}

$getNick = '';
$query = '';
$err = array();
$user = '';

if(!isset($_GET['nick'])){
    header("Location: ../404");
    exit;
}

$getNickURL = $_GET['nick'];
$query = mysql_query("SELECT * from users WHERE nick='$getNickURL'") or die(mysql_error());
$getEmail = mysql_fetch_array($query)['email'];

if($_SESSION['id']){

    $getNick = $_SESSION['nick'];
    //$query = mysql_query("SELECT * from $getTable WHERE nick='$getNick'") or die(mysql_error());

    if($getNickURL != $getNick)
        $user = 'You are the user';
    else
        $user = 'You are just visiting this page';
}

/*else{
    $query = getQuery(explode("/",$_SERVER['REQUEST_URI'])[3]);
}*/

/*if($num_rows == 0){
    header("Location: 404");
}*/

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head></head>
    <body>
        <div><?php echo $getEmail ?></div>
        <div><?php echo $user ?></div>
    </body>
</html>