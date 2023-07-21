<?php
/*******************************************************************************
 *
 * $Id: CabinetTable.php 82443 2014-01-03 14:28:19Z rcallaha $
 * $Date: 2014-01-03 09:28:19 -0500 (Fri, 03 Jan 2014) $
 * $Author: rcallaha $
 * $Revision: 82443 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/CabinetTable.php $
 *
 *******************************************************************************
 */

use STS\DB\DBTable;
use STS\Util\SysLog;

class CabinetTable extends DBTable
{
    protected static $columnNames = array(
        "id",
        "locationId",
        "name",
        "cabinetTypeId",
        "sysId",
        "x",
        "y",
        "rotation",
        "hasPower"
    );

    public function __construct($idAutoIncremented = true)
    {
        $this->dbIndex   = $GLOBALS['config']->appDB;
        $this->tableName = "cabinet";
        $this->idAutoIncremented = $idAutoIncremented;
		parent::__construct();

        $this->sysLog->debug();
    }

    /**
     * @param $id
     * @return Cabinet
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
     * @param $sysId
     * @return Cabinet
     */
    public function getBySysId($sysId)
    {
        $sql = "select {$this->getQueryColumnsStr()}
   		        from   {$this->tableName}
   		        where  sysId = '" . $sysId . "';";
        $row = $this->sqlQueryRow($sql);
        return $this->_set($row);
    }

    /**
     * @param $name
     * @return Cabinet
     */
    public function getByName($name)
    {
        $sql = "select {$this->getQueryColumnsStr()}
		        from   {$this->tableName}
		        where  name = '" . $name . "';";
        $row = $this->sqlQueryRow($sql);
        return $this->_set($row);
    }

    /**
     * @param $name
     * @param $locationId
     * @return Cabinet
     */
    public function getByNameAndLocationId($name, $locationId)
    {
        $sql = "select {$this->getQueryColumnsStr()}
   		        from   {$this->tableName}
   		        where  name = '" . $name . "'
   		          and  locationId = " . $locationId . ";";
        $row = $this->sqlQueryRow($sql);
        return $this->_set($row);
    }

    /**
     * @param $name
     * @param $locationId
     * @return Cabinet
     */
    public function getByNameLikeAndLocationId($name, $locationId)
    {
        $sql = "select {$this->getQueryColumnsStr()}
   		        from   {$this->tableName}
   		        where  name LIKE '" . $name . "%'
   		          and  locationId = " . $locationId . "
                order by name asc;";
        $result  = $this->sqlQuery($sql);
        $objects = array();
        for ($i = 0; $i < count($result); $i++) {
            $objects[] = $this->_set($result[$i]);
        }
        return $objects;
    }

    /**
     * @param int $locationId
     * @param string $orderBy
     * @param string $dir
     * @return Cabinet[]
     */
    public function getAllByLocationId($locationId, $orderBy = "name", $dir = "asc")
    {
        $this->sysLog->debug();
        $sql     = "select   {$this->getQueryColumnsStr()}
                    from     {$this->tableName}
                    where    locationId = {$locationId}
		            order by " . $orderBy . " " . $dir . ";";
        $result  = $this->sqlQuery($sql);
        $objects = array();
        for ($i = 0; $i < count($result); $i++) {
            $objects[] = $this->_set($result[$i]);
        }
        return $objects;
    }

    /**
     * @param int $locationId
     * @param string $orderBy
     * @param string $dir
     * @return Cabinet[]
     */
    public function getAllCabinetsByLocationId($locationId, $orderBy = "name", $dir = "asc")
    {
        $this->sysLog->debug();
        $sql     = "select   {$this->getQueryColumnsStr()}
                    from     {$this->tableName}
                    where    locationId = {$locationId}
                      and    (cabinetTypeId < 16 or cabinetTypeId = 18)
		            order by " . $orderBy . " " . $dir . ";";
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
     * @return Cabinet[]
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
     * @param Cabinet $o
     * @param string $sql
     * @return Cabinet
     */
    public function create($o, $sql = "")
    {
        $this->sysLog->debug();
        $newId = parent::create($o);
        return $this->getById($newId);
    }

    /**
     * @param Cabinet $o
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
     * @param Cabinet $o
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
     * @return Cabinet
     */
    private function _set($dbRowObj = null)
    {
        $this->sysLog->debug();

        $o = new Cabinet();
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
