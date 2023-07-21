<?php

/** @noinspection PhpUndefinedClassInspection */
class Location
{
	protected $id;
	protected $sysId;
	protected $name;
	protected $street;
	protected $city;
	protected $state;
	protected $zip;

    /**
     * @return string
     */
    public function __toString()
    {
        $return = "";
        foreach (get_class_vars(__CLASS__) as $prop => $x) {
            if (property_exists($this, $prop)) {
                $return .= sprintf("%-25s => %s\n", $prop, $this->$prop);
            }
        }
        return $return;
    }

    /**
     * @return object
     */
    public function toObject()
    {
        $obj = (object)array();
        foreach (get_class_vars(__CLASS__) as $prop => $x) {
            if (property_exists($this, $prop)) {
                $obj->$prop = $this->$prop;
            }
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
		$this->$prop = $value;
        return $this;
	}

	public function setCity($city)
	{
		$this->city = $city;
        return $this;
	}

	public function getCity()
	{
		return $this->city;
	}

	public function setId($id)
	{
		$this->id = $id;
        return $this;
	}

	public function getId()
	{
		return $this->id;
	}

	public function setName($name)
	{
		$this->name = $name;
        return $this;
	}

	public function getName()
	{
		return $this->name;
	}

	public function setState($state)
	{
		$this->state = $state;
        return $this;
	}

	public function getState()
	{
		return $this->state;
	}

	public function setStreet($street)
	{
		$this->street = $street;
        return $this;
	}

	public function getStreet()
	{
		return $this->street;
	}

	public function setZip($zip)
	{
		$this->zip = $zip;
        return $this;
	}

	public function getZip()
	{
		return $this->zip;
	}

	public function setSysId($sysId)
	{
		$this->sysId = $sysId;
        return $this;
	}

	public function getSysId()
	{
		return $this->sysId;
	}

}
