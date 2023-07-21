<?php
/*******************************************************************************
 *
 * $Id: AssetException.php 79858 2013-10-14 20:13:06Z rcallaha $
 * $Date: 2013-10-14 16:13:06 -0400 (Mon, 14 Oct 2013) $
 * $Author: rcallaha $
 * $Revision: 79858 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/AssetException.php $
 *
 *******************************************************************************
 */

class AssetException
{
    protected $id;
    protected $assetId;
    protected $exceptionType;
    protected $exceptionDetails;

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

    public function getChanges()
    {
        return $this->changes;
    }

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
        if (!array_key_exists($prop, $this->changes)) {
            $this->changes[$prop] = (object)array(
                'originalValue' => $this->$prop,
                'modifiedValue' => $value
            );
        } else {
            $this->changes[$prop]->modifiedValue = $value;
        }
    }

    /**
     * @param mixed $exceptionDetails
     * @return $this
     */
    public function setExceptionDetails($exceptionDetails)
    {
        $this->updateChanges(func_get_arg(0));
        $this->exceptionDetails = $exceptionDetails;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getExceptionDetails()
    {
        return $this->exceptionDetails;
    }

    /**
     * @param mixed $exceptionType
     * @return $this
     */
    public function setExceptionType($exceptionType)
    {
        $this->updateChanges(func_get_arg(0));
        $this->exceptionType = $exceptionType;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getExceptionType()
    {
        return $this->exceptionType;
    }

    /**
     * @param mixed $assetId
     * @return $this
     */
    public function setAssetId($assetId)
    {
        $this->updateChanges(func_get_arg(0));
        $this->assetId = $assetId;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getAssetId()
    {
        return $this->assetId;
    }

    /**
     * @param mixed $id
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

}
