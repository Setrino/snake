<?php

if(!defined('INCLUDE_CHECK')) die('You are not allowed to execute this file directly');

function checkEmail($str)
{
	return preg_match("/^[\.A-z0-9_\-\+]+[@][A-z0-9_\-]+([.][A-z0-9_\-]+)+[A-z]{1,4}$/", $str);
}

function send_mail($from, $to, $subject, $body) {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
    curl_setopt($ch, CURLOPT_USERPWD, 'api:key-1vjt41z33cqguafnv0exqlwzins9pcq3');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($ch, CURLOPT_URL, 'https://api.mailgun.net/v2/snake.mailgun.org/messages');
    curl_setopt($ch, CURLOPT_POSTFIELDS, array('from' => 'Snake MMO <info@snake.mailgun.org>',
        'to' => $to,
        'subject' => $subject,
        'text' => $body));

    $result = curl_exec($ch);
    curl_close($ch);

    return $result;
}

function send_mail_old($from,$to,$subject,$body)
{

    //ini_set("sendmail_from", $from);

    $headers = '';
    $headers .= "From: $from\n";
    $headers .= "Reply-to: $from\n";
    $headers .= "Return-Path: $from\n";
    $headers .= "Message-ID: <" . md5(uniqid(time())) . "@" . $_SERVER['SERVER_NAME'] . ">\n";
    $headers .= "MIME-Version: 1.0\n";
    $headers .= "Date: " . date('r', time()) . "\n";

    mail($to,$subject,$body,$headers);
}

function get_tag($tag,$xml)
{
	preg_match_all('/<'.$tag.'>(.*)<\/'.$tag.'>$/imU',$xml,$match);
	return $match[1];
}

function is_bot()
{
	/* This function will check whether the visitor is a search engine robot */
	
	$botlist = array("Teoma", "alexa", "froogle", "Gigabot", "inktomi",
	"looksmart", "URL_Spider_SQL", "Firefly", "NationalDirectory",
	"Ask Jeeves", "TECNOSEEK", "InfoSeek", "WebFindBot", "girafabot",
	"crawler", "www.galaxy.com", "Googlebot", "Scooter", "Slurp",
	"msnbot", "appie", "FAST", "WebBug", "Spade", "ZyBorg", "rabaz",
	"Baiduspider", "Feedfetcher-Google", "TechnoratiSnoop", "Rankivabot",
	"Mediapartners-Google", "Sogou web spider", "WebAlta Crawler","TweetmemeBot",
	"Butterfly","Twitturls","Me.dium","Twiceler");

	foreach($botlist as $bot)
	{
		if(strpos($_SERVER['HTTP_USER_AGENT'],$bot)!==false)
		return true;	// Is a bot
	}

	return false;	// Not a bot
}
?>