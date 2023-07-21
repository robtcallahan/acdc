<?php
// An example of using php-webdriver.

require_once(__DIR__ . '/../../php-webdriver/lib/__init__.php');

// start Firefox
$host         = 'http://localhost:4444/wd/hub'; // this is the default
$capabilities = array(WebDriverCapabilityType::BROWSER_NAME => 'firefox');
$driver       = new RemoteWebDriver($host, $capabilities);
$link         = null;

// define the asset details values
$assetDetails = array(
    "Name"           => array(
        "fieldIndex" => 1,
        "value"      => "chbkqtl1.nc.neustar.com",
        "type"       => "read only",
    ),
    "Label Name"           => array(
        "fieldIndex" => 2,
        "value"      => "chbkqtl1",
        "type"       => "text",
        "id"         => "label-text-field",
    ),
    "Asset Class"          => array(
        "fieldIndex" => 3,
        "type"       => "combo",
        "remote"     => false,
        "value"      => "Storage",
    ),
    "Device Type"          => array(
        "fieldIndex" => 4,
        "type"       => "combo",
        "remote"     => true,
        "value"      => "Tape"
    ),
    "Location"             => array(
        "fieldIndex" => 5,
        "type"       => "combo",
        "remote"     => true,
        "value"      => "Charlotte-NC-CLT-1"
    ),
    "Rack"                 => array(
        "fieldIndex"   => 6,
        "type"       => "combo",
        "remote"     => true,
        "value"        => "14D",
    ),
    "Rack Elevation"       => array(
        "fieldIndex" => 7,
        "value"      => "20",
        "type"       => "text",
        "id"         => "elevation-text-field",
    ),
    "Number of Rack Units" => array(
        "fieldIndex" => 8,
        "value"      => "14.0",
        "type"       => "text",
        "id"         => "numRUs-text-field",
    ),
    "Serial Number"        => array(
        "fieldIndex" => 9,
        "value"      => "A0C0251306",
        "type"       => "text",
        "id"         => "serialNumber-text-field",
    ),
    "Asset Tag"            => array(
        "fieldIndex" => 10,
        "value"      => " ",
        "type"       => "text",
        "id"         => "assetTag-text-field",
    ),
    "Manufacturer"         => array(
        "fieldIndex"   => 11,
        "type"       => "combo",
        "remote"     => true,
        "value"        => "Quantum",
    ),
    "Model Number"         => array(
        "fieldIndex" => 12,
        "value"      => "QUANTUM i500",
        "type"       => "text",
        "id"         => "model-text-field",
    ),
    "Install Status"       => array(
        "fieldIndex" => 13,
        "value"      => "Live",
        "type"       => "combo",
        "remote"     => true,
    )
);

$assetDetailsTest = array(
    "Name"           => array(
        "fieldIndex" => 1,
        "value"      => "chbkqtl1.nc.neustar.com",
        "type"       => "read only",
    ),
    "Label Name"           => array(
        "fieldIndex" => 2,
        "value"      => "chbkqtl1-x",
        "type"       => "text",
        "id"         => "label-text-field",
    ),
    "Asset Class"          => array(
        "fieldIndex" => 3,
        "type"       => "combo",
        "remote"     => false,
        "value"      => "Host",
    ),
    "Device Type"          => array(
        "fieldIndex" => 4,
        "type"       => "combo",
        "remote"     => true,
        "value"      => "Standalone Host"
    ),
    "Location"             => array(
        "fieldIndex" => 5,
        "type"       => "combo",
        "remote"     => true,
        "value"      => "Sterling-VA-NSR-B8"
    ),
    "Rack"                 => array(
        "fieldIndex"   => 6,
        "type"       => "combo",
        "remote"     => true,
        "value"        => "A01",
    ),
    "Rack Elevation"       => array(
        "fieldIndex" => 7,
        "value"      => "25",
        "type"       => "text",
        "id"         => "elevation-text-field",
    ),
    "Number of Rack Units" => array(
        "fieldIndex" => 8,
        "value"      => "2.0",
        "type"       => "text",
        "id"         => "numRUs-text-field",
    ),
    "Serial Number"        => array(
        "fieldIndex" => 9,
        "value"      => "XXX-123456",
        "type"       => "text",
        "id"         => "serialNumber-text-field",
    ),
    "Asset Tag"            => array(
        "fieldIndex" => 10,
        "value"      => "ABC020304",
        "type"       => "text",
        "id"         => "assetTag-text-field",
    ),
    "Manufacturer"         => array(
        "fieldIndex"   => 11,
        "type"       => "combo",
        "remote"     => true,
        "value"        => "DELL",
    ),
    "Model Number"         => array(
        "fieldIndex" => 12,
        "value"      => "BadAss 9000",
        "type"       => "text",
        "id"         => "model-text-field",
    ),
    "Install Status"       => array(
        "fieldIndex" => 13,
        "type"       => "combo",
        "remote"     => true,
        "value"      => "Validating",
    )
);

