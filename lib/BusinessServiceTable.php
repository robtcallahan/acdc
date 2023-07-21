<?php
/*******************************************************************************
 *
 * $Id: BusinessServiceTable.php 82954 2014-02-04 15:46:18Z rcallaha $
 * $Date: 2014-02-04 10:46:18 -0500 (Tue, 04 Feb 2014) $
 * $Author: rcallaha $
 * $Revision: 82954 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/BusinessServiceTable.php $
 *
 *******************************************************************************
 */

use STS\DB\DBTable;

class BusinessServiceTable extends DBTable
{
	protected static $columnNames = array(
        "sysId",
        "name"
	);


	public function __construct($idAutoIncremented=false)
	{
        $this->dbIndex = $GLOBALS['config']->appDB;
        $this->tableName = "business_service";
        $this->idAutoIncremented = $idAutoIncremented;
		parent::__construct();

		$this->sysLog->debug();
	}

    /**
   	 * @param $sysId
   	 * @return BusinessService
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
   	 * @param $name
   	 * @return BusinessService
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
   	 * @param $name
   	 * @return BusinessService[]
   	 */
   	public function getByNameLike($name)
   	{
   		$sql = "select {$this->getQueryColumnsStr()}
   		        from   {$this->tableName}
   		        where  name like '%" . $name . "%';";
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
   	 * @return BusinessService[]
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
     * @param BusinessService $o
     * @param string $sql
     * @return BusinessService
     */
    public function create($o, $sql="")
	{
		$this->sysLog->debug();
        $o->clearChanges();
        $sql = "insert into business_service set name='{$o->getName()}', sysId='{$o->getSysId()}'";
		$newId = parent::create($o, $sql);
		return $this->getBySysId($newId);
	}

    /**
     * @param BusinessService $o
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
     * @param BusinessService $o
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
	 * @return BusinessService
	 */
	private function _set($dbRowObj = null)
	{
		$this->sysLog->debug();

		$o = new BusinessService();
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
