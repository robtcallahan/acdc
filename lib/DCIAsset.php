<?php
/*******************************************************************************
 *
 * $Id: DCIAsset.php 81526 2013-11-28 19:27:43Z rcallaha $
 * $Date: 2013-11-28 14:27:43 -0500 (Thu, 28 Nov 2013) $
 * $Author: rcallaha $
 * $Revision: 81526 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/DCIAsset.php $
 *
 *******************************************************************************
 */

class DCIAsset
{
	protected $hostName;
	protected $assetNumber;
	protected $serialNumber;

	protected $location;
	protected $rack;
	protected $numberOfRackUnits;
	protected $elevation;
	protected $date;

	protected $model;
	protected $environment;
	protected $status;
	protected $alias;
    protected $lastUpdate;

	public function __toString()
	{
		$return = "";
		foreach (DCIAssetTable::getNameMapping() as $prop) {
			$return .= sprintf("%-25s => %s\n", $prop, $this->$prop);
		}
		return $return;
	}

	public function toObject()
	{
		$obj = (object) array();
		foreach (DCIAssetTable::getNameMapping() as $prop) {
			$obj->$prop = $this->$prop;
		}
		return $obj;
	}

	// *******************************************************************************
	// Getters and Setters
	// *******************************************************************************

	public function get($prop)
	{
		return $this->$prop;
	}

	public function set($prop, $value)
	{
		return $this->$prop = $value;
	}

	public function setAlias($alias)
	{
		$this->alias = $alias;
	}

	public function getAlias()
	{
		return $this->alias;
	}

	public function setAssetNumber($assetNumber)
	{
		$this->assetNumber = $assetNumber;
	}

	public function getAssetNumber()
	{
		return $this->assetNumber;
	}

	public function setDate($date)
	{
		$this->date = $date;
	}

	public function getDate()
	{
		return $this->date;
	}

	public function setElevation($elevation)
	{
		$this->elevation = $elevation;
	}

	public function getElevation()
	{
		return $this->elevation;
	}

	public function setEnvironment($environment)
	{
		$this->environment = $environment;
	}

	public function getEnvironment()
	{
		return $this->environment;
	}

	public function setHostName($hostName)
	{
		$this->hostName = $hostName;
	}

	public function getHostName()
	{
		return $this->hostName;
	}

	public function setLocation($location)
	{
		$this->location = $location;
	}

	public function getLocation()
	{
		return $this->location;
	}

	public function setModel($model)
	{
		$this->model = $model;
	}

	public function getModel()
	{
		return $this->model;
	}

	public function setNumberOfRackUnits($numberOfRackUnits)
	{
		$this->numberOfRackUnits = $numberOfRackUnits;
	}

	public function getNumberOfRackUnits()
	{
		return $this->numberOfRackUnits;
	}

	public function setRack($rack)
	{
		$this->rack = $rack;
	}

	public function getRack()
	{
		return $this->rack;
	}

	public function setSerialNumber($serialNumber)
	{
		$this->serialNumber = $serialNumber;
	}

	public function getSerialNumber()
	{
		return $this->serialNumber;
	}

	public function setStatus($status)
	{
		$this->status = $status;
	}

	public function getStatus()
	{
		return $this->status;
	}

    /**
     * @param mixed $lastUpdate
     * @return $this
     */
    public function setLastUpdate($lastUpdate)
    {
        $this->updateChanges(func_get_arg(0));
        $this->lastUpdate = $lastUpdate;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getLastUpdate()
    {
        return $this->lastUpdate;
    }

}

