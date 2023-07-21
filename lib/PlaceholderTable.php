<?php

use STS\DB\DBTable;

class PlaceholderTable extends DBTable
{

    protected static $columnNames = array(
        "id",
        "locationId",
        "cabinetTypeId",
        "text",
        "scaleX",
        "scaleY",
        "x",
        "y",
        "tileX",
        "tileY",
        "rotation",
    );


    public function __construct($idAutoIncremented = true)
    {
        $this->dbIndex = $GLOBALS['config']->appDB;
        $this->tableName = "placeholder";
        $this->idAutoIncremented = $idAutoIncremented;
		parent::__construct();

        $this->sysLog->debug();
    }

    /**
     * @param $id
     * @return Placeholder
     */
    public function getById($id)
    {
        $sql = "select {$this->getQueryColumnsStr()}
		        from   {$this->tableName}
		        where  id = " . $id . ";";
        $row = $this->sqlQueryRow($sql);
        return $this->_set($row);
    }

    /**
     * @param string $orderBy
     * @param string $dir
     * @return Placeholder[]
     */
    public function getAll($orderBy="id", $dir="asc")
   	{
   		$this->sysLog->debug();
        $sql = "select {$this->getQueryColumnsStr()}
                from   {$this->tableName}
                order by {$orderBy} {$dir};";
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
     * @return Placeholder[]
     */
    public function getAllByLocationId($locationId, $orderBy="id", $dir="asc")
   	{
   		$this->sysLog->debug();
        $sql = "select {$this->getQueryColumnsStr()}
                from   {$this->tableName}
                where  locationId = {$locationId}
                order by {$orderBy} {$dir};";
   		$result  = $this->sqlQuery($sql);
   		$objects = array();
   		for ($i = 0; $i < count($result); $i++) {
   			$objects[] = $this->_set($result[$i]);
   		}
   		return $objects;
   	}

    /**
     * @param $locationId
     * @param $cabinetTypeId
     * @param string $orderBy
     * @param string $dir
     * @return Placeholder[]
     */
    public function getAllByLocationIdAndCabinetTypeId($locationId, $cabinetTypeId, $orderBy="id", $dir="asc")
   	{
   		$this->sysLog->debug();
        $sql = "select {$this->getQueryColumnsStr()}
                from   {$this->tableName}
                where  locationId = {$locationId}
                  and  cabinetTypeId = {$cabinetTypeId}
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
     * @param Placeholder $o
     * @param string $sql
     * @return Placeholder
     */
    public function create($o, $sql="")
    {
        $this->sysLog->debug();
        $newId = parent::create($o);
        return $this->getById($newId);
    }

    /**
     * @param Placeholder $o
     * @param string $idColumn
     * @param string $sql
     * @return Placeholder
     */
    public function update($o, $idColumn = "id", $sql = "")
    {
        $this->sysLog->debug();
        return parent::update($o);
    }

    /**
     * @param Placeholder $o
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
     * @return Placeholder
     */
    private function _set($dbRowObj = null)
    {
        $this->sysLog->debug();

        $o = new Placeholder();
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
