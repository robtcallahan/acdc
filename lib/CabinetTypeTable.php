<?php
/*******************************************************************************
 *
 * $Id: CabinetTypeTable.php 82443 2014-01-03 14:28:19Z rcallaha $
 * $Date: 2014-01-03 09:28:19 -0500 (Fri, 03 Jan 2014) $
 * $Author: rcallaha $
 * $Revision: 82443 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/CabinetTypeTable.php $
 *
 *******************************************************************************
 */

use STS\DB\DBTable;
use STS\Util\SysLog;

class CabinetTypeTable extends DBTable
{
	protected static $columnNames = array(
		"id",
        "name",
        "type",
        "imageName",
        "width",
        "length",
        "elevation"
	);

	public function __construct($idAutoIncremented=true)
	{
		$this->dbIndex = $GLOBALS['config']->appDB;
		$this->tableName = "cabinet_type";
        $this->idAutoIncremented = $idAutoIncremented;
		parent::__construct();

		$this->sysLog->debug();
	}

	public function getById($id)
	{
		$this->sysLog->debug();
		$sql     = "select {$this->getQueryColumnsStr()}
                    from   {$this->tableName}
		            where  id = {$id};";
		$row = $this->sqlQueryRow($sql);
		return $this->_set($row);
	}

	/**
	 * @param string $orderBy
	 * @param string $dir
	 * @return CabinetType[]
	 */
	public function getAll($orderBy = "name", $dir = "asc")
	{
		$this->sysLog->debug();
		$sql     = "select {$this->getQueryColumnsStr()}
                    from   {$this->tableName}
                    where imageName is not NULL
		            order by {$orderBy} {$dir};";
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
     * @param CabinetType $o
     * @param string $sql
     * @return CabinetType
     */
    public function create($o, $sql="")
	{
		$this->sysLog->debug();
		$newId = parent::create($o);
		return $this->getById($newId);
	}

    /**
     * @param CabinetType $o
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
     * @param CabinetType $o
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
	 * @return CabinetType
	 */
	private function _set($dbRowObj = null)
	{
		$this->sysLog->debug();

		$o = new CabinetType();
		if ($dbRowObj) {
			foreach (self::$columnNames as $prop) {
				$o->set($prop, $dbRowObj->$prop);
			}
		} else {
			foreach (self::$columnNames as $prop) {
				$o->set($prop, null);
			}
		}
		return $o;
	}

}
