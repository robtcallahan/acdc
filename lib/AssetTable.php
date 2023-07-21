<?php
/*******************************************************************************
 *
 * $Id: AssetTable.php 82954 2014-02-04 15:46:18Z rcallaha $
 * $Date: 2014-02-04 10:46:18 -0500 (Tue, 04 Feb 2014) $
 * $Author: rcallaha $
 * $Revision: 82954 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/AssetTable.php $
 *
 *******************************************************************************
 */

use STS\DB\DBTable;

class AssetTable extends DBTable
{
	protected static $columnNames = array(
		"id",
        "sysId",
        "sysClassName",
        "assetClass",
        "foundBy",

        "name",
        "label",
        'deviceType',

        "cabinetId",
        "elevation",
        "numRUs",

        "serialNumber",
        "assetTag",
        "manufacturer",
		"model",
        "installStatus",

        "assetStateId",
        "powerStatus",

        "businessServiceSysId",
        "subsystemSysId",

        "lastUpdate"
	);

    protected static $joinTableColumnNames = array(
        "state",
        "businessService",
        "subsystem",
        "cabinet",
        "location",
        "locationId"
    );

    protected $queryColumns;
    protected $allJoinedColumns;
    protected $allJoinedTables;
    protected $fullJoinedQuery;

	public function __construct($idAutoIncremented=true) {
        $this->dbIndex = $GLOBALS['config']->appDB;
        $this->tableName = "asset";
        $this->idAutoIncremented = $idAutoIncremented;
		parent::__construct();

		$this->sysLog->debug();

        $colAr = explode(',', $this->getQueryColumnsStr());
        for ($i=0; $i<count($colAr); $i++) {
            $colAr[$i] = "t." . trim($colAr[$i]);
        }
        $this->queryColumns = implode(',', $colAr);

        $this->allJoinedColumns = $this->queryColumns . ",
            bs.name as businessService, ss.name as subsystem,
            c.id as cabinetId, c.name as cabinet,
            l.id as locationId, l.name as location,
            stat.id as statId, stat.name as state
            ";
        $this->allJoinedTables =
            $this->tableName . " t
            left   outer join business_service bs on bs.sysId = t.businessServiceSysId
            left   outer join subsystem ss on ss.sysId = t.subsystemSysId
            left   outer join cabinet c on c.id = t.cabinetId
            left   outer join location l on l.id = c.locationId
            left   outer join asset_state stat on stat.id = t.assetStateId
            ";
        $this->fullJoinedQuery = "
            select " . $this->allJoinedColumns . "
            from   " . $this->allJoinedTables . "
            ";
	}

	/**
	 * @param $id
	 * @return Asset
	 */
	public function getById($id) {
        $sql = $this->fullJoinedQuery . " where  t.id = " . $id . ";";
		$row = $this->sqlQueryRow($sql);
        return $this->_set($row);
	}

	/**
	 * @param $sysId
	 * @return Asset
	 */
	public function getBySysId($sysId) {
        $sql = $this->fullJoinedQuery . " where  t.sysId = '" . $sysId . "';";
		$row =  $this->sqlQueryRow($sql);
        return $this->_set($row);
	}

	/**
	 * @param $name
	 * @return Asset
	 */
	public function getByName($name) {
        $sql = $this->fullJoinedQuery . " where  t.name = '" . $name . "';";
		$row =  $this->sqlQueryRow($sql);
        return $this->_set($row);
	}

    /**
   	 * @param $label
   	 * @return Asset
   	 */
   	public function getByLabel($label)
   	{
        $sql = $this->fullJoinedQuery . " where  t.label = '" . $label . "';";
        $row = $this->sqlQueryRow($sql);
        return $this->_set($row);
    }

    /**
   	 * @param $label
     * @param $location
   	 * @return Asset
   	 */
   	public function getByLabelAndLocation($label, $location)
   	{
        $sql = $this->fullJoinedQuery . " where  t.label = '" . $label . "' and l.name = '" . $location . "';";
        $row = $this->sqlQueryRow($sql);
        return $this->_set($row);
    }

    /**
     * @param  $serialNum
     * @return Asset
     */
    public function getBySerialNumber($serialNum)
    {
        $sql = $this->fullJoinedQuery . " where  t.serialNumber = '{$serialNum}';";
        $row = $this->sqlQueryRow($sql);
        return $this->_set($row);
    }