$combos = array(
    "assetClass"    => array(
        "Host", "Network", "Storage", "SAN Switch"
    ),
    "deviceType"    => array(
        "Host"       => array(
            "Blade Chassis", "Blade Host", "Cloud", "Virtual Host", "MIDS", "Standalone Host"
        ),
        "Network"    => array(
            "Access Point", "ASA", "Bridge", "Firewall", "Gateway", "Hub", "Layer 3 Switch", "Load Balancer",
            "MUX", "Nexus Switch", "Packet Shaper", "PIX", "Router", "Switch", "VPN Host", "Wireless Controller"
        ),
        "Storage"    => array(
            "Array", "Tape", "Switch", "VTL"
        ),
        "SAN Switch" => array()
    ),
    "location"      => array(
        "Charlotte-NC-CLT-1", "Charlotte-NC-CLT-3", "Charlotte-NC-TWC", "Sterling-VA-JK-Moving", "Sterling-VA-NSR-B10", "Sterling-VA-NSR-B8", "Sterling-VA-NSR-RT3"
    ),
    "installStatus" => array(
        "On Order", "Received", "Staging", "Validating", "Live", "In Maintenance", "Decommissioning", "Disposed", "Inventory"
    )
);

loadPage();
selectAssetsTab();
loadAssets("charlotte");
#loadAssets("sterling");

print "Looking for chbkqtl1..nc.neustar.com...\n";
assetListRowClick('chbkqtl1.nc.neustar.com');

checkAssetDetails($assetDetails);

checkDeviceType($assetDetails, $combos);
checkManufacturer($assetDetails['Manufacturer']['fieldIndex']);

print "Checking Location values...\n";
checkCombo($assetDetails['Location']['fieldIndex'], $combos['location']);

print "Checking Install Status values...\n";
checkCombo($assetDetails['Install Status']['fieldIndex'], $combos['installStatus']);

print "Updating asset details...\n";
updateAsset($assetDetailsTest);

print "Clicking Save...\n";
$link = findElement("//table[@id='asset-prop-save-button']//button[text()='Save']");
$link->click();

print "Waiting for save to complete...\n";
waitForElement("//div[@id='message-box']", 15);

print "Loading Sterling assets...\n";
loadAssets("sterling");

print "Clicking on row to reload the asset...\n";
assetListRowClick('chbkqtl1.nc.neustar.com');

print "Checking saved values...\n";
checkAssetDetails($assetDetailsTest);

print "Changing asset back...\n";
updateAsset($assetDetails);

print "Clicking Save...\n";
$link = findElement("//table[@id='asset-prop-save-button']//button[text()='Save']");
$link->click();

print "Waiting for save to complete...\n";
waitForElement("//div[@id='message-box']", 15);

print "Loading Charlotte assets...\n";
loadAssets("charlotte");

print "Clicking on row to reload the asset...\n";
assetListRowClick('chbkqtl1.nc.neustar.com');

print "Checking saved values...\n";
checkAssetDetails($assetDetails);

print "Tests complete!\n";
sleep(15);
$driver->quit();

/*
print "Clicking Yes...\n";
$link = findElement("//div[@class='x-window-bc']//button[text()='Yes']");
$link->click();
*/

/**
 * --------------------------------------------------------------------------------------------------
 * Subroutines
 * --------------------------------------------------------------------------------------------------
 */

function updateAsset($assetDetails)
{
    foreach ($assetDetails as $name => $meta) {
        print "\tSetting " . $name . " to " . $meta['value'] . "\n";
        if ($meta['type'] == "text") {
            setTextValue($meta['fieldIndex'], $meta['id'], $meta['value']);
        } else if ($meta['type'] == "combo") {
            // local combo needs the combo trigger to be clicked so pass true to the selectComboOption function
            selectComboQuery($meta['fieldIndex'], $meta['value'], $meta['remote'] ? false : true);
        }
    }
}

function loadPage()
{
    global $driver;
    print "Loading ACDC...\n";
    $driver->get('http://localhost/~rcallaha/acdc');
    waitForElement("//li[@id='tabpanel__list-tab']//a[2]");
}

function selectAssetsTab()
{
    print "Selecting Assets List tab...\n";
    $link = findElement("//li[@id='tabpanel__list-tab']//a[2]");
    $link->click();

}

function loadAssets($site)
{
    print "Clicking the " . $site . " radio button...\n";
    $link = findElement("//input[@id='location-cb-" . $site . "']");
    $link->click();

    print "Waiting for assets to load...\n";
    waitForElement("//div[@id='tabpanel']//div[@class='x-grid3-body']//div[400]");

}

