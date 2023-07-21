<?php

include __DIR__ . "/../config/global.php";

use STS\CMDB\CMDBLocationTable;
use STS\CMDB\CMDBRackTable;

try {

    $post = file_get_contents("php://input");
    $params = json_decode($post);
    $action = property_exists($params, "action") ? $params->action : "save";

    $cmdbLocationTable = new CMDBLocationTable();
    $cmdbRackTable     = new CMDBRackTable($useUserCredentials = true);

    $locationTable = new LocationTable();
    $cabinetTable  = new CabinetTable();
    $phTable       = new PlaceholderTable();
    $lineTable     = new LineTable();
    $textTable     = new TextTable();

    $objType = $params->type;

    // new object
    if (!$params->id) {
        // cabinet
        if ($objType == "cabinet") {
            $cabinet = new Cabinet();
            $cabinet
                ->setName($params->label)
                ->setCabinetTypeId($params->cabinetTypeId)
                ->setLocationId($params->locationId)
                ->setX($params->left)
                ->setY($params->top)
                ->setRotation($params->angle);
            $object = $cabinetTable->create($cabinet);
        }
        else if ($objType == "placeholder") {
            $placeholder = new Placeholder();
            $placeholder
                ->setText($params->label)
                ->setLocationId($params->locationId)
                ->setCabinetTypeId($params->cabinetTypeId)
                ->setX($params->left)
                ->setY($params->top)
                ->setTileX($params->tileX)
                ->setTileY($params->tileY)
                ->setRotation($params->angle);
            $object = $phTable->create($placeholder);
        }
        else if (preg_match("/perf_tile|column|pdu|crac|generic/", $objType)) {
            $perfTile = new Placeholder();
            $perfTile
                ->setText("")
                ->setLocationId($params->locationId)
                ->setCabinetTypeId($params->cabinetTypeId)
                ->setScaleX($params->scaleX)
                ->setScaleY($params->scaleY)
                ->setX($params->left)
                ->setY($params->top)
                ->setTileX(property_exists($params, 'tileX') ? $params->tileX : 0)
                ->setTileY(property_exists($params, 'tileY') ? $params->tileY : 0)
                ->setRotation($params->angle);
            $object = $phTable->create($perfTile);
        }
        else if ($objType == "label") {
            $text = new Text();
            $text
                ->setString($params->text)
                ->setLocationId($params->locationId)
                ->setX($params->left)
                ->setY($params->top)
                ->setRotation($params->angle)
                ->setFontFamily($params->fontFamily)
                ->setFontSize($params->fontSize)
                ->setFontWeight($params->fontWeight);
            $object = $textTable->create($text);
        }
        else if ($objType == "line") {
            $line = new Line();
            $line
                ->setLocationId($params->locationId)
                ->setTop($params->top)
                ->setLeft($params->left)
                ->setWidth($params->width)
                ->setHeight($params->height)
                ->setAngle($params->angle)
                ->setScaleX($params->scaleX)
                ->setScaleY($params->scaleY)
                ->setX1($params->x1)
                ->setY1($params->y1)
                ->setX2($params->x2)
                ->setY2($params->y2)
                ->setColor($params->stroke)
                ->setCap($params->strokeLineCap)
                ->setThickness($params->strokeWidth);
            $object = $lineTable->create($line);
        }
    }
    else if ($action == "delete") {
        if ($objType == "cabinet") {
            $object = $cabinetTable->getById($params->id);
            $cabinetTable->delete($object);
        } else if (preg_match("/placeholder|perf_tile|column|pdu|crac|generic/", $objType)) {
            $object = $phTable->getById($params->id);
            $phTable->delete($object);
        } else if ($objType == "label") {
            $object = $textTable->getById($params->id);
            $textTable->delete($object);
        } else if ($objType == "line") {
            $object = $lineTable->getById($params->id);
            $lineTable->delete($object);
        }
        echo json_encode(
            array(
                "returnCode" => 0
            )
        );
        exit;
    }
    // update object
    else {
        // cabinet
        if ($objType == "cabinet") {
            $cabinet = $cabinetTable->getById($params->id);

            // check for the existance of a sysid on the rack
            if (!$cabinet->getSysId() && !preg_match("/^New/", $params->label)) {
                // get the local and cmdb locations
                $location     = $locationTable->getById($params->locationId);
                $cmdbLocation = $cmdbLocationTable->getBySysId($location->getSysId());
                $cmdbRack     = $cmdbRackTable->getByNameAndLocationId($params->label, $cmdbLocation->getSysId());

                // try to find the cmdb rack. If it doesn't exist, we need to create it
                if ($cmdbRack->getSysId() == null) {
                    // rack doesn't exist in CMDB, need to create a new CI
                    $cmdbRack = new \STS\CMDB\CMDBRack();
                    $cmdbRack->setName($params->label)
                             ->setLocationId($cmdbLocation->getSysId());
                    $cmdbRack = $cmdbRackTable->create($cmdbRack);
                }
                $cabinet->setSysId($cmdbRack->getSysId());
            }

            $cabinet
                ->setName($params->label)
                ->setCabinetTypeId($params->cabinetTypeId)
                ->setLocationId($params->locationId)
                ->setX($params->left)
                ->setY($params->top)
                ->setRotation($params->angle)
                ->setHasPower($params->hasPower);

            $object = $cabinetTable->update($cabinet);
        }
        else if ($objType == "placeholder") {
            $placeholder = $phTable->getById($params->id);
            $placeholder
                ->setText($params->label)
                ->setCabinetTypeId($params->cabinetTypeId)
                ->setLocationId($params->locationId)
                ->setX($params->left)
                ->setY($params->top)
                ->setTileX($params->tileX)
                ->setTileY($params->tileY)
                ->setRotation($params->angle);
            $object = $phTable->update($placeholder);
        }
        else if (preg_match("/perf_tile|column|pdu|crac|generic/", $objType)) {
            $placeholder = $phTable->getById($params->id);
            $placeholder
                ->setText("")
                ->setCabinetTypeId($params->cabinetTypeId)
                ->setLocationId($params->locationId)
                ->setScaleX($params->scaleX)
                ->setScaleY($params->scaleY)
                ->setX($params->left)
                ->setY($params->top)
                ->setTileX($params->tileX)
                ->setTileY($params->tileY)
                ->setRotation($params->angle);
            $object = $phTable->update($placeholder);
        }
        else if ($objType == "label") {
            $text = $textTable->getById($params->id);
            $text
                ->setString($params->text)
                ->setLocationId($params->locationId)
                ->setX($params->left)
                ->setY($params->top)
                ->setRotation($params->angle)
                ->setFontFamily($params->fontFamily)
                ->setFontSize($params->fontSize)
                ->setFontWeight($params->fontWeight)
                ->setColor($params->fill);
            $object = $textTable->update($text);
        }
        else if ($objType == "line") {
            $line = $lineTable->getById($params->id);
            $line
                ->setLocationId($params->locationId)
                ->setTop(floatval($params->top))
                ->setLeft(floatval($params->left))
                ->setWidth(floatval($params->width))
                ->setHeight(floatval($params->height))
                ->setAngle($params->angle)
                ->setScaleX($params->scaleX)
                ->setScaleY($params->scaleY)
                ->setX1($params->x1)
                ->setY1($params->y1)
                ->setX2($params->x2)
                ->setY2($params->y2)
                ->setColor($params->stroke)
                ->setCap($params->strokeLineCap)
                ->setThickness($params->strokeWidth);
            $object = $lineTable->update($line);
        }
        else {
            $placeholder = $phTable->getById($params->id);
            $placeholder
                ->setText("")
                ->setCabinetTypeId($params->cabinetTypeId)
                ->setLocationId($params->locationId)
                ->setScaleX($params->scaleX)
                ->setScaleY($params->scaleY)
                ->setX($params->left)
                ->setY($params->top)
                ->setTileX($params->tileX)
                ->setTileY($params->tileY)
                ->setRotation($params->angle);
            $object = $phTable->update($placeholder);
        }
    }

    echo json_encode(
        array(
            "returnCode" => 0,
            "object"     => $object->toObject()
        )
    );
} catch (Exception $e) {
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