    /**
   	 * @param        $searchString
   	 * @param string $orderBy
   	 * @param string $dir
   	 * @return Asset[]
   	 */
   	public function getByNameLike($searchString, $orderBy = "name", $dir = "asc") {
        $sql = $this->fullJoinedQuery . " where  t.name like '%{$searchString}%' order by t." . $orderBy . " " . $dir . ";";
   		$result  = $this->sqlQuery($sql);
   		$objects = array();
   		for ($i = 0; $i < count($result); $i++) {
   			$objects[] = $this->_set($result[$i]);
   		}
   		return $objects;
   	}

    /**
     * @param $searchString
     * @param $orderBy
     * @param $dir
     * @return Asset[]
     */
   	public function getInstalledByNameLike($searchString, $orderBy = "name", $dir = "asc")
   	{
        $sql = $this->fullJoinedQuery .
            " where  t.name like '%" . $searchString . "%'" .
            "   and  stat.id <= 3 " .
            " order by t." . $orderBy . " " . $dir . ";";

        $results = $this->sqlQuery($sql);
        $objects = array();
        foreach ($results as $result) {
            $objects[] = $this->_set($result);
        }
        return $objects;
    }

    /**
     * @param $searchString
     * @param $orderBy
     * @param $dir
     * @return Asset[]
     */
   	public function getByLabelLike($searchString, $orderBy = "label", $dir = "asc")
   	{
        $sql = $this->fullJoinedQuery . " where  t.label like '%" . $searchString . "%' order by t." . $orderBy . " " . $dir . ";";
        $results = $this->sqlQuery($sql);
        $objects = array();
        foreach ($results as $result) {
            $objects[] = $this->_set($result);
        }
        return $objects;
    }

    /**
     * @param $searchString
     * @param $orderBy
     * @param $dir
     * @return Asset[]
     */
   	public function getInstalledByLabelLike($searchString, $orderBy = "label", $dir = "asc")
   	{
        $sql = $this->fullJoinedQuery .
            " where  t.label like '%" . $searchString . "%'" .
            "   and  stat.id <= 3 " .
            " order by t." . $orderBy . " " . $dir . ";";
        $results = $this->sqlQuery($sql);
        $objects = array();
        foreach ($results as $result) {
            $objects[] = $this->_set($result);
        }
        return $objects;
    }

	/**
	 * @param        $searchString
	 * @param string $orderBy
	 * @param string $dir
	 * @return Asset[]
	 */
	public function getBySerialNumberLike($searchString, $orderBy = "serialNumber", $dir = "asc")
	{
        $sql = $this->fullJoinedQuery . " where  t.serialNumber like '%{$searchString}%' order by t." . $orderBy . " " . $dir . ";";
		$result  = $this->sqlQuery($sql);
		$objects = array();
		for ($i = 0; $i < count($result); $i++) {
			$objects[] = $this->_set($result[$i]);
		}
		return $objects;
	}

    /**
   	 * @param        $searchString
   	 * @param string $orderBy
   	 * @param string $dir
   	 * @return Asset[]
   	 */
   	public function getInstalledBySerialNumberLike($searchString, $orderBy = "serialNumber", $dir = "asc")
   	{
           $sql = $this->fullJoinedQuery .
               " where  t.serialNumber like '%{$searchString}%'" .
               "   and stat.id <= 3 " .
               " order by t." . $orderBy . " " . $dir . ";";
   		$result  = $this->sqlQuery($sql);
   		$objects = array();
   		for ($i = 0; $i < count($result); $i++) {
   			$objects[] = $this->_set($result[$i]);
   		}
   		return $objects;
   	}

    /**
     * @param string $bsId
     * @param string $orderBy
     * @param string $dir
     * @return Asset[]
     */
    public function getByBusinessServiceId($bsId, $orderBy="name", $dir="asc")
   	{
   		$this->sysLog->debug();
        $sql = "select {$this->queryColumns},
                    c.id as cabinetId, c.name as cabinet
                from   {$this->tableName} t
                left   outer join cabinet c on c.id = t.cabinetId
                where  businessServiceSysId = '{$bsId}'
                order by t." . $orderBy . " " . $dir . ";";
   		$result  = $this->sqlQuery($sql);
   		$objects = array();
   		for ($i = 0; $i < count($result); $i++) {
   			$objects[] = $this->_set($result[$i]);
   		}
   		return $objects;
   	}

