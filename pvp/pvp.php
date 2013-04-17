<?php

define('INCLUDE_CHECK',true);
require_once "../templates/login.php";
require_once "../templates/functions.php";

// Starting the session
session_name('tzLogin');

// Making the cookie live for 2 weeks
session_set_cookie_params(2*7*24*60*60);

session_start();

$getNick = '';
$query = '';
$err = array();

if(isset($_GET['name']) && $_SESSION['id']){
    $getTable = $_GET['name'];
    $getNick = $_SESSION['nick'];
    $query = mysql_query("SELECT * from $getTable WHERE nick='$getNick'") or die(mysql_error());
    if(!mysql_fetch_array($query))
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
    <link rel="stylesheet" href="../css/reset.css">
    <link rel="stylesheet" href="../css/game.css">
</head>

<body>
<canvas id="gameCanvas"></canvas>
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
</body>

<?php }else{ ?>
<head>
    <title>A multiplayer game built using HTML5 canvas and WebSockets</title>
    <meta charset="utf-8">
    <link rel="stylesheet" href="../css/reset.css">
    <link rel="stylesheet" href="../css/game.css">
    <script src="../js/jquery-1.9.1.min.js"></script>
    <!-- PNG FIX for IE6 -->
    <!-- http://24ways.org/2007/supersleight-transparent-png-in-ie6 -->
    <!--[if lte IE 6]>
    <script type="text/javascript" src="../js/pngfix/supersleight-min.js"></script>
    <![endif]-->
    <script src="../js/overlay_box.js"></script>
</head>
<body>
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