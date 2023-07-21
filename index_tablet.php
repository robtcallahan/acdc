<?php
/*******************************************************************************
 *
 * $Id: index_tablet.php 81202 2013-11-14 14:25:50Z rcallaha $
 * $Date: 2013-11-14 09:25:50 -0500 (Thu, 14 Nov 2013) $
 * $Author: rcallaha $
 * $Revision: 81202 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/index_tablet.php $
 *
 *******************************************************************************
 */

try
{
	// config settings
	$config = $GLOBALS['config'];
	
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
  
  <title>ACDC</title>
    
  <link rel="stylesheet" type="text/css" href="ext/resources/css/ext-all.css" />

  <!--
  <link rel="stylesheet" type="text/css" href="ext/resources/css/xtheme-slate.css" />
  -->

  <link rel="stylesheet" type="text/css" href="resources/css/acdc.css" />
  <link rel="stylesheet" type="text/css" href="resources/css/acdc_tablet.css" />

  <script type='text/javascript' src='ext/adapter/ext/ext-base-debug.js'></script>
  <script type='text/javascript' src='ext/ext-all-debug.js'></script>
  
  <script type='text/javascript' src='js/Constants.js'></script>
  <script type='text/javascript' src='js/Helpers.js'></script>
  <script type='text/javascript' src='js/ErrorAlert.js'></script>
  <script type='text/javascript' src='js/Ajax.js'></script>
  <script type='text/javascript' src='js/Notify.js'></script>
  <script type='text/javascript' src='js/ConsoleLog.js'></script>
  <script type='text/javascript' src='js/EditorComboBox.js'></script>
  <script type='text/javascript' src='js/AssetSearchComboBox.js'></script>
  <script type='text/javascript' src='js/PropertyColumnModel.js'></script>
  <script type='text/javascript' src='js/AssetDetails.js'></script>
  <script type='text/javascript' src='js/CabinetAssets.js'></script>
  <script type='text/javascript' src='js/AppTablet.js'></script>
  <script type='text/javascript' src='js/ACDC.js'></script>

  <script type='text/javascript'>
      Ext.namespace('ACDC');
      ACDC.env     = '<?=$env?>';
      ACDC.release = '<?=$release?>';
      ACDC.agent   = 'tablet';
      ACDC.imagesDir = '<?$config->imagesDir?>';
      ACDC.assetImages = '<?=json_encode($config->assetImages)?>';
      ACDC.locationHashById = '<?=json_encode($locationsHashById)?>';
      ACDC.locationHashByName = '<?=json_encode($locationsHashByName)?>';
      ACDC.actor   = {
      	  id:          <?=$actor->getId()?>,
      	  firstName:   '<?=$actor->getFirstName()?>',
      	  lastName:    '<?=$actor->getLastName()?>',
      	  userName:    '<?=$actor->getUserName()?>',
      	  nickName:    '<?=$actor->getNickName()?>',
      	  email:       '<?=$actor->getEmail()?>',
	      accessCode:  <?=$actor->getAccessCode()?>
      };
  </script>
</head>

<body oncontextmenu="return false;">
</body>
</html>