    /**
     * @param string $bsId
     * @param string $orderBy
     * @param string $dir
     * @return Asset[]
     */
    public function getInstalledByBusinessServiceId($bsId, $orderBy="name", $dir="asc")
   	{
   		$this->sysLog->debug();
        $sql = "select {$this->queryColumns},
                    c.id as cabinetId, c.name as cabinet
                from   {$this->tableName} t
                left   outer join cabinet c on c.id = t.cabinetId
                where  businessServiceSysId = '{$bsId}'
                  and  t.assetStateId = 1
                order by t." . $orderBy . " " . $dir . ";";
   		$result  = $this->sqlQuery($sql);
   		$objects = array();
   		for ($i = 0; $i < count($result); $i++) {
   			$objects[] = $this->_set($result[$i]);
   		}
   		return $objects;
   	}

    /**
     * @param string $cabinetId
     * @param string $orderBy
     * @param string $dir
     * @return Asset[]
     */
    public function getInstalledByCabinetId($cabinetId, $orderBy="name", $dir="asc")
   	{
   		$this->sysLog->debug();
        $sql = "select {$this->queryColumns},
                    c.id as cabinetId, c.name as cabinet
                from   {$this->tableName} t
                left   outer join cabinet c on c.id = t.cabinetId
                where  cabinetId = {$cabinetId}
                  and  t.assetStateId = 1
                order by t." . $orderBy . " " . $dir . ";";
   		$result  = $this->sqlQuery($sql);
   		$objects = array();
   		for ($i = 0; $i < count($result); $i++) {
   			$objects[] = $this->_set($result[$i]);
   		}
   		return $objects;
   	}

    /**
     * @param string $cabinetId
     * @return int
     */
    public function getNumAssetsByCabinetId($cabinetId)
   	{
   		$this->sysLog->debug();
        $sql = "select count(*) as numAssets
                from   {$this->tableName}
                where  cabinetId = {$cabinetId}
                  and  (assetStateId = 1 or assetStateId = 3);";
   		$result  = $this->sqlQueryRow($sql);
   		return $result->numAssets;
   	}

    /**
     * @param string $orderBy
     * @param string $dir
     * @return Asset[]
     */
    public function getAll($orderBy="name", $dir="asc")
   	{
   		$this->sysLog->debug();
        $sql = $this->fullJoinedQuery . " order by t." . $orderBy . " " . $dir . ";";
   		$result  = $this->sqlQuery($sql);
   		$objects = array();
   		for ($i = 0; $i < count($result); $i++) {
   			$objects[] = $this->_set($result[$i]);
   		}
   		return $objects;
   	}

    /**
     * @param $locationId
     * @param string $orderBy
     * @param string $dir
     * @return Asset[]
     */
    public function getAllByLocationId($locationId, $orderBy="name", $dir="asc")
   	{
   		$this->sysLog->debug();
        $sql = $this->fullJoinedQuery . " where  l.id = {$locationId} order by t." . $orderBy . " " . $dir . ";";
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
     * @return Asset[]
     */
    public function getAllNoSysId($orderBy="name", $dir="asc")
   	{
   		$this->sysLog->debug();
        $sql = $this->fullJoinedQuery . " where  t.sysId is null or t.sysId = '' order by t." . $orderBy . " " . $dir . ";";
   		$result  = $this->sqlQuery($sql);
   		$objects = array();
   		for ($i = 0; $i < count($result); $i++) {
   			$objects[] = $this->_set($result[$i]);
   		}
   		return $objects;
   	}

    /**
     * @param $where
     * @param string $orderBy
     * @param string $dir
     * @return Asset[]
     */
    public function getWhere($where, $orderBy="name", $dir="asc")
   	{
   		$this->sysLog->debug();
        $sql = $this->fullJoinedQuery . " where  " . $where . " order by t." . $orderBy . " " . $dir . ";";
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
     * @param Asset $o
     * @param string $sql
     * @return Asset
     */
    public function create($o, $sql="")
	{
		$this->sysLog->debug();
		$newId = parent::create($o);
        $o->clearChanges();
		return $this->getById($newId);
	}

    /**
     * @param Asset $o
     * @param string $idColumn
     * @param string $sql
     * @return Asset
     */
    public function update($o, $idColumn = "id", $sql = "")
	{
		$this->sysLog->debug();
		$o = parent::update($o);
        $o->clearChanges();
        return $this->getById($o->getId());
	}

    /**
     * @param Asset $o
     * @param string $idColumn
     * @param string $sql
     * @return mixed
     */
    public function delete($o, $idColumn = "id", $sql = "")
	{
		$this->sysLog->debug();
        $o->clearChanges();
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
     * @return array
     */
    public static function getJoinTableColumnNames()
    {
        return self::$joinTableColumnNames;
    }

	/**
	 * @param null $dbRowObj
	 * @return Asset
	 */
	private function _set($dbRowObj = null)
	{
		$this->sysLog->debug();

		$o = new Asset();
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
