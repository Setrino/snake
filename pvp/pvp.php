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

if(isset($_GET['name'])){
    $getTable = $_GET['name'];
    $getNick = $_SESSION['nick'];
    $query = mysql_query("SELECT * from rooms WHERE name='$getTable'") or die(mysql_error());
}
/*else{
    $query = getQuery(explode("/",$_SERVER['REQUEST_URI'])[3]);
}*/
$num_rows = mysql_num_rows($query);
$array = mysql_fetch_array($query, MYSQL_ASSOC);
$width = $array['width'];

/*if($num_rows == 0){
    header("Location: 404");
}*/

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
