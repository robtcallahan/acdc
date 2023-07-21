<?php
/*******************************************************************************
 *
 * $Id: screen_test.php 79752 2013-10-10 18:44:06Z rcallaha $
 * $Date: 2013-10-10 14:44:06 -0400 (Thu, 10 Oct 2013) $
 * $Author: rcallaha $
 * $Revision: 79752 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/screen_test.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

use STS\AD\ADUserTable;
use STS\AD\ADUser;
use STS\Login\UserTable;
use STS\Login\LoginTable;
use STS\Login\PageViewTable;
use STS\Util\SysLog;

try 
{
	// config settings
	$config = $GLOBALS['config'];
	
	// obtain the LDAP auth'd username and get the Active Directory information for the user
	if (array_key_exists("PHP_AUTH_USER", $_SERVER)) 
	{
		$userName = $_SERVER["PHP_AUTH_USER"];
		
		// use AD ldap to get info and save to local table
		$adTable = new ADUserTable();
		$adUser = new ADUser();
		try
		{
			$adUser = $adTable->getByUid($userName);
		}
		catch (Exception $e)
		{
		}
	    
		// check if user exists in our db. if not, we'll just skip the logging step for now
		$userTable = new UserTable();
		$actor = $userTable->getByUserName($userName);
		
		if ($adUser && $adUser->getFirstName())
		{
			foreach (array('empId', 'firstName', 'lastName', 'title', 'dept', 'email', 'office', 'officePhone', 'mobilePhone') as $key)
			{
				$actor->set($key, $adUser->get($key));
			}
		}
	    
		if (!$actor->getId())
		{
			// user does not exist in the local user table. create an entry
			$actor->setUserName($userName);
			$stsuser = $userTable->getByUserName("stsuser");
			$actor = $userTable->create($stsuser);
		}
		else
		{
			$actor = $userTable->update($actor);
		}
		
		// now update the info in the login table with last login timestamp and web agent info
		$loginTable = new LoginTable();
		$loginTable->record($actor->getId());

		$pvTable = new PageViewTable();
		$pvTable->record($actor->getId());

		$userAgent = array_key_exists("HTTP_USER_AGENT", $_SERVER) ? $_SERVER["HTTP_USER_AGENT"] : "CLI";
		$ipAddr    = array_key_exists("REMOTE_ADDR", $_SERVER) ? $_SERVER["REMOTE_ADDR"] : "localhost";

		print "<pre>";
		print "Name => " . $actor->getFirstName() . " " . $actor->getLastName() . "\n";
		print "User Agent => " . $userAgent . "\n";
		print "IP Address => " . $ipAddr . "\n";
		print "</pre>";
	}
	else 
	{
		$returnHash = array(
			"returnCode" => 1,
			"errorCode"  => 0,
			"errorText"  => "User is unknown. Perhaps authentication is turned off."
			);
		echo "<pre>" . print_r($returnHash, true) . "</pre>";
		exit;
	}
}

catch (Exception $e)
{
	echo "<html><body><pre>";
	echo "Error " . $e->getCode() . ": " . $e->getMessage() . "\n";
	echo "  in file: " . $e->getFile() . "\n";
	echo "  at line: " . $e->getLine() . "\n";
	echo "    trace:\n" . $e->getTraceAsString() . "\n";
	echo "</pre></body></html>";
	exit;
}

?>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
  
  <title>ACDC Screen Test</title>
    
  <script type='text/javascript'>
	  function wndsize()
	  {
		  var w = 0;
		  var h = 0;
		  //IE
		  if (!window.innerWidth) {
			  if (!(document.documentElement.clientWidth == 0)) {
				  //strict mode
				  w = document.documentElement.clientWidth;
				  h = document.documentElement.clientHeight;
			  }
			  else {
				  //quirks mode
				  w = document.body.clientWidth;
				  h = document.body.clientHeight;
			  }
		  }
		  else {
			  //w3c
			  w = window.innerWidth;
			  h = window.innerHeight;
		  }
		  return {width: w, height: h};
	  }

	  function wndcent()
	  {
		  var hWnd = (arguments[0] != null) ? arguments[0] : {width: 0, height: 0};
		  var _x, _y, offsetX = 0, offsetY = 0;
		  //IE
		  if (!window.pageYOffset) {
			  //strict mode
			  if (!(document.documentElement.scrollTop == 0)) {
				  offsetY = document.documentElement.scrollTop;
				  offsetX = document.documentElement.scrollLeft;
			  }
			  //quirks mode
			  else {
				  offsetY = document.body.scrollTop;
				  offsetX = document.body.scrollLeft;
			  }
		  }
		  //w3c
		  else {
			  offsetX = window.pageXOffset;
			  offsetY = window.pageYOffset;
		  }
		  _x = ((wndsize().width - hWnd.width) / 2) + offsetX;
		  _y = ((wndsize().height - hWnd.height) / 2) + offsetY;
		  return{x: _x, y: _y};
	  }
	  var center = wndcent({width: 350, height: 350});
	  document.write('<pre>');
	  document.write('Window width => ' + wndsize().width + "\n");
	  document.write('Window height => ' + wndsize().height + "\n");
	  document.write('</pre>');

  </script>
</head>

<body>
</body>
</html>

