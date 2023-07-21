<?php
/*******************************************************************************
 *
 * $Id: RUTable.php 82443 2014-01-03 14:28:19Z rcallaha $
 * $Date: 2014-01-03 09:28:19 -0500 (Fri, 03 Jan 2014) $
 * $Author: rcallaha $
 * $Revision: 82443 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/RUTable.php $
 *
 *******************************************************************************
 */

use STS\DB\DBTable;

class RUTable extends DBTable
{
    protected static $columnNames = array(
        "id",
        "cabinetId",
        "ruNumber",
        "usable"
    );

    public function __construct($idAutoIncremented = true)
    {
        $this->dbIndex   = $GLOBALS['config']->appDB;
        $this->tableName = "ru";
        $this->idAutoIncremented = $idAutoIncremented;
		parent::__construct();

        $this->sysLog->debug();
    }

    /**
     * @param $id
     * @return RU
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
     * @param $ruNumber
     * @return RU
     */
    public function getByRUNumber($ruNumber)
    {
        $sql = "select {$this->getQueryColumnsStr()}
		        from   {$this->tableName}
		        where  ruNumber = " . $ruNumber . ";";
        $row = $this->sqlQueryRow($sql);
        return $this->_set($row);
    }

    /**
     * @param $cabinetId
     * @return RU[]
     */
    public function getAllByCabinetId($cabinetId)
    {
        $sql = "select {$this->getQueryColumnsStr()}
		        from   {$this->tableName}
		        where  cabinetId = " . $cabinetId . ";";
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
     * @return RU[]
     */
    public function getAll($orderBy = "cabinetId", $dir = "asc")
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
     * @param RU $o
     * @param string $sql
     * @return RU
     */
    public function create($o, $sql = "")
    {
        $this->sysLog->debug();
        $newId = parent::create($o);
        return $this->getById($newId);
    }

    /**
     * @param RU $o
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
     * @param RU $o
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
     * @return RU
     */
    private function _set($dbRowObj = null)
    {
        $this->sysLog->debug();

        $o = new RU();
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
