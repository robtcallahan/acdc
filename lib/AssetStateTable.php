<?php
/*******************************************************************************
 *
 * $Id: AssetStateTable.php 82443 2014-01-03 14:28:19Z rcallaha $
 * $Date: 2014-01-03 09:28:19 -0500 (Fri, 03 Jan 2014) $
 * $Author: rcallaha $
 * $Revision: 82443 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/AssetStateTable.php $
 *
 *******************************************************************************
 */

use STS\DB\DBTable;

class AssetStateTable extends DBTable
{
	protected static $columnNames = array(
		"id",
        "name"
	);

    protected $queryColumns;

	public function __construct($idAutoIncremented=true)
	{
        $this->dbIndex = $GLOBALS['config']->appDB;
        $this->tableName = "asset_state";
        $this->idAutoIncremented = $idAutoIncremented;
		parent::__construct();

		$this->sysLog->debug();

        $colAr = explode(',', $this->getQueryColumnsStr());
        for ($i=0; $i<count($colAr); $i++) {
            $colAr[$i] = "t." . trim($colAr[$i]);
        }
        $this->queryColumns = implode(',', $colAr);
	}

	/**
	 * @param $id
	 * @return AssetState
	 */
	public function getById($id)
	{
        $sql = "select {$this->queryColumns}
                from   {$this->tableName} t
		        where  t.id = " . $id . ";";
		$row =  $this->sqlQueryRow($sql);
        return $this->_set($row);
	}

	/**
	 * @param $name
	 * @return AssetState
	 */
	public function getByName($name)
	{
        $sql = "select {$this->queryColumns}
                from   {$this->tableName} t
                where  t.name = '" . $name . "';";
		$row =  $this->sqlQueryRow($sql);
        return $this->_set($row);
	}

    /**
     * @param string $orderBy
     * @param string $dir
     * @return AssetState[]
     */
    public function getAll($orderBy="name", $dir="asc")
   	{
   		$this->sysLog->debug();
        $sql = "select {$this->queryColumns}
                from   {$this->tableName} t
                order by t." . $orderBy . " " . $dir . ";";
   		$result  = $this->sqlQuery($sql);
   		$objects = array();
   		for ($i = 0; $i < count($result); $i++) {
   			$objects[] = $this->_set($result[$i]);
   		}
   		return $objects;
   	}

    /**
     * @return array
     */
    public function getHashById()
   	{
   		$this->sysLog->debug();
        $sql = "select {$this->queryColumns}
                from   {$this->tableName} t;";
   		$results  = $this->sqlQuery($sql);
        $hash = array();
        foreach ($results as $r) {
            $hash[$r->id] = $r->name;
        }
   		return $hash;
   	}

    /**
     * @return array
     */
    public function getHashByName()
   	{
   		$this->sysLog->debug();
        $sql = "select {$this->queryColumns}
                from   {$this->tableName} t;";
   		$results  = $this->sqlQuery($sql);
        $hash = array();
        foreach ($results as $r) {
            $hash[$r->name] = $r->id;
        }
   		return $hash;
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
        $sql = "select {$this->queryColumns}
                from   {$this->tableName} t
                where  " . $where . "
                order by t." . $orderBy . " " . $dir . ";";
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
        $o->clearChanges();
		$newId = parent::create($o);
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
        $o->clearChanges();
		$o = parent::update($o);
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
	 * @param null $dbRowObj
	 * @return AssetState
	 */
	private function _set($dbRowObj = null)
	{
		$this->sysLog->debug();

		$o = new AssetState();
		if ($dbRowObj) {
			foreach (self::$columnNames as $prop) {
                if (property_exists($dbRowObj, $prop)) {
    				$o->set($prop, $dbRowObj->$prop);
	    		}
            }
		} else {
			foreach (self::$columnNames as $prop) {
				$o->set($prop, null);
			}
		}
		return $o;
	}
}
