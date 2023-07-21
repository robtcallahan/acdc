<?php
/*******************************************************************************
 *
 * $Id: RUTable.php 82443 2014-01-03 14:28:19Z rcallaha $
 * $Date: 2014-01-03 09:28:19 -0500 (Fri, 03 Jan 2014) $
 * $Author: rcallaha $
 * $Revision: 82443 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/RUTable.php $
 *
 *******************************************************************************
 */

use STS\DB\DBTable;

class RUReservationTable extends DBTable
{
    protected static $columnNames = array(
        "id",
        "cabinetId",
        "elevation",
        "numRUs",
        "ruNumbers",
        "projectName",
        "businessService",
        "businessServiceId",
        "assetName",
        "model",
        "serialNumber",
        "assetTag",
        "reservationDate",
        "estimatedInstallDate"
    );

    protected static $joinTableColumnNames = array(
        "locationId",
        "locationName",
        "cabinetName"
    );

    protected $queryColumns;
    protected $allJoinedColumns;
    protected $allJoinedTables;
    protected $fullJoinedQuery;

    public function __construct($idAutoIncremented = true) {
        $this->dbIndex   = $GLOBALS['config']->appDB;
        $this->tableName = "ru_reservation";
        $this->idAutoIncremented = $idAutoIncremented;
		parent::__construct();

        $this->sysLog->debug();

        $colAr = explode(',', $this->getQueryColumnsStr());
        for ($i=0; $i<count($colAr); $i++) {
            $colAr[$i] = "t." . trim($colAr[$i]);
        }
        $this->queryColumns = implode(',', $colAr);

        $this->allJoinedColumns = $this->queryColumns . ",
            l.id as locationId, l.name as locationName,
            c.name as cabinetName
            ";
        $this->allJoinedTables =
            $this->tableName . " t
            left   outer join cabinet c on c.id = t.cabinetId
            left   outer join location l on l.id = c.locationId
            ";
        $this->fullJoinedQuery = "
            select " . $this->allJoinedColumns . "
            from   " . $this->allJoinedTables . "
            ";
    }

    /**
     * @param $id
     * @return RUReservation
     */
    public function getById($id) {
        $sql = $this->fullJoinedQuery . " where  t.id = '" . $id . "';";
        $row = $this->sqlQueryRow($sql);
        return $this->_set($row);
    }

    /**
     * @param $cabinetId
     * @param $elevation
     * @return RUReservation
     */
    public function getByCabinetIdAndElevation($cabinetId, $elevation) {
        $sql = $this->fullJoinedQuery . " where  cabinetId = " . $cabinetId . " and  elevation = " . $elevation . ";";
        $row = $this->sqlQueryRow($sql);
        return $this->_set($row);
    }

    /**
     * @param $cabinetId
     * @return RUReservation[]
     */
    public function getAllByCabinetId($cabinetId) {
        $sql = $this->fullJoinedQuery . " where  cabinetId = " . $cabinetId . ";";
        $result  = $this->sqlQuery($sql);
        $objects = array();
        for ($i = 0; $i < count($result); $i++) {
            $objects[] = $this->_set($result[$i]);
        }
        return $objects;
    }

    /**
     * @param $locationId
     * @return RUReservation[]
     */
    public function getAllByLocationId($locationId) {
        $sql = $this->fullJoinedQuery . " where l.id = {$locationId} order by c.name,t.elevation";
        $result  = $this->sqlQuery($sql);
        $objects = array();
        for ($i = 0; $i < count($result); $i++) {
            $objects[] = $this->_set($result[$i]);
        }
        return $objects;
    }

    /**
     * @param string $orderBy
     * @param string $dir
     * @return RUReservation[]
     */
    public function getAll($orderBy = "cabinetId", $dir = "asc") {
        $sql = $this->fullJoinedQuery . " order by " . $orderBy . " " . $dir . ";";
        $result  = $this->sqlQuery($sql);
        $objects = array();
        for ($i = 0; $i < count($result); $i++) {
            $objects[] = $this->_set($result[$i]);
        }
        return $objects;
    }


    // *******************************************************************************
    // CRUD methods
    // *******************************************************************************

    /**
     * @param RUReservation $o
     * @param string $sql
     * @return RUReservation
     */
    public function create($o, $sql = "")
    {
        $this->sysLog->debug();
        $newId = parent::create($o);
        return $this->getById($newId);
    }

    /**
     * @param RUReservation $o
     * @param string $idColumn
     * @param string $sql
     * @return mixed
     */
    public function update($o, $idColumn = "id", $sql = "")
    {
        $this->sysLog->debug();
        return parent::update($o);
    }

    /**
     * @param RUReservation $o
     * @param string $idColumn
     * @param string $sql
     * @return mixed
     */
    public function delete($o, $idColumn = "id", $sql = "")
    {
        $this->sysLog->debug();
        return parent::delete($o);
    }

    // *****************************************************************************
    // * Getters and Setters
    // *****************************************************************************

    /**
     * @param $columnNames
     */
    public static function setColumnNames($columnNames)
    {
        self::$columnNames = $columnNames;
    }

    /**
     * @return array
     */
    public static function getColumnNames()
    {
        return self::$columnNames;
    }

    /**
     * @param null $dbRowObj
     * @return RUReservation
     */
    private function _set($dbRowObj = null) {
        $this->sysLog->debug();

        $o = new RUReservation();
        if ($dbRowObj) {
            foreach (self::$columnNames as $prop) {
                if (property_exists($dbRowObj, $prop)) {
                    $o->set($prop, $dbRowObj->$prop);
                }
            }
            foreach (self::$joinTableColumnNames as $prop) {
                if (property_exists($dbRowObj, $prop)) {
                    $o->set($prop, $dbRowObj->$prop);
                }
            }
        } else {
            foreach (self::$columnNames as $prop) {
                $o->set($prop, null);
            }
            foreach (self::$joinTableColumnNames as $prop) {
                $o->set($prop, null);
            }
        }
        return $o;
    }

}
