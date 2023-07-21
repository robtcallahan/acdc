<?php
/*******************************************************************************
 *
 * $Id: AuditTable.php 82443 2014-01-03 14:28:19Z rcallaha $
 * $Date: 2014-01-03 09:28:19 -0500 (Fri, 03 Jan 2014) $
 * $Author: rcallaha $
 * $Revision: 82443 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/AuditTable.php $
 *
 *******************************************************************************
 */

use STS\DB\DBTable;

class AuditTable extends DBTable
{
    protected static $columnNames = array(
        "id",
        "assetId",
        "timeStamp",
        "userId",
        "propertyName",
        "oldValue",
        "newValue"
    );

    public function __construct($idAutoIncremented = true)
    {
        $this->dbIndex = $GLOBALS['config']->appDB;
        $this->tableName = "audit";
        $this->idAutoIncremented = $idAutoIncremented;
		parent::__construct();

        $this->sysLog->debug();
    }

    /**
     * @param $id
     * @return Audit
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
     * @return Audit[]
     */
    public function getByAssetId($assetId)
    {
        $sql = "select {$this->getQueryColumnsStr()}
   		        from   {$this->tableName}
   		        where  assetId = " . $assetId . "
   		        order by timeStamp, propertyName desc;";
        $result = $this->sqlQuery($sql);
        $objects = array();
        for ($i = 0; $i < count($result); $i++) {
            $objects[] = $this->_set($result[$i]);
        }
        return $objects;
    }

    /**
     * @param $dateFrom
     * @param $dateTo
     * @return Audit[]
     */
    public function getByDate($dateFrom, $dateTo)
    {
        $sql = "select {$this->getQueryColumnsStr()}
		        from   {$this->tableName}
		        where  timeStamp >= '" . $dateFrom . "'
		          and  timeStamp <= '" . $dateTo . "'
		        order  by timeStamp, propertyName asc;";
        $result = $this->sqlQuery($sql);
        $objects = array();
        for ($i = 0; $i < count($result); $i++) {
            $objects[] = $this->_set($result[$i]);
        }
        return $objects;
    }

    /**
     * @param int $assetId
     * @param int $userId
     * @param string $propertyName
     * @param mixed $oldValue
     * @param mixed $newValue
     * @return Audit
     */
    public function createEntry($assetId, $userId, $propertyName, $oldValue, $newValue)
    {
        $audit = new Audit();
        $audit->setAssetId($assetId)
            ->setUserId($userId)
            ->setTimeStamp(date('Y-m-d h:i:s'))
            ->setPropertyName($propertyName)
            ->setOldValue($oldValue)
            ->setNewValue($newValue);
        return $this->create($audit);
    }



    // *******************************************************************************
    // CRUD methods
    // *******************************************************************************

    /**
     * @param Audit $o
     * @param string $sql
     * @return Audit
     */
    public function create($o, $sql="")
    {
        $this->sysLog->debug();
        $newId = parent::create($o);
        return $this->getById($newId);
    }

    /**
     * @param Audit $o
     * @param string $idColumn
     * @param string $sql
     * @return Audit
     */
    public function update($o, $idColumn = "id", $sql = "")
    {
        $this->sysLog->debug();
        return parent::update($o);
    }

    /**
     * @param Audit $o
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
     * @return Audit
     */
    private function _set($dbRowObj = null)
    {
        $this->sysLog->debug();

        $o = new Audit();
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
