<?php

class Cabinet
{
	protected $id;
	protected $locationId;
	protected $name;
	protected $cabinetTypeId;
	protected $sysId;
	protected $x;
	protected $y;
    protected $rotation;
    protected $hasPower;

    protected $numAssets;

    /**
     * Keeps track of properties that have their values changed
     *
     * @var array
     */
    protected $changes = array();

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

    /**
     * @param $prop
     * @return mixed
     */
    public function get($prop)
	{
		return $this->$prop;
	}

    /**
     * @param $prop
     * @param $value
     * @return $this
     */
    public function set($prop, $value)
	{
		$this->$prop = $value;
        return $this;
	}

    /**
     * @return array
     */
    public function getChanges()
    {
        return $this->changes;
    }

    /**
     *
     */
    public function clearChanges()
    {
        $this->changes = array();
    }

    /**
     * @param $value
     */
    private function updateChanges($value)
    {
        $trace = debug_backtrace();

        // get the calling method name, eg., setSysId
        $callerMethod = $trace[1]["function"];

        // perform a replace to remove "set" from the method name and change first letter to lowercase
        // so, setSysId becomes sysId. This will be the property name that needs to be added to the changes array
        $prop = preg_replace_callback(
            "/^set(\w)/",
            function ($matches) {
                return strtolower($matches[1]);
            },
            $callerMethod
        );

        // update the changes array to keep track of this properties orig and new values
        if ($this->$prop != $value) {
            if (!array_key_exists($prop, $this->changes)) {
                $this->changes[$prop] = (object)array(
                    'originalValue' => $this->$prop,
                    'modifiedValue' => $value
                );
            } else {
                $this->changes[$prop]->modifiedValue = $value;
            }
        }
    }

    /**
     * @param $cabinetTypeId
     * @return $this
     */
    public function setCabinetTypeId($cabinetTypeId)
	{
        $this->updateChanges(func_get_arg(0));
		$this->cabinetTypeId = $cabinetTypeId;
        return $this;
	}

    /**
     * @return mixed
     */
    public function getCabinetTypeId()
	{
		return $this->cabinetTypeId;
	}

    /**
     * @param $id
     * @return $this
     */
    public function setId($id)
	{
        $this->updateChanges(func_get_arg(0));
		$this->id = $id;
        return $this;
	}

    /**
     * @return mixed
     */
    public function getId()
	{
		return $this->id;
	}

    /**
     * @param $name
     * @return $this
     */
    public function setName($name)
	{
        $this->updateChanges(func_get_arg(0));
		$this->name = $name;
        return $this;
	}

    /**
     * @return mixed
     */
    public function getName()
	{
		return $this->name;
	}

    /**
     * @param $x
     * @return $this
     */
    public function setX($x)
	{
        $this->updateChanges(func_get_arg(0));
		$this->x = $x;
        return $this;
	}

    /**
     * @return mixed
     */
    public function getX()
	{
		return $this->x;
	}

    /**
     * @param $y
     * @return $this
     */
    public function setY($y)
	{
        $this->updateChanges(func_get_arg(0));
		$this->y = $y;
        return $this;
	}

    /**
     * @return mixed
     */
    public function getY()
	{
		return $this->y;
	}

    /**
     * @param $locationId
     * @return $this
     */
    public function setLocationId($locationId)
	{
        $this->updateChanges(func_get_arg(0));
		$this->locationId = $locationId;
        return $this;
	}

    /**
     * @return mixed
     */
    public function getLocationId()
	{
		return $this->locationId;
	}

	/**
	 * @param mixed $sysId
     * @return $this
	 */
	public function setSysId($sysId)
	{
        $this->updateChanges(func_get_arg(0));
		$this->sysId = $sysId;
        return $this;
	}

	/**
	 * @return mixed
	 */
	public function getSysId()
	{
		return $this->sysId;
	}

    /**
     * @param mixed $numAssets
     * @return $this
     */
    public function setNumAssets($numAssets) {
        $this->updateChanges(func_get_arg(0));
        $this->numAssets = $numAssets;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getNumAssets() {
        return $this->numAssets;
    }

    /**
     * @param mixed $rotation
     * @return $this
     */
    public function setRotation($rotation) {
        $this->updateChanges(func_get_arg(0));
        $this->rotation = $rotation;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getRotation() {
        return $this->rotation;
    }

    /**
     * @return mixed
     */
    public function getHasPower() {
        return $this->hasPower;
    }

    /**
     * @param mixed $hasPower
     * @return $this
     */
    public function setHasPower($hasPower) {
        $this->updateChanges(func_get_arg(0));
        $this->hasPower = $hasPower;
        return $this;
    }

}
