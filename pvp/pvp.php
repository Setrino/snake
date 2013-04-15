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
    $getNick = $_GET['name'];
    $query = mysql_query("SELECT * from rooms WHERE name='$getNick'") or die(mysql_error());
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

</head>

<body>

<?php echo $width; ?>

</body>