function checkAssetDetails($assetDetails)
{
    // check all values in the asset details panel
    foreach ($assetDetails as $name => $meta) {
        print "Looking for Property '" . $name . "' with Value '" . $meta['value'] . "'\n";
        $link = findElement("//div[@id='east-panel']//div[@class='x-grid3-body']//div[" . $meta['fieldIndex'] . "]//td[1]//div");
        if ($link->getText() != $name) {
            cleanUp("ERROR: expected property label '" . $name . "', got '" . $link->getText() . "'\n");
        };

        $link = findElement("//div[@id='east-panel']//div[@class='x-grid3-body']//div[" . $meta['fieldIndex'] . "]//td[2]//div");
        // if value is ' ', assume it really is ''. This seems to be the case. Not sure why
        #$getText = $link->getText() == ' ' ? '' : $link->getText();
        if ($link->getText() != $meta['value']) {
            cleanUp("ERROR: expected property value '" . $meta['value'] . "', got '" . $link->getText() . "'\n");
        };
    }
}

function checkDeviceType($assetDetails, $combos)
{
    print "Checking Asset Class values...\n";
    checkCombo($assetDetails['Asset Class']['fieldIndex'], $combos['assetClass'], true);

    // Check function of Device Type combo which loads based upon Asset Class combo
    print "Checking Device Type combo functionality...\n";
    for ($i = 0; $i < count($combos['assetClass']); $i++) {
        $assetClass = $combos['assetClass'][$i];
        if (count($combos['deviceType'][$assetClass]) > 0) {
            print "Checking Device Type values for Asset Class '" . $assetClass . "'...\n";
            selectComboQuery($assetDetails['Asset Class']['fieldIndex'], $assetClass, true);
            checkCombo($assetDetails['Device Type']['fieldIndex'], $combos['deviceType'][$assetClass]);
        }
    }
}

function setTextValue($index, $id, $value)
{
    $link = findElement("//div[@id='east-panel']//div[@class='x-grid3-body']//div[" . $index . "]//td[2]//div");
    $link->click();

    $link = waitForElement("//input[@id='" . $id . "']");
    $link->clear();
    $link->sendKeys($value);
    $link->sendKeys(WebDriverKeys::RETURN_KEY);
}

function checkManufacturer($fieldIndex)
{
    print "Checking Manufacturer auto completion...\n";
    $link = findElement("//div[@id='east-panel']//div[@class='x-grid3-body']//div[" . $fieldIndex . "]//td[2]//div");
    $link->click();

    $link = findElement("//div[@id='east-panel']//div[@class='x-layer x-editor x-small-editor x-grid-editor' and contains(@style, 'visibility: visible')]/div/input");
    $link->clear();
    $link->sendKeys("Allstream");

    waitFor("//div[@class='x-layer x-combo-list ' and contains(@style, 'visibility: visible')]/div[@class='x-combo-list-inner']/div[2]", 5);

    $array         = findElements("//div[@class='x-layer x-combo-list ' and contains(@style, 'visibility: visible')]/div[@class='x-combo-list-inner']/*");
    $i             = 0;
    $expectedArray = array("Allstream Hosting Support", "Allstream Managed Services");
    /** @var  WebDriverElement $el */
    foreach ($array as $el) {
        print "\tChecking " . $expectedArray[$i] . "\n";
        if ($el->getText() != $expectedArray[$i]) {
            cleanUp("ERROR: Expected combo value of '" . $expectedArray[$i] . "', got '" . $el->getText() . "'\n");
        }
        $i++;
    }
}

function checkCombo($index, $combo, $clickTrigger = false)
{
    $link = findElement("//div[@id='east-panel']//div[@class='x-grid3-body']//div[" . $index . "]//td[2]//div");
    $link->click();

    if ($clickTrigger) {
        $link = findElement("//div[@id='east-panel']//div[@class='x-layer x-editor x-small-editor x-grid-editor' and contains(@style, 'visibility: visible')]/div/img[@class='x-form-trigger x-form-arrow-trigger']");
        $link->click();
    } else {
        $link = waitForElement("//div[@id='east-panel']//div[@class='x-layer x-editor x-small-editor x-grid-editor' and contains(@style, 'visibility: visible')]/div/input");
        $link->sendKeys("   ");
    }

    waitForElement("//div[@class='x-layer x-combo-list ' and contains(@style, 'visibility: visible')]/div[@class='x-combo-list-inner']/div[" . (count($combo)) . "]");
    for ($i = 0; $i < count($combo); $i++) {
        print "\tChecking " . ($i + 1) . " = " . $combo[$i] . "\n";
        $link = findElement("//div[@class='x-layer x-combo-list ' and contains(@style, 'visibility: visible')]/div[@class='x-combo-list-inner']/div[" . ($i + 1) . "]");
        if ($link->getText() != $combo[$i]) {
            cleanUp("ERROR: Expected combo value of '" . $combo[$i] . "', got '" . $link->getText() . "'\n");
        }
    }
}

