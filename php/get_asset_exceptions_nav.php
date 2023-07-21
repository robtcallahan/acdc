<?php
/*******************************************************************************
 *
 * $Id: get_asset_exceptions_nav.php 81550 2013-12-02 03:37:06Z rcallaha $
 * $Date: 2013-12-01 22:37:06 -0500 (Sun, 01 Dec 2013) $
 * $Author: rcallaha $
 * $Revision: 81550 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/get_asset_exceptions_nav.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

try
{
    // config info
	$config = $GLOBALS['config'];

    // instantiate needed classes
	$assetTable = new AssetTable();
    $exceptionsTable = new AssetExceptionTable();

    $data = array();

    $rows = $exceptionsTable->getCountsByType();
    foreach ($rows as $row) {
        $descr = AssetExceptionTable::$exceptionDescriptions[$row->exceptionType];
        $id = preg_replace("/\s/", "-", strtolower($descr));
        $data[] = array(
            "id" => $id,
            "exception" => $descr,
            "count" => $row->numRows
        );
    }

    $row = $assetTable->sqlQueryRow("select count(*) as numRows from asset where elevation = 0 or elevation is null or elevation = '';");
    $data[] = array(
        "id" => "missing-elevation",
        "exception" => "Missing Elevation",
        "count" => $row->numRows
    );

    $row = $assetTable->sqlQueryRow("select count(*) as numRows from asset where numRUs = 0 or numRUs is null or numRUs = '';");
    $data[] = array(
        "id" => "missing-rus",
        "exception" => "Missing RUs",
        "count" => $row->numRows
    );

    $html = "<div class='exceptions-nav'><table><tbody>";
    foreach ($data as $row) {
        $html .= "<tr><td><div id='" . $row['id'] . "' class='exceptions-nav-row'><table class='exceptions-nav-table' width='100%'><tbody><tr><td id='td1-" . $row['id'] . "' class='exceptions-nav-cell'>{$row['exception']}</td><td id='td2-" . $row['id'] . "' class='exceptions-nav-cell-value'>{$row['count']}</td></tr></tbody></table></td></tr>";
    }
    $html .= "</tbody></table></div>";
    echo $html;
}

catch (Exception $e)
{
	print json_encode(
		array(
			"returnCode" => 1,
			"errorCode"  => $e->getCode(),
			"errorText"  => $e->getMessage(),
			"errorFile"  => $e->getFile(),
			"errorLine"  => $e->getLine(),
			"errorStack" => $e->getTraceAsString()
			)
		);
}
