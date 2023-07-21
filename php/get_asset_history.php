<?php
/*******************************************************************************
 *
 * $Id: get_asset_history.php 80568 2013-10-30 20:28:34Z rcallaha $
 * $Date: 2013-10-30 16:28:34 -0400 (Wed, 30 Oct 2013) $
 * $Author: rcallaha $
 * $Revision: 80568 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/get_asset_history.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

use STS\Login\UserTable;

try {
    $assetId   = $_POST['assetId'];

    $userTable = new UserTable();

    $auditTable = new AuditTable();
    $records = $auditTable->getByAssetId($assetId);

    $data = array();
    foreach ($records as $rec) {
        $user = $userTable->getById($rec->getUserId());
        $data[] = (object) array(
            "id" => $rec->getId(),
            "timeStamp" => $rec->getTimeStamp(),
            "userName" => $user->getUserName(),
            "propertyName" => $rec->getPropertyName(),
            "oldValue" => $rec->getOldValue(),
            "newValue" => $rec->getNewValue()
        );
    }

    if (count($data) == 0) {
        $data[] = (object) array(
            "id" => 0,
            "timeStamp" => "",
            "userName" => "",
            "propertyName" => "No history recorded for this asset",
            "oldValue" => "",
            "newValue" => ""
        );
    }

	echo json_encode(
		array(
			"returnCode" => 0,
			"history"    => $data,
			"count"      => count($data)
		)
	);
}

catch
(Exception $e) {
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
