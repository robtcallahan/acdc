<?php
/*******************************************************************************
 *
 * $Id: ActionTable.php 80341 2013-10-25 14:05:03Z rcallaha $
 * $Date: 2013-10-25 10:05:03 -0400 (Fri, 25 Oct 2013) $
 * $Author: rcallaha $
 * $Revision: 80341 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/ActionTable.php $
 *
 *******************************************************************************
 */

use STS\DB\DBTable;

class ActionTable extends DBTable
{
    const INSTALLED          = 'Installed';
    const IN_TRANSIT         = 'In Transit';
    const REPURPOSED         = 'Repurposed';
    const RELOCATED_ONSITE   = 'Relocated On-Site';
    const RELOCATED_OFFSITE  = 'Relocated Off-Site';
    const INVENTORY          = 'Inventory';
    const DECOMMED_OFFSITE   = 'Decommed Off-Site';
    const AWAITING_DISPOSAL  = 'Awaiting Disposal';
    const DISPOSED           = 'Disposed';


    protected static $columnNames = array(
        "id", 
        "assetId", 
        "sysId", 
        "timeStamp", 
        "userId", 
        "action"
    );


    public function __construct($idAutoIncremented = true)
    {
        $this->dbIndex = $GLOBALS['config']->appDB;
        $this->tableName = "action";
        $this->idAutoIncremented = $idAutoIncremented;
		parent::__construct();

        $this->sysLog->debug();
    }

    /**
     * @param $id
     * @return Action
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
     * @return Action[]
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
     * @param $assetId
     * @return Action[]
     */
    public function getByAssetId($assetId)
    {
        $sql = "select {$this->getQueryColumnsStr()}
   		        from   {$this->tableName}
   		        where  assetId = " . $assetId . "
   		        order by timeStamp desc;";
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
     * @return Action[]
     */
    public function getByDate($dateFrom, $dateTo)
    {
        $sql = "select {$this->getQueryColumnsStr()}
		        from   {$this->tableName}
		        where  timeStamp >= '" . $dateFrom . "'
		          and  timeStamp <= '" . $dateTo . "'
		        order  by timeStamp asc;";
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
     * @param $action
     * @return Action[]
     */
    public function getByDateAndAction($dateFrom, $dateTo, $action)
    {
        $sql = "select {$this->getQueryColumnsStr()}
		        from   {$this->tableName}
		        where  timeStamp >= '" . $dateFrom . "'
		          and  timeStamp <= '" . $dateTo . "'
		          and  action = '" . $action . "'
		        order  by timeStamp asc;";
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
     * @param $actionString
     * @return Action[]
     */
    public function getActionLikeByDate($dateFrom, $dateTo, $actionString)
    {
        $sql = "select {$this->getQueryColumnsStr()}
		        from   {$this->tableName}
		        where  timeStamp >= '" . $dateFrom . "'
		          and  timeStamp <= '" . $dateTo . "'
		          and  action LIKE '" . $actionString . "%'
		        order  by timeStamp asc;";
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
     * @return array
     */
    public function getActionCountsByDate($dateFrom, $dateTo)
    {
        $sql = "select action, count(action) as actionCount
		        from   {$this->tableName}
		        where  timeStamp >= '" . $dateFrom . "'
		          and  timeStamp <= '" . $dateTo . "'
		        group  by action
		        order  by action asc;";
        return $this->sqlQuery($sql);
    }

    /**
     * @param int $assetId
     * @param string $sysId
     * @param int $userId
     * @param mixed $action
     * @return Action
     */
    public function createEntry($assetId, $sysId, $userId, $action)
    {
        $audit = new Action();
        $audit->setAssetId($assetId)
            ->setSysId($sysId)
            ->setTimeStamp(date('Y-m-d h:i:s'))
            ->setUserId($userId)
            ->setAction($action);
        return $this->create($audit);
    }


    // *******************************************************************************
    // CRUD methods
    // *******************************************************************************

    /**
     * @param Action $o
     * @param string $sql
     * @return Action
     */
    public function create($o, $sql="")
    {
        $this->sysLog->debug();
        $newId = parent::create($o);
        return $this->getById($newId);
    }

    /**
     * @param Action $o
     * @param string $idColumn
     * @param string $sql
     * @return Action
     */
    public function update($o, $idColumn = "id", $sql = "")
    {
        $this->sysLog->debug();
        return parent::update($o);
    }

    /**
     * @param Action $o
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
     * @return Action
     */
    private function _set($dbRowObj = null)
    {
        $this->sysLog->debug();

        $o = new Action();
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
