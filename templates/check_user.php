<?php

define('INCLUDE_CHECK',true);
require_once "login.php";
require_once "functions.php";

if(isSet($_POST['username'])){
    $username = $_POST['username'];
    $sql_check = mysql_query("select id from users where nick='".$username."'") or die(mysql_error());

    if(mysql_num_rows($sql_check)){
        echo '<span class="err">The nickname <STRONG>'.$username.'</STRONG> is already in use.</span>';
    }
    else{
        echo 'OK';
    }
}

if(isSet($_POST['password'])){
    $password = $_POST['password'];

    if(!preg_match('/[A-Z0-9]/',$password)){
        echo '<span class="err">Password must contain at least one number and uppercase!</span>';
    }else{
        if(ctype_digit($_POST['password'])){
            echo '<span class="err">Password must contain letters!</span>';
        }else{
            echo 'OK';
        }
    }

}

if(isSet($_POST['email'])){
    $email = $_POST['email'];
    $sql_check = mysql_query("select id from users where email='".$email."'") or die(mysql_error());

    if(checkEmail($email)){
        if(mysql_num_rows($sql_check)){
            echo '<span class="err">The email <STRONG>'.$email.'</STRONG> is already in use.</span>';
        }
        else{
            echo 'OK';
        }
    }else{
        echo '<span class="err">Your email is not valid!</span>';
    }
}

?>