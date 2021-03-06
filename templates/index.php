<?php

define('INCLUDE_CHECK',true);

require_once 'login.php';
require 'functions.php';

// Starting the session
session_name('tzLogin');

// Making the cookie live for 2 weeks
session_set_cookie_params(2*7*24*60*60);

session_start();

if(isset($_SESSION['last_on']) && (time() - $_SESSION['last_on']) > 1800){
    killSession();
}
$_SESSION['last_on'] = time();

function killSession(){

    mysql_query("set names 'utf8'");
    $query =  mysql_query("SELECT room FROM online WHERE nick='".$_SESSION['nick']."'") or die(mysql_error());
    $array = mysql_fetch_array($query, MYSQL_ASSOC);
    $room = $array['room'];

    if($room != '' || $room != null){
    $query = mysql_query("SELECT rooms.id FROM rooms INNER JOIN online ON rooms.name='$room'")
        or die(mysql_error());
    $array = mysql_fetch_array($query, MYSQL_ASSOC);
    $id = $array['id'];

        if($id != '' || $id != null){

        mysql_query("DELETE FROM rooms WHERE name='$room'") or die(mysql_error());
        mysql_query("DROP TABLE $room") or die(mysql_error());
        mysql_query("DROP TABLE chat_$room") or die(mysql_error());
        }
    }

    mysql_query("DELETE FROM notifications WHERE nick='".$_SESSION['nick']."'
        || from_who='".$_SESSION['nick']."'") or die (mysql_error());
    mysql_query("UPDATE online SET status=0, room='', last_on=NOW() WHERE nick='".$_SESSION['nick']."'")
        or die (mysql_error());
    $_SESSION = array();
    session_destroy();

    header("Location: index.php");
    exit;
}

if($_SESSION['id'] && !isset($_COOKIE['tzRemember']) && !$_SESSION['rememberMe'])
{
	// If you are logged in, but you don't have the tzRemember cookie (browser restart)
	// and you have not checked the rememberMe checkbox:

	$_SESSION = array();
	session_destroy();

	// Destroy the session
}

if(isset($_GET['logoff'])){
    killSession();
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
        mysql_query("set names 'utf8'");
        $row_u = mysql_fetch_assoc(mysql_query("SELECT id, nick FROM users WHERE nick='{$_POST['username']}'"));

        if(!$row_u['nick'])
        {
            $err[]= 'Such username does not exist';
        }else{
            $row = mysql_fetch_assoc(mysql_query("SELECT nick FROM passwords WHERE nick='{$_POST['username']}'
             AND pass='{$_POST['password']}'"));

            if($row['nick'])
            {
                // If everything is OK login

                $_SESSION['nick']=$row['nick'];
                $_SESSION['id'] = $row_u['id'];
                $_SESSION['rememberMe'] = $_POST['rememberMe'];
                $_SESSION['last_on'] = time();

                // Store some data in the session

                setcookie('tzRemember',$_POST['rememberMe']);
            }else{
                $err[]= 'You have entered a wrong password';
            }
        }
	}

	if($err)
	$_SESSION['msg']['login-err'] = implode('<br />',$err);
	// Save the error messages in the session

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

    <link rel="stylesheet" type="text/css" href="../css/styles.css" />
    <link rel="stylesheet" type="text/css" href="../css/slide.css" media="screen" />
    <link rel="stylesheet" type="text/css" href="../css/game.css" media="screen"/>
    <link rel="stylesheet" type="text/css" href="../css/buttons.css" media="screen" />
    <link rel="stylesheet" type="text/css" href="../css/main_menu.css" media="screen" />
    <script type="text/javascript" src="../js/jquery-1.9.1.min.js"></script>
    
    <!-- PNG FIX for IE6 -->
    <!-- http://24ways.org/2007/supersleight-transparent-png-in-ie6 -->
    <!--[if lte IE 6]>
    <script type="text/javascript" src="../js/pngfix/supersleight-min.js"></script>
    <![endif]-->
    
    <script type="text/javascript" src="../js/slide.js"></script>
    <script type="text/javascript" src="../js/online_widget.js"></script>
    <script type="text/javascript" src="../js/pvp_requests.js"></script>
    <script type="text/javascript" src="../js/noty/jquery.noty.js"></script>
    <script type="text/javascript" src="../js/noty/layouts/bottomLeft.js"></script>
    <script type="text/javascript" src="../js/noty/themes/default.js"></script>
    <script type="text/javascript" src="../js/noty/noty_request.js"></script>
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
                            echo '<script>$(document).ready(function(){$(\'#forms\').addClass("up_err");});</script>';
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
                    <table id="forms">
                        <tr>
                            <td class="form_register"><a href="register.php">Register</a></td>
                            <td><a href="forgot.php">Forgotten password</a></td>
                        </tr>
                    </table>
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
                <a href=<?php echo '../profile/'.$_SESSION['nick'] ?> >View your page</a>
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
				<a id="open" class="open" href="#"><?php echo $_SESSION['nick']?'Open Panel':'Log In | Register';?></a>
				<a id="close" style="display: none;" class="close" href="#">Close Panel</a>			
			</li>
	    	<li class="right">&nbsp;</li>
		</ul> 
	</div> <!-- / top -->
	
</div> <!--panel -->

<nav id="main_menu">
    <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">Shop</a>
            <ul>
                <li><a href="#">Body paint</a></li>
                <li><a href="#">Items</a></li>
                <li><a href="#">Power Ups</a></li>
            </ul>
        </li>
        <li><?php if($_SESSION['id']): ?>
                <a class="m_play">Play</a></li>
            <?php else: ?>
                <a class="m_notLogin">Play</a>
            <?php endif; ?>
        <li><?php if($_SESSION['id']): ?>
                <a href='../profile/<?php echo $_SESSION['nick']?>'>Profile</a>
            <?php else: ?>
                <a class="m_notLogin">Profile</a>
            <?php endif; ?>
            <ul>
                <li><a href="#">Leaderboards</a></li>
            </ul>
        </li>
        <li><a href="#">About</a>
            <ul>
                <li><a href="#">How to play</a></li>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">About us</a></li>
            </ul>
        </li>
    </ul>
</nav>

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
                      <span><input type="button" value="" onclick="pvp('<?php echo $_SESSION['nick']
                          ? $_SESSION['nick'] : null ?>')" id="pvp"></span>
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

<div class="onlineWidget">
	<div class="panel"><img class="preloader" src="../images/preloader.gif" alt="Loading.." width="22" height="22" /></div>
    <div class="bottom_panel">
        <div class="count"></div>
        <div class="label">online</div>
        <div class="arrow"></div>
    </div>
</div>

<?php if($_SESSION['id']): ?>
    <script>
        $(document).ready(function(){
            promptNotifications('<?php echo $_SESSION['nick'] ?>', requestNotification);
        });
    </script>
<?php endif; ?>

</body>
</html>
