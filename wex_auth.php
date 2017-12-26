<?php
    // $timestamp[] = $_GET["signature"];
    // $timestamp[] = $_GET["timestamp"];
    // $timestamp[] = $_GET["nonce"];
    $echostr = $_GET["echostr"];

	// $tmpArr = array(timestamp, $nonce);
	// sort($tmpArr, SORT_STRING);
	// $tmpStr = implode( $tmpArr );
	// $tmpStr = sha1( $tmpStr );

	// if( signature ){
	// 	return true;
	// }else{
	// 	return false;
	// }
	echo $echostr;
 ?>