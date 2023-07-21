<?php
/*******************************************************************************
 *
 * $Id: SubsystemTable.php 79676 2013-10-08 20:09:32Z rcallaha $
 * $Date: 2013-10-08 16:09:32 -0400 (Tue, 08 Oct 2013) $
 * $Author: rcallaha $
 * $Revision: 79676 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/SubsystemTable.php $
 *
 *******************************************************************************
 */

use STS\DB\DBTable;

class SubsystemTable extends DBTable
{
	protected static $columnNames = array(
        "sysId",
        "name"
	);


	public function __construct($idAutoIncremented=false)
	{
        $this->dbIndex = $GLOBALS['config']->appDB;
        $this->tableName = "subsystem";
        $this->idAutoIncremented = $idAutoIncremented;
		parent::__construct();

		$this->sysLog->debug();
	}

    /**
   	 * @param $sysId
   	 * @return Subsystem
   	 */
   	public function getBySysId($sysId)
   	{
   		$sql = "select {$this->getQueryColumnsStr()}
   		        from   {$this->tableName}
   		        where  sysId = '" . $sysId . "';";
   		$row =  $this->sqlQueryRow($sql);
       return $this->_set($row);
   	}
   
    /**
   	 * @param $bsSysId
   	 * @return Subsystem
   	 */
   	public function getByBusinessServiceSysId($bsSysId)
   	{
   		$sql = "select {$this->getQueryColumnsStr()}
   		        from   {$this->tableName}
   		        where  businessServiceSysId = " . $bsSysId . ";";
   		$row =  $this->sqlQueryRow($sql);
       return $this->_set($row);
   	}

   	/**
   	 * @param $name
   	 * @return Subsystem
   	 */
   	public function getByName($name)
   	{
   		$sql = "select {$this->getQueryColumnsStr()}
   		        from   {$this->tableName}
   		        where  name = '" . $name . "';";
   		$row =  $this->sqlQueryRow($sql);
       return $this->_set($row);
   	}
   
   	/**
   	 * @param string $orderBy
   	 * @param string $dir
   	 * @return Subsystem[]
   	 */
   	public function getAll($orderBy = "name", $dir = "asc")
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


	// *******************************************************************************
	// CRUD methods
	// *******************************************************************************

    /**
     * @param Subsystem $o
     * @param string $sql
     * @return Subsystem
     */
    public function create($o, $sql="")
	{
		$this->sysLog->debug();
        $o->clearChanges();
        $sql = "insert into subsystem set name='{$o->getName()}', sysId='{$o->getSysId()}'";
		$newId = parent::create($o, $sql);
		return $this->getBySysId($newId);
	}

    /**
     * @param Subsystem $o
     * @param string $idColumn
     * @param string $sql
     * @return mixed
     */
    public function update($o, $idColumn = "id", $sql = "")
	{
		$this->sysLog->debug();
        $o->clearChanges();
		return parent::update($o);
	}

    /**
     * @param Subsystem $o
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
	 * @param null $dbRowObj
	 * @return Subsystem
	 */
	private function _set($dbRowObj = null)
	{
		$this->sysLog->debug();

		$o = new Subsystem();
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
