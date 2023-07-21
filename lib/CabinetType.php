<?php
/*******************************************************************************
 *
 * $Id: CabinetType.php 79455 2013-10-01 19:05:29Z rcallaha $
 * $Date: 2013-10-01 15:05:29 -0400 (Tue, 01 Oct 2013) $
 * $Author: rcallaha $
 * $Revision: 79455 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/CabinetType.php $
 *
 *******************************************************************************
 */

class CabinetType
{
	protected $id;
	protected $name;
	protected $type;
	protected $imageName;
	protected $width;
	protected $length;
    protected $elevation;
	
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

	public function get($prop)
	{
		return $this->$prop;
	}

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

	public function setId($id)
	{
        $this->updateChanges(func_get_arg(0));
		$this->id = $id;
        return $this;
	}

	public function getId()
	{
		return $this->id;
	}

	public function setImageName($imageName)
	{
        $this->updateChanges(func_get_arg(0));
		$this->imageName = $imageName;
        return $this;
	}

	public function getImageName()
	{
		return $this->imageName;
	}

	public function setLength($length)
	{
        $this->updateChanges(func_get_arg(0));
		$this->length = $length;
        return $this;
	}

	public function getLength()
	{
		return $this->length;
	}

	public function setName($name)
	{
        $this->updateChanges(func_get_arg(0));
		$this->name = $name;
        return $this;
	}

	public function getName()
	{
		return $this->name;
	}

	public function setType($type)
	{
        $this->updateChanges(func_get_arg(0));
		$this->type = $type;
        return $this;
	}

	public function getType()
	{
		return $this->type;
	}

	public function setWidth($width)
	{
        $this->updateChanges(func_get_arg(0));
		$this->width = $width;
        return $this;
	}

	public function getWidth()
	{
		return $this->width;
	}

    /**
     * @param mixed $elevation
     * @return $this
     */
    public function setElevation($elevation) {
        $this->updateChanges(func_get_arg(0));
        $this->elevation = $elevation;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getElevation() {
        return $this->elevation;
    }

}
