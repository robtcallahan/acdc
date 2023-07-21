<?php
/*******************************************************************************
 *
 * $Id: JobRunTimeTable.php 82443 2014-01-03 14:28:19Z rcallaha $
 * $Date: 2014-01-03 09:28:19 -0500 (Fri, 03 Jan 2014) $
 * $Author: rcallaha $
 * $Revision: 82443 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/JobRunTimeTable.php $
 *
 *******************************************************************************
 */

use STS\DB\DBTable;

class JobRunTimeTable extends DBTable
{
	protected static $columnNames = array(
        "id",
        "jobName",
        "runTime"
	);

	public function __construct($idAutoIncremented=true)
	{
        $this->dbIndex = $GLOBALS['config']->appDB;
        $this->tableName = "job_run_time";
        $this->idAutoIncremented = $idAutoIncremented;
		parent::__construct();

		$this->sysLog->debug();
	}

    /**
   	 * @param $id
   	 * @return JobRunTime
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
   	 * @param $jobName
   	 * @return JobRunTime
   	 */
   	public function getByJobName($jobName)
   	{
        $sql = "select {$this->getQueryColumnsStr()}
                from   {$this->tableName}
                where  jobName = '" . $jobName . "';";
        $row = $this->sqlQueryRow($sql);
        return $this->_set($row);
    }


	// *******************************************************************************
	// CRUD methods
	// *******************************************************************************

    /**
     * @param JobRunTime $o
     * @param string $sql
     * @return JobRunTime
     */
    public function create($o, $sql="")
	{
		$this->sysLog->debug();
        $o->clearChanges();
		$newId = parent::create($o);
		return $this->getById($newId);
	}

    /**
     * @param JobRunTime $o
     * @param string $idColumn
     * @param string $sql
     * @return JobRunTime
     */
    public function update($o, $idColumn = "id", $sql = "")
	{
		$this->sysLog->debug();
        $o->clearChanges();
		$o = parent::update($o);
        return $this->getById($o->getId());
	}

    /**
     * @param JobRunTime $o
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

    /**
     * @param JobRunTime $jrt
     * @return JobRunTime
     */
    public function save(JobRunTime $jrt)
    {
        $this->sysLog->debug();
        $o = $this->getByJobName($jrt->getJobName());
        if ($o->getId()) {
            $jrt->setId($o->getId());
            return $this->update($jrt);
        } else {
            return $this->create($jrt);
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

		$o = new JobRunTime();
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
