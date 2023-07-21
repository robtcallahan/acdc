<?php

use STS\DB\DBTable;

class DoorTable extends DBTable
{

    protected static $columnNames = array(
        "id",
        "locationId",
        "centerX",
        "centerY",
        "radius",
        "startAngle",
        "clockwise",
        "color",
        "width",
    );


    public function __construct($idAutoIncremented = true)
    {
        $this->dbIndex = $GLOBALS['config']->appDB;
        $this->tableName = "door";
        $this->idAutoIncremented = $idAutoIncremented;
		parent::__construct();

        $this->sysLog->debug();
    }

    /**
     * @param $id
     * @return Door
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
     * @return Door[]
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
     * @return Door[]
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



    // *******************************************************************************
    // CRUD methods
    // *******************************************************************************

    /**
     * @param Door $o
     * @param string $sql
     * @return Door
     */
    public function create($o, $sql="")
    {
        $this->sysLog->debug();
        $newId = parent::create($o);
        return $this->getById($newId);
    }

    /**
     * @param Door $o
     * @param string $idColumn
     * @param string $sql
     * @return Door
     */
    public function update($o, $idColumn = "id", $sql = "")
    {
        $this->sysLog->debug();
        return parent::update($o);
    }

    /**
     * @param Door $o
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
     * @return Door
     */
    private function _set($dbRowObj = null)
    {
        $this->sysLog->debug();

        $o = new Door();
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
