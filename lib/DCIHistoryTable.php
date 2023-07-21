<?php
/*******************************************************************************
 *
 * $Id: DCIHistoryTable.php 77193 2013-07-26 17:40:04Z rcallaha $
 * $Date: 2013-07-26 13:40:04 -0400 (Fri, 26 Jul 2013) $
 * $Author: rcallaha $
 * $Revision: 77193 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/DCIHistoryTable.php $
 *
 *******************************************************************************
 */

use STS\DB\DBTable;
use STS\Util\SysLog;

class DCIHistoryTable extends DBTable
{
	protected $dbIndex;
	protected $tableName;
	protected $objectClass;

	protected static $nameMapping = array(
		"Hostname"   => "hostName",
		"serial"     => "serialNumber",
		"model"      => "model",

		"date"       => "date",
		"action"     => "action",

		"DataCenter" => "location",
		"Rack"       => "rack"
	);

	public function __construct($idAutoIncremented=false)
	{
		$this->dbIndex = $GLOBALS['config']->dciDB;
		$this->tableName = "ServerHistory";
		parent::__construct();

		$this->sysLog->debug();
	}

	/**
	 * @param $hostname
	 * @return DCIHistory
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
	 * @return array
	 */
	public function getDecommissionedHashByHostName()
	{
		$this->sysLog->debug();
		$sql     = "select   date, model, Action, Rack, DataCenter,
		                     upper(serial) as serial,
		                     lower(Hostname) as Hostname
                    from     " . $this->tableName . "
                    where    Action = 'Decommissioned';";
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
	public function getDecommissionedHashBySerialNumber()
	{
		$this->sysLog->debug();
		$sql     = "select   date, model, Action, Rack, DataCenter,
		                     upper(serial) as serial,
		                     lower(Hostname) as Hostname
                    from     " . $this->tableName . "
                    where    Action = 'Decommissioned';";
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
	 * @return DCIHistory
	 */
	private function _set($dbRowObj = null)
	{
		$this->sysLog->debug();
		$o = new DCIHistory();
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
