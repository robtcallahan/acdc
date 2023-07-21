<?php

include __DIR__ . "/config/global.php";

use STS\AD\ADUserTable;
use STS\AD\ADUser;
use STS\Login\UserTable;
use STS\Login\LoginTable;
use STS\Login\PageViewTable;
use STS\Util\HTTPParameters;

try {
    // config settings
    $config = $GLOBALS['config'];


    // POST params
    $httpParams = new HTTPParameters();
    $params     = $httpParams->getParams(array('tablet'));

    // obtain the LDAP auth'd username and get the Active Directory information for the user
    if (array_key_exists("PHP_AUTH_USER", $_SERVER)) {
        $userName = $_SERVER["PHP_AUTH_USER"];

        // use AD ldap to get info and save to local table
        $adUser  = new ADUser();
        try {
            $adTable = new ADUserTable();
            $adUser = $adTable->getByUid($userName);
        } catch (Exception $e) {
        }


        // check if user exists in our db. if not, we'll just skip the logging step for now
        $userTable = new UserTable();
        $actor     = $userTable->getByUserName($userName);

        if ($adUser && $adUser->getFirstName()) {
            foreach (array('empId', 'firstName', 'lastName', 'title', 'dept', 'email', 'office', 'officePhone', 'mobilePhone') as $key) {
                $actor->set($key, $adUser->get($key));
            }
        }

        if (!$actor->getId()) {
            // user does not exist in the local user table. create an entry
            $actor->setUserName($userName);
            $actor = $userTable->create($actor);
        } else {
            $actor = $userTable->update($actor);
        }

        // now update the info in the login table with last login timestamp and web agent info
        $loginTable = new LoginTable();
        $loginTable->record($actor->getId());

        $pvTable = new PageViewTable();
        $pvTable->record($actor->getId());
    } else {
        $returnHash = array(
            "returnCode" => 1,
            "errorCode"  => 0,
            "errorText"  => "User is unknown. Perhaps authentication is turned off."
        );
        echo "<pre>" . print_r($returnHash, true) . "</pre>";
        exit;
    }

    // define the BURT environment based upon the hostname (lame, but good enough for now)
    if (preg_match("/~/", $_SERVER["REQUEST_URI"])) {
        $env = "Development (User Instance)";
    } else if (preg_match("/acdc.dev|statvdvweb01|stopcdvvt3|localhost/", $_SERVER["SERVER_NAME"])) {
        $env = "Development";
    } else if (preg_match("/acdc.qa|stopcqavt2|stopcqavt1/", $_SERVER["SERVER_NAME"])) {
        $env = "QA";
    } else if (preg_match("/acdc.ops|chopcprvt2|stopcprvt2/", $_SERVER["SERVER_NAME"])) {
        $env = "Production";
    } else {
        $env = "Unknown";
    }

    // release info
    $release = file_get_contents("ABOUT");
    $release = rtrim($release);

    // get a list of locations and IDs to pass to javascript
    $locationTable       = new LocationTable();
    $locationsHashById   = $locationTable->getAllHashById();
    $locationsHashByName = $locationTable->getAllHashByName();

    // check the web agent to determine if this is Dave's tablet. If so, show the default form view
    $userAgent = array_key_exists("HTTP_USER_AGENT", $_SERVER) ? $_SERVER["HTTP_USER_AGENT"] : "CLI";

    // if IE, display a note that says it no worky for IE and to get a real browser
    if (strpos($userAgent, 'MSIE') !== false) {
        echo "
        <html>
          <head>
            <style type='text/css'>
            body {
              font-family: arial;
              font-size: 14pt;
            }
            h1 {
              font-weight: bold;
              font-size: 14pt;
            }
            </style>
          </head>
          <body>
            <h1>Microsoft Internet Explorer Detected</h1>
            <p>
              It looks like you are using IE to view this page.<br>
              ACDC does not support IE because it takes advantage of<br>
              the 'canvas' element in HTML5 which IE does not currently support.<br>
              Boo.
            </p>
            <p>
              You will have to download, install and use one of the following 'modern' browsers:
              <ul>
                <li><a href='https://www.google.com/intl/en/chrome/browser/?&brand=CHMA&utm_campaign=en&utm_source=en-ha-na-us-bk&utm_medium=ha'>Chrome</a></li>
                <li><a href='http://www.mozilla.org/en-US/firefox/new/'>Firefox</a></li>
                <li><a href='http://www.apple.com/safari/'>Safari</a></li>
              </ul>
            </p>
          </body>
        </html>
        ";
        exit;
    }

    if (preg_match("/Android.*Transformer/", $userAgent) || $params['tablet']) {
        include 'index_tablet.php';
        exit;
    } else {
        $agent = 'desktop';
    }
} catch (Exception $e) {
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

    <link rel="stylesheet" type="text/css" href="/ext/resources/css/ext-all.css"/>

    <!--
    <link rel="stylesheet" type="text/css" href="ext/resources/css/xtheme-slate.css" />
    -->
    <link rel="stylesheet" type="text/css" href="resources/css/acdc.css"/>

    <?php
    $jsFiles1 = array(
        'fabric/dist/fabric.min.js',
        'ext/adapter/ext/ext-base.js',
        'ext/ext-all.js',
        'js/ExtOverrides.js',
        'js/Constants.js',
        'js/Helpers.js',
        'js/ErrorAlert.js',
        'js/Ajax.js',
        'js/Notify.js',
        'js/ConsoleLog.js',
        'js/LoginsGridPanel.js',
        'js/AssetHistoryGridPanel.js',
        'js/ExceptionsGridPanel.js',
        'js/AssetsGridPanel.js',
        'js/AssetSearchComboBox.js',
        'js/EditorComboBox.js',
        'js/PropertyColumnModel.js',
        'js/AssetDetails.js',
        'js/FabricObjectClasses.js',
        'js/ReportsGrid.js',
        'js/DCLayout.js',
        'js/CabinetElevation.js',
        'js/CabinetDetails.js',
        'js/App.js',
        'js/ACDC.js',
    );

    if ($env == "Development") {
    foreach ($jsFiles1 as $file) {
        ?>
        <script type="text/javascript" src="<?= $file ?>"></script>
    <?php
    }
    } else {
    $cat1 = "";
    foreach ($jsFiles1 as $file) {
        $cat1 .= file_get_contents(__DIR__ . "/" . $file);
    }
    file_put_contents(__DIR__ . "/export/js_files_cat1.js", $cat1);
    ?>
        <script type="text/javascript" src="export/js_files_cat1.js"></script>
        <?php
    }
    ?>


    <script type='text/javascript'>
        Ext.namespace('ACDC');
        ACDC.env = '<?=$env?>';
        ACDC.release = '<?=$release?>';
        ACDC.agent = '<?=$agent?>';
        ACDC.imagesDir = '<?=$config->imagesDir?>';
        ACDC.assetImages = '<?=json_encode($config->assetImages)?>';
        ACDC.locationHashById = '<?=json_encode($locationsHashById)?>';
        ACDC.locationHashByName = '<?=json_encode($locationsHashByName)?>';
        ACDC.actor = {
            id:          <?=$actor->getId()?>,
            firstName: '<?=$actor->getFirstName()?>',
            lastName: '<?=$actor->getLastName()?>',
            userName: '<?=$actor->getUserName()?>',
            nickName: '<?=$actor->getNickName()?>',
            email: '<?=$actor->getEmail()?>',
            accessCode:  <?=$actor->getAccessCode()?>
        };

    </script>
</head>

<body oncontextmenu="return false;">

<?php
$cabinetTypeTable = new CabinetTypeTable();
$cabinetTypes     = $cabinetTypeTable->getAll();

for ($i = 0; $i < count($cabinetTypes); $i++) {
    $ct = $cabinetTypes[$i];
    ?>
    <img src="resources/images/<?= $ct->getImageName() ?>"
         id="img-<?= $ct->getId() ?>"
         img_id="<?= $ct->getId() ?>"
         img_name="<?= $ct->getName() ?>"
         img_type="<?= $ct->getType() ?>"
         img_file="<?= $ct->getImageName() ?>"
         img_length="<?= $ct->getLength() ?>"
         img_width="<?= $ct->getWidth() ?>"
         style="display: none; left: -1000px"
        />
    <?php
}
?>

</body>
</html>