function checkComboKeys($index, $combo)
{
    checkCombo($index, $combo);
}

function checkComboClick($index, $combo)
{
    checkCombo($index, $combo);
}

function selectComboOption($fieldIndex, $string, $clickTrigger = false, $secs = 10)
{
    $link = findElement("//div[@id='east-panel']//div[@class='x-grid3-body']//div[" . $fieldIndex . "]//td[2]//div");
    $link->click();

    if ($clickTrigger) {
        $link = findElement("//div[@id='east-panel']//div[@class='x-layer x-editor x-small-editor x-grid-editor' and contains(@style, 'visibility: visible')]/div/img[@class='x-form-trigger x-form-arrow-trigger']");
        $link->click();
    } else {
        $link = waitForElement("//div[@id='east-panel']//div[@class='x-layer x-editor x-small-editor x-grid-editor' and contains(@style, 'visibility: visible')]/div/input");
        $link->clear();
        $link->sendKeys("   ");
    }

    $link = waitForElement("//div[@class='x-layer x-combo-list ' and contains(@style, 'visibility: visible')]/div[@class='x-combo-list-inner']/div[text()='" . $string . "']", $secs);
    $link->click();
}

function selectComboQuery($index, $string, $clickTrigger = false, $secs = 10)
{
    $link = findElement("//div[@id='east-panel']//div[@class='x-grid3-body']//div[" . $index . "]//td[2]//div");
    $link->click();

    if ($clickTrigger) {
        $link = findElement("//div[@id='east-panel']//div[@class='x-layer x-editor x-small-editor x-grid-editor' and contains(@style, 'visibility: visible')]/div/img[@class='x-form-trigger x-form-arrow-trigger']");
        $link->click();
    } else {
        $link = waitForElement("//div[@id='east-panel']//div[@class='x-layer x-editor x-small-editor x-grid-editor' and contains(@style, 'visibility: visible')]/div/input");
        $link->clear();
        $link->sendKeys($string);
    }

    $link = waitForElement("//div[@class='x-layer x-combo-list ' and contains(@style, 'visibility: visible')]/div[@class='x-combo-list-inner']/div[text()='" . $string . "']", 15);
    $link->click();
}

function findElement($xpath)
{
    global $driver;
    $link = null;
    try {
        $link = $driver->findElement(
            WebDriverBy::xpath($xpath)
        );
    } catch (NoSuchElementWebDriverError $e) {
        cleanUp($e->getMessage() . "\n");
    } catch (ElementNotDisplayedWebDriverError $e) {
        cleanUp($e->getMessage() . "\n");
    }
    return $link;
}

function findElements($xpath)
{
    global $driver;
    $array = array();

    $link = null;
    try {
        $array = $driver->findElements(
            WebDriverBy::xpath($xpath)
        );
    } catch (NoSuchElementWebDriverError $e) {
        cleanUp($e->getMessage() . "\n");
    } catch (ElementNotDisplayedWebDriverError $e) {
        cleanUp($e->getMessage() . "\n");
    }
    return $array;
}

function waitFor($xpath, $secs = 10)
{
    global $driver;
    try {
        $driver->wait($secs)->until(
            WebDriverExpectedCondition::presenceOfElementLocated(
                WebDriverBy::xpath($xpath)
            )
        );
    } catch (TimeOutWebDriverError $e) {
        cleanUp("Could not find xpath " . $xpath . "\n");
    } catch (ElementNotDisplayedWebDriverError $e) {
        cleanUp("Could not found xpath " . $xpath . " " . $e->getMessage() . "\n");
    }
}

function waitForElement($xpath, $secs = 10)
{
    waitFor($xpath, $secs);
    return findElement($xpath);
}

function waitForElements($xpath, $secs = 10)
{
    waitFor($xpath, $secs);
    return findElements($xpath);
}

function assetListRowClick($value)
{
    $link = findElement("//div[@id='tabpanel']//div[@class='x-grid3-body']//div[text()='" . $value . "']");
    print "Clicking on the row...\n";
    $link->click();

    print "Waiting for asset details to load in east panel...\n";
    waitForElement("//div[@id='east-panel']//div[@class='x-grid3-body']//div[13]//td[2]//div");
}

function cleanUp($msg = "")
{
    global $driver;
    if ($msg) {
        print $msg;
    }
    $driver->quit();
    exit;
}