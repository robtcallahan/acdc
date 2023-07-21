<?php
/*******************************************************************************
 *
 * $Id: AssetExceptionTable.php 82443 2014-01-03 14:28:19Z rcallaha $
 * $Date: 2014-01-03 09:28:19 -0500 (Fri, 03 Jan 2014) $
 * $Author: rcallaha $
 * $Revision: 82443 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/AssetExceptionTable.php $
 *
 *******************************************************************************
 */

use STS\DB\DBTable;

class AssetExceptionTable extends DBTable
{
    const NOTFOUND = 1;
    const SNMISMISMATCH = 2;
    const MULTIPLEMATCHES = 3;

    public static $exceptionDescriptions = array(
        self::NOTFOUND => "Asset Not Found",
        self::SNMISMISMATCH => "Serial Num Mismatch",
        self::MULTIPLEMATCHES => "Multiple CI Matches"
    );

	protected static $columnNames = array(
        "id",
        "assetId",
        "exceptionType",
        "exceptionDetails"
	);

	public function __construct($idAutoIncremented=true)
	{
        $this->dbIndex = $GLOBALS['config']->appDB;
        $this->tableName = "asset_exception";
        $this->idAutoIncremented = $idAutoIncremented;
		parent::__construct();

		$this->sysLog->debug();
	}

    /**
   	 * @param $id
   	 * @return AssetException
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
   	 * @param $assetId
   	 * @return AssetException
   	 */
   	public function getByAssetId($assetId)
   	{
        $sql = "select {$this->getQueryColumnsStr()}
                from   {$this->tableName}
                where  assetId = " . $assetId . ";";
        $row = $this->sqlQueryRow($sql);
        return $this->_set($row);
    }

    public function getCountsByType()
    {
        $this->sysLog->debug();
        $sql     = "select exceptionType, count(exceptionType) as numRows
                   from   {$this->tableName}
                   group by exceptionType
                   order by exceptionType;";
        return $this->sqlQuery($sql);
    }

    /**
   	 * @return AssetException[]
   	 */
   	public function getAllHashByAssetId()
   	{
   		$this->sysLog->debug();
   		$sql     = "select {$this->getQueryColumnsStr()}
                    from   {$this->tableName};";
   		$result  = $this->sqlQuery($sql);
   		$objects = array();
   		for ($i = 0; $i < count($result); $i++) {
   			$objects[$result[$i]->assetId] = $this->_set($result[$i]);
   		}
   		return $objects;
   	}


	// *******************************************************************************
	// CRUD methods
	// *******************************************************************************

    /**
     * @param AssetException $o
     * @param string $sql
     * @return AssetException
     */
    public function create($o, $sql="")
	{
		$this->sysLog->debug();
        $o->clearChanges();
		$newId = parent::create($o);
		return $this->getById($newId);
	}

    /**
     * @param AssetException $o
     * @param string $idColumn
     * @param string $sql
     * @return AssetException
     */
    public function update($o, $idColumn = "id", $sql = "")
	{
		$this->sysLog->debug();
        $o->clearChanges();
		$o = parent::update($o);
        return $this->getById($o->getId());
	}

    /**
     * @param AssetException $o
     * @param string $idColumn
     * @param string $sql
     * @return AssetException
     */
    public function delete($o, $idColumn = "id", $sql = "")
	{
		$this->sysLog->debug();
        $o->clearChanges();
		return parent::delete($o);
	}

    /**
     * @param AssetException $e
     * @return AssetException
     */
    public function save(AssetException $e)
    {
        $this->sysLog->debug();
        $o = $this->getByAssetId($e->getAssetId());
        if ($o->getId()) {
            $e->setId($o->getId());
            return $this->update($e);
        } else {
            return $this->create($e);
        }
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
	 * @return Asset
	 */
	private function _set($dbRowObj = null)
	{
		$this->sysLog->debug();

		$o = new AssetException();
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
