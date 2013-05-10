<?php

define('INCLUDE_CHECK',true);

require_once 'login.php';
require 'functions.php';
// Those two files can be included only if INCLUDE_CHECK is defined


session_name('tzLogin');
// Starting the session

session_set_cookie_params(2*7*24*60*60);
// Making the cookie live for 2 weeks

session_start();

if($_SESSION['id'] && !isset($_COOKIE['tzRemember']) && !$_SESSION['rememberMe'])
{
    // If you are logged in, but you don't have the tzRemember cookie (browser restart)
    // and you have not checked the rememberMe checkbox:

    $_SESSION = array();
    session_destroy();

    // Destroy the session
}

if($_POST['submit']=='Register')
{
    // If the Register form has been submitted

    $err = array();

    $_POST['email'] = mysql_real_escape_string($_POST['email']);
    $_POST['username'] = mysql_real_escape_string($_POST['username']);

    if(strlen($_POST['username'])<3 || strlen($_POST['username'])>32)
    {
        $err[]='Your username must be between 3 and 32 characters!';
        $_SESSION['email'] = $_POST['email'];
    }

    if(preg_match('/[^a-z0-9\-\_\.]+/i',$_POST['username']))
    {
        $err[]='Your username contains invalid characters!';
        $_SESSION['email'] = $_POST['email'];
    }

    if(!checkEmail($_POST['email']))
    {
        $err[]='Your email is not valid!';
        $_SESSION['nick'] = $_POST['username'];
    }

    if(!preg_match('/[A-Z0-9]/',$_POST['password'])){
        $err[]='Password must contain at least one number and uppercase!';
        $_SESSION['nick'] = $_POST['username'];
        $_SESSION['email'] = $_POST['email'];
    }

    if(ctype_digit($_POST['password'])){
        $err[]='Password must contain letters!';
        $_SESSION['nick'] = $_POST['username'];
        $_SESSION['email'] = $_POST['email'];
    }

    if(!count($err))
    {
        // If there are no errors

        //$pass = substr(md5($_SERVER['REMOTE_ADDR'].microtime().rand(1,100000)),0,6);
        // Generate a random password

        $pass = mysql_real_escape_string($_POST['password']);
        // Escape the input data

        mysql_query("INSERT INTO users(nick, email, regIP, dt)
                        VALUES(
                            '".$_POST['username']."',
							'".$_POST['email']."',
							'".$_SERVER['REMOTE_ADDR']."',
							NOW())");

        mysql_query("	INSERT INTO passwords(nick,pass)
						VALUES(
							'".$_POST['username']."',
							'".$pass."'
						)");

        mysql_query("	INSERT INTO online(nick,last_on)
						VALUES(
							'".$_POST['username']."',
							NOW()
						)");

        if(mysql_affected_rows($link) >= 0)
        {
            send_mail(	'info@fkdn-lab.com',
                $_POST['email'],
                'Snake MMO Registration',
                'Your password is: '.$pass);

            $_SESSION['msg']['reg-success']='We sent you an email ' .$_POST['email'].
                ' with your password!';
        }
        else $err[]='This username is already taken!';
    }

    if(count($err))
    {
        $_SESSION['msg']['reg-err'] = implode('<br />',$err);
    }

    header("Location: register.php");
    exit;
}

$script = '';

if($_SESSION['msg'])
{
    // The script below shows the sliding panel on page load

    $script = '
	<script type="text/javascript">

		$(function(){

			$("div#panel").show();
			$("#toggle a").toggle();
		});

	</script>';

}
?>

<head xmlns="http://www.w3.org/1999/html">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Snake MMO Registration form</title>

    <!--<link rel="stylesheet" type="text/css" href="../css/game.css" media="screen" />
    <link rel="stylesheet" type="text/css" href="../css/slide.css" media="screen" />-->
    <link rel="stylesheet" type="text.css" href="../css/register.css" media="screen">

    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>
    <script type="text/javascript" src="../js/reg_check.js"></script>

    <!-- PNG FIX for IE6 -->
    <!-- http://24ways.org/2007/supersleight-transparent-png-in-ie6 -->
    <!--[if lte IE 6]>
    <script type="text/javascript" src="../js/pngfix/supersleight-min.js"></script>
    <![endif]-->

    <script src="../js/slide.js" type="text/javascript"></script>

    <?php echo $script; ?>
</head>

<body>
<section class="container">
    <div class="login">
        <!-- Register Form -->
        <form action="" id="reg_form" method="post">
            <h1>Register at Snake MMO</h1>

            <?php

            if($_SESSION['msg']['reg-err'])
            {
                echo '<div class="err">'.$_SESSION['msg']['reg-err'].'</div>';
                unset($_SESSION['msg']['reg-err']);
            }

            if($_SESSION['msg']['reg-success'])
            {
                echo '<div class="success">'.$_SESSION['msg']['reg-success'].'</div>';
                unset($_SESSION['msg']['reg-success']);
            }
            ?>

                <p>
                    <div>
                        <input type="text" name="username" id="username" placeholder="Username" value="<?php if($_SESSION['nick'])
                        {echo $_SESSION['nick']; unset($_SESSION['nick']);} ?>" size="23" />
            <div id="status" class="status">
                
            </div>
                        </div>

                </p>

                <p>
                        <div>
                        <input type="password" name="password" id="password" value="" placeholder="Password" size="23" />
                        </div>
                        <div id="status_p" class="status"></div>
                </p>

                <p>
                    <div>
                    <input class="field" type="text" name="email" id="email" value="<?php if($_SESSION['email'])
                    {echo $_SESSION['email']; unset($_SESSION['email']);} ?>" placeholder="Email" size="23" />
                    <div id="status_e" class="status"></div>
                </p>

                <p class="submit"><input type="submit" name="submit" value="Register"></p>
                <div id="status_r" class="status"></div>
        </form>
            <p><a href="index.php" class="return">Return to main page</a></p>
    </div>
</body>
            