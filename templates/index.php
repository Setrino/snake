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


if(isset($_GET['logoff']))
{
	$_SESSION = array();
	session_destroy();
	
	header("Location: index.php");
	exit;
}

if($_POST['submit']=='Login')
{
	// Checking whether the Login form has been submitted
	
	$err = array();
	// Will hold our errors
	
	
	if(!$_POST['username'] || !$_POST['password'])
		$err[] = 'All the fields must be filled in!';
	
	if(!count($err))
	{
		$_POST['username'] = mysql_real_escape_string($_POST['username']);
		$_POST['password'] = mysql_real_escape_string($_POST['password']);
		$_POST['rememberMe'] = (int)$_POST['rememberMe'];
		
		// Escaping all input data

		$row = mysql_fetch_assoc(mysql_query("SELECT id,nick FROM passwords WHERE nick='{$_POST['username']}' AND pass='{$_POST['password']}'"));

		if($row['nick'])
		{
			// If everything is OK login
			
			$_SESSION['nick']=$row['nick'];
			$_SESSION['id'] = $row['id'];
			$_SESSION['rememberMe'] = $_POST['rememberMe'];
			
			// Store some data in the session
			
			setcookie('tzRemember',$_POST['rememberMe']);
		}
		else $err[]= mysql_error();
	}
	
	if($err)
	$_SESSION['msg']['login-err'] = implode('<br />',$err);
	// Save the error messages in the session

	header("Location: index.php");
	exit;
}
else if($_POST['submit']=='Register')
{
	// If the Register form has been submitted
	
	$err = array();

    $_POST['email'] = mysql_real_escape_string($_POST['email']);
    $_POST['username'] = mysql_real_escape_string($_POST['username']);
	
	if(strlen($_POST['username'])<4 || strlen($_POST['username'])>32)
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
							'".md5($pass)."'
						)");
		
		if(mysql_affected_rows($link)==1)
		{
			send_mail(	'info@fkdn-lab.com',
						$_POST['email'],
						'Snake MMO Registration',
						'Your password is: '.$pass);

			$_SESSION['msg']['reg-success']='We sent you an email with your new password!';
		}
		else $err[]='This username is already taken!';
	}

	if(count($err))
	{
		$_SESSION['msg']['reg-err'] = implode('<br />',$err);
	}	
	
	header("Location: index.php");
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


<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

    <title>Snake MMO</title>

    <link rel="stylesheet" type="text/css" href="../css/slide.css" media="screen" />
    <link rel="stylesheet" type="text/css" href="../css/game.css" media="screen"/>
    <script lang="javascript" src="../js/jquery-1.9.1.min.js"></script>
    
    <!-- PNG FIX for IE6 -->
    <!-- http://24ways.org/2007/supersleight-transparent-png-in-ie6 -->
    <!--[if lte IE 6]>
        <script type="text/javascript" src="../js/pngfix/supersleight-min.js"></script>
    <![endif]-->
    
    <script src="../js/slide.js" type="text/javascript"></script>
    
    <?php echo $script; ?>
</head>

<body>

<!-- Panel -->
<div id="toppanel">
	<div id="panel">
		<div class="content clearfix">

            <?php
			
			if(!$_SESSION['id']):
			
			?>
            
			<div class="left right">
				<!-- Login Form -->
				<form class="clearfix" action="" method="post">
					<h1>Member Login</h1>
                    <?php
						
						if($_SESSION['msg']['login-err'])
						{
							echo '<div class="err">'.$_SESSION['msg']['login-err'].'</div>';
							unset($_SESSION['msg']['login-err']);
						}
					?>
					
					<label class="grey" for="username">Username:</label>
					<input class="field" type="text" name="username" id="username" size="23" />
					<label class="grey" for="password">Password:</label>
					<input class="field" type="password" name="password" id="password" size="23" />
                    <label><input name="rememberMe" id="rememberMe" type="checkbox" checked="checked" value="1" /> &nbsp;Remember me</label>
        			<div class="clear"></div>

					    <input type="submit" name="submit" value="Login" class="bt_login" />
			</form>
                    <span class="forms">
                        <a href="register.php">Register</a>
                        &nbsp;&nbsp;&nbsp;
                        <a href="forgot.php">Forgotten password</a>
                    </span>
			</div>

            <div class="left">
                <h1>Welcome to Snake MMO</h1>
                <h2>Login if Member or Register</h2>
                <p class="grey">You are free to use this login and registration system in you sites!</p>
                <h2>A Big Thanks</h2>
                <p class="grey"></p>
            </div>

                <?php
			
			else:
			
			?>
            
            <div class="left">
            
            <h1>Members panel</h1>
            
            <p>You can put member-only data here</p>
            <a href="registered.php">View a special member page</a>
            <p>- or -</p>
            <a href="?logoff">Log off</a>
            
            </div>
            
            <div class="left right">
            </div>
            
            <?php
			endif;
			?>
		</div>
	</div> <!-- /login -->	

    <!-- The tab on top -->	
	<div class="tab">
		<ul class="login">
	    	<li class="left">&nbsp;</li>
	        <li>Hello <?php echo $_SESSION['nick'] ? $_SESSION['nick'] : 'Guest';?>!</li>
			<li class="sep">|</li>
			<li id="toggle">
				<a id="open" class="open" href="#"><?php echo $_SESSION['id']?'Open Panel':'Log In | Register';?></a>
				<a id="close" style="display: none;" class="close" href="#">Close Panel</a>			
			</li>
	    	<li class="right">&nbsp;</li>
		</ul> 
	</div> <!-- / top -->
	
</div> <!--panel -->

<div class="pageContent">
    <div id="main">
      <div class="container">
        <h1>Snake MMO</h1>
        <h2>Online Canvas game of Snake</h2>
        </div>
      <div class="container">
          <div>
              <a href="#" class="launchLink"><img src="../images/icon-settings.png"></a>
              <canvas id='c'></canvas>
              <script src="../js/game.js"></script>
          </div>

          <!-- The dark background -->
          <div class="bgCover">&nbsp;</div>
          <!-- overlay box -->
          <div class="overlayBox">
              <div class="overlayContent">
                  <!--the close button-->
                  <a href="#" class="closeLink"><img src="../images/icon-exit.png"></a>
                  <!--normal content-->
                  <div id="play" class="play">
                      <span><input type="button" value="" onclick="pvp()" id="pvp"></span>
                      &nbsp
                      <span><input type="button" value="" onclick="pvc()" id="pvc"></span>
                      <p class="info"></p>
                  </div>
                  <div id="gameData">
                      <h1 class="player"></h1>
                      <p class="score"></p>
                      <input type="submit" value="" class="restart">
                  </div>
              </div>
          </div>
      </div>
        
      <div class="container tutorial-info">
      Demo by Setrino&copy; 2013 </div>
    </div>
</div>

</body>
</html>
