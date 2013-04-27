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

if(!isset($_GET['name'])){
    header("Location: ../404.html");
    exit;
}

$checkRoom = mysql_query("SELECT name FROM rooms WHERE name='".$_GET['name']."'") or die(mysql_error());

if(!mysql_fetch_array($checkRoom)['name']){
    header("Location: ../404.html");
    exit;
}

if($_SESSION['id']){
    $getTable = $_GET['name'];
    $getNick = $_SESSION['nick'];
    $query = mysql_query("SELECT room FROm online WHERE nick='$getNick'") or die(mysql_error());
    //$query = mysql_query("SELECT * from $getTable WHERE nick='$getNick'") or die(mysql_error());

    $getRoom = mysql_fetch_array($query)['room'];

    if(!$getRoom || $getRoom != $getTable)
        $err[] = 'You are not part of this room';
}else{
        $err[] = 'You are not logged in';
}
/*else{
    $query = getQuery(explode("/",$_SERVER['REQUEST_URI'])[3]);
}*/

/*if($num_rows == 0){
    header("Location: 404");
}*/

if(!count($err)){
?>

<head>
    <title>A multiplayer game built using HTML5 canvas and WebSockets</title>
    <meta charset="utf-8">
    <link rel="stylesheet" href="../css/reset.css" />
    <link rel="stylesheet" href="../css/game.css" />
    <link rel="stylesheet" href="../css/buttons.css" />
</head>

<body>
    <div>
        <div class="pvp_container0">
            <div id='team0' class='team'>
                Team 0
                <hgroup>
                    <h1>Lex</h1>
                    <ul>
                        <li>Size: 5</li>
                        <li>Status: Online</li>
                    </ul>
                </hgroup>
                <hgroup>
                    <h1>Setrino</h1>
                    <ul>
                        <li>Size: 5</li>
                        <li>Status: Online</li>
                    </ul>
                </hgroup>
            </div>
            <br />
            <br />
            <br />
            <br />
            <div id='team1' class='team'>
                Team 1
                <hgroup>
                    <h1>Setrino</h1>
                    <ul>
                        <li>Size: 5</li>
                        <li>Status: Online</li>
                    </ul>
                </hgroup>
                <hgroup>
                    <h1>Setrino</h1>
                    <ul>
                        <li>Size: 5</li>
                        <li>Status: Online</li>
                    </ul>
                </hgroup>
            </div>
        </div>
        <div class="pvp_container">
            <canvas id="gameCanvas"></canvas>
            </div>
            <script src="../js/jquery-1.9.1.min.js"></script>
            <script src="http://localhost:8000/socket.io/socket.io.js"></script>
            <script src="../js/client/requestAnimationFrame.js"></script>
            <script src="../js/client/Keys.js"></script>
            <script src="../js/client/Snake.js"></script>
            <script src="../js/client/client.js"></script>
            <script>
                // Initialise the game
                init('<?php echo $getTable; ?>', '<?php echo $getNick; ?>');
                animate();
            </script>
            <div id="status"></div>
        <div>
        <div class="pvp_container1">
            <div id="chat"></div>
                <div class="submit_container">
                    <input type="text" name="message" id="message"/>
                    <input type="submit" id="message_form" class="btn btn-info" value="Send" />
                </div>
            </div>
        </div>
    </div>
    <script>
        message = $('#message');
        message.keyup(function(event){
            if(event.keyCode == 13 && message.is(':focus')){
                onSendMessage(message.val());
                message.val('');
            }
        });
        $('#message_form').on('click', function(){onSendMessage(message.val()); message.val('');});
    </script>
</body>

<?php }else{ ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>A multiplayer game built using HTML5 canvas and WebSockets</title>
    <meta charset="utf-8">
    <link rel="stylesheet" type="text/css" href="../css/styles.css" />
    <link rel="stylesheet" type="text/css" href="../css/slide.css" media="screen" />
    <link rel="stylesheet" type="text/css" href="../css/game.css" media="screen"/>
    <script src="../js/jquery-1.9.1.min.js"></script>

    <!-- PNG FIX for IE6 -->
    <!-- http://24ways.org/2007/supersleight-transparent-png-in-ie6 -->
    <!--[if lte IE 6]>
    <script type="text/javascript" src="../js/pngfix/supersleight-min.js"></script>
    <![endif]-->
    <script type="text/javascript" src="../js/slide.js"></script>
    <script src="../js/overlay_box.js"></script>
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
                        <a href="../templates/register.php">Register</a>
                        &nbsp;&nbsp;&nbsp;
                        <a href="../templates/forgot.php">Forgotten password</a>
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
                    <a href="../profile/profile.php">View a special member page</a>
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


    <!-- The dark background -->
    <div class="bgCover">&nbsp;</div>
    <!-- overlay box -->
    <div class="overlayBox">
        <div class="overlayContent">
            <!--normal content-->
            <div id="error" class="err"></div>
            <div class="home"><a href="../templates/index.php">Home</a></div>
        </div>
    </div>
    <script> openOverlay('<?php echo implode('<br />', $err) ?>');
            $('.bgCover').css({opacity:0}).animate( {opacity:0.5, backgroundColor:'#000'} );
    </script>
</body>

<?php }?>