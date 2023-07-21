<?php

use STS\DB\DBTable;

class LocationTable extends DBTable
{
	protected static $columnNames = array(
		"id", "sysId", "name", "street", "city", "state", "zip"
	);

	public function __construct($idAutoIncremented=true)
	{
		$this->dbIndex = $GLOBALS['config']->appDB;
		$this->tableName = "location";
        $this->idAutoIncremented = $idAutoIncremented;
		parent::__construct();

		$this->sysLog->debug();
	}

	/**
	 * @param $id
	 * @return Location
	 */
	public function getById($id)
	{
		$sql = "select {$this->getQueryColumnsStr()}
		        from   {$this->tableName}
		        where  id = " . $id . ";";
		$row =  $this->sqlQueryRow($sql);
        return $this->_set($row);
	}

	/**
	 * @param $name
	 * @return Location
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
	 * @return Location[]
	 */
	public function getByNameLike($name)
	{
		$sql = "select {$this->getQueryColumnsStr()}
		        from   {$this->tableName}
		        where  name LIKE '" . $name . "%';";
		$result  = $this->sqlQuery($sql);
		$objects = array();
		for ($i = 0; $i < count($result); $i++) {
			$objects[] = $this->_set($result[$i]);
		}
		return $objects;
	}

    /**
   	 * @param $sysId
   	 * @return Location
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
	 * @param string $orderBy
	 * @param string $dir
	 * @return Location[]
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

    public function getAllHashById($orderBy = "id", $dir = "asc")
   	{
   		$this->sysLog->debug();
   		$sql     = "select {$this->getQueryColumnsStr()}
                       from   {$this->tableName}
   		            order by " . $orderBy . " " . $dir . ";";
   		$result  = $this->sqlQuery($sql);
   		$objects = array();
   		for ($i = 0; $i < count($result); $i++) {
   			$objects[$result[$i]->id] = $result[$i]->name;
   		}
   		return $objects;
   	}

    public function getAllHashByName($orderBy = "name", $dir = "asc")
   	{
   		$this->sysLog->debug();
   		$sql     = "select {$this->getQueryColumnsStr()}
                       from   {$this->tableName}
   		            order by " . $orderBy . " " . $dir . ";";
   		$result  = $this->sqlQuery($sql);
   		$objects = array();
   		for ($i = 0; $i < count($result); $i++) {
   			$objects[$result[$i]->name] = $result[$i]->id;
   		}
   		return $objects;
   	}


	// *******************************************************************************
	// CRUD methods
	// *******************************************************************************

    /**
     * @param Location $o
     * @param string $sql
     * @return Location
     */
    public function create($o, $sql="")
	{
		$this->sysLog->debug();
		$newId = parent::create($o);
		return $this->getById($newId);
	}

    /**
     * @param Location $o
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
     * @param Location $o
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
	 * @return Location
	 */
	private function _set($dbRowObj = null)
	{
		$this->sysLog->debug();

		$o = new Location();
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
