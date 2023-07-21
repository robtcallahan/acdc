<?php
/*******************************************************************************
 *
 * $Id: DCIAssetTable.php 81526 2013-11-28 19:27:43Z rcallaha $
 * $Date: 2013-11-28 14:27:43 -0500 (Thu, 28 Nov 2013) $
 * $Author: rcallaha $
 * $Revision: 81526 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/DCIAssetTable.php $
 *
 *******************************************************************************
 */

use STS\DB\DBTable;
use STS\Util\SysLog;

class DCIAssetTable extends DBTable
{
	protected $dbIndex;
	protected $tableName;
	protected $objectClass;

	protected static $nameMapping = array(
		"Hostname"   => "hostName",
		"Asset"      => "assetNumber",
		"Serial"     => "serialNumber",

		"Datacenter" => "location",
		"Location"   => "rack",
		"Elevation"  => "elevation",
		"RU"         => "numberOfRackUnits",

		"Type"       => "environment",
		"Model"      => "model",
		"Alias"      => "alias",
		"Status"     => "status",
		"date"       => "date",
        "lastUpdate" => "lastUpdate"
	);

	public function __construct($idAutoIncremented=false)
	{
		$this->dbIndex = $GLOBALS['config']->dciDB;
		$this->tableName = "DCinventory";
		parent::__construct();

		$this->sysLog->debug();
	}

	/**
	 * @param $hostname
	 * @return DCIAsset
	 */
	public function getByHostname($hostname)
	{
		$this->sysLog->debug("hostname=" . $hostname);
        $sql = "select {$this->getQueryColumnsStr()}
                from   {$this->tableName}
		        where  Hostname = '" . $hostname . "';";
		$row = $this->sqlQueryRow($sql);
		return $this->_set($row);
	}

	/**
	 * @param string $orderBy
	 * @param string $dir
	 * @return DCIAsset[]
	 */
	public function getAll($orderBy = "Hostname", $dir = "asc")
	{
		$this->sysLog->debug();
		$sql     = "select {$this->getQueryColumnsStr()}
                    from   {$this->tableName}
		            order by " . $orderBy . " " . $dir . ";";
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
     * @return DCIAsset[]
     */
    public function getAllCabinets($orderBy = "Hostname", $dir = "asc")
   	{
   		$this->sysLog->debug();
   		$sql     = "select {$this->getQueryColumnsStr()}
                       from   {$this->tableName}
   		            where  Model = 'Cabinet'
   		            order by " . $orderBy . " " . $dir . ";";
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
	 * @return DCIAsset[]
	 */
	public function getAllHashZeroElevationOrZeroRUs($orderBy = "Datacenter, Location, Hostname", $dir = "asc")
	{
		$this->sysLog->debug();
		$sql     = "select lower(Hostname) as Hostname,
		                   asset, upper(Serial) as Serial,
		                   Datacenter, Location, Elevation, RU,
		                   Type, Model, Alias, Status, date, lastUpdate
                    from   {$this->tableName}
                    where  (Datacenter = 'Sterling' or Datacenter like 'Charlotte%')
                      and  (Elevation is null) or (RU in (null, 0))
                      and  Model != 'Cabinet'
		            order by " . $orderBy . " " . $dir . ";";
		$result  = $this->sqlQuery($sql);
		$objects = array();
		for ($i = 0; $i < count($result); $i++) {
			$o = $this->_set($result[$i]);
			$objects[$o->getHostName()] = $o;
		}
		return $objects;
	}

	/**
     * @param $location
	 * @return array
	 */
	public function getAllHashByHostName($location="")
	{
		$this->sysLog->debug();
		$sql     = "select lower(Hostname) as Hostname,
		                   asset, upper(Serial) as Serial,
		                   Datacenter, Location, Elevation, RU,
		                   Type, Model, Alias, Status, date, lastUpdate
                    from   " . $this->tableName . "
		            where  Model != 'Cabinet'\n";
        if ($location) {
            $sql .= "and Datacenter like '" . $location . "%';";
        }
		$result  = $this->sqlQuery($sql);
		$objects = array();
		for ($i = 0; $i < count($result); $i++) {
			$o = $this->_set($result[$i]);
			$objects[$o->getHostName()] = $o;
		}
		return $objects;
	}

    /**
     * @param $location
   	 * @return array
   	 */
   	public function getAllHashByHostNameAndLocation($location)
   	{
   		$this->sysLog->debug();
   		$sql     = "select lower(Hostname) as Hostname,
   		                   asset, upper(Serial) as Serial,
   		                   Datacenter, Location, Elevation, RU,
   		                   Type, Model, Alias, Status, date, lastUpdate
                    from   " . $this->tableName . "
   		            where  Model != 'Cabinet'
   		              and  Datacenter like '%" . $location . "%';";
   		$result  = $this->sqlQuery($sql);
   		$objects = array();
   		for ($i = 0; $i < count($result); $i++) {
   			$o = $this->_set($result[$i]);
   			$objects[$o->getHostName()] = $o;
   		}
   		return $objects;
   	}

	/**
	 * @return array
	 */
	public function getAllHashBySerialNumber()
	{
		$this->sysLog->debug();
		$sql     = "select lower(Hostname) as Hostname,
		                   asset, upper(Serial) as Serial,
		                   Datacenter, Location, Elevation, RU,
		                   Type, Model, Alias, Status, date, lastUpdate
                    from   " . $this->tableName . "
		            where  Model != 'Cabinet';";
		$result  = $this->sqlQuery($sql);
		$objects = array();
		for ($i = 0; $i < count($result); $i++) {
			$o = $this->_set($result[$i]);
			$objects[$o->getSerialNumber()] = $o;
		}
		return $objects;
	}


	// *****************************************************************************
	// * Getters and Setters
	// *****************************************************************************

	/**
	 * @return array
	 */
	public static function getNameMapping()
	{
		return self::$nameMapping;
	}


	/**
	 * @param null $dbRowObj
	 * @return DCIAsset
	 */
	private function _set($dbRowObj = null)
	{
		$this->sysLog->debug();
		$o = new DCIAsset();
		foreach (self::$nameMapping as $dbProp => $modelProp) {
			if ($dbRowObj && property_exists($dbRowObj, $dbProp)) {
				$o->set($modelProp, $dbRowObj->$dbProp);
			}
			else {
				$o->set($modelProp, null);
			}
		}
		return $o;
	}
}
