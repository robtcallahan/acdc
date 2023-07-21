<?php
/*******************************************************************************
 *
 * $Id: DCIHistory.php 77193 2013-07-26 17:40:04Z rcallaha $
 * $Date: 2013-07-26 13:40:04 -0400 (Fri, 26 Jul 2013) $
 * $Author: rcallaha $
 * $Revision: 77193 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/DCIHistory.php $
 *
 *******************************************************************************
 */

class DCIHistory
{
	protected $hostName;
	protected $serialNumber;
	protected $model;

	protected $date;
	protected $action;

	protected $location;
	protected $rack;

	public function __toString()
	{
		$return = "";
		foreach (DCIHistoryTable::getNameMapping() as $prop) {
			$return .= sprintf("%-25s => %s\n", $prop, $this->$prop);
		}
		return $return;
	}

	public function toObject()
	{
		$obj = (object) array();
		foreach (DCIHistoryTable::getNameMapping() as $prop) {
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

	public function setAction($action)
	{
		$this->action = $action;
	}

	public function getAction()
	{
		return $this->action;
	}

	public function setDate($date)
	{
		$this->date = $date;
	}

	public function getDate()
	{
		return $this->date;
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

}

