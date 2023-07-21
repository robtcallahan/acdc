<?php
/*******************************************************************************
 *
 * $Id: Audit.php 80568 2013-10-30 20:28:34Z rcallaha $
 * $Date: 2013-10-30 16:28:34 -0400 (Wed, 30 Oct 2013) $
 * $Author: rcallaha $
 * $Revision: 80568 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/Audit.php $
 *
 *******************************************************************************
 */

class Audit
{
    protected $id;
    protected $assetId;
    protected $timeStamp;
    protected $userId;

    protected $propertyName;
    protected $oldValue;
    protected $newValue;

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
     * @return mixed
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

    /**
     * @param mixed $newValue
     * @return $this
     */
    public function setNewValue($newValue)
    {
        $this->updateChanges(func_get_arg(0));
        $this->newValue = $newValue;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getNewValue()
    {
        return $this->newValue;
    }

    /**
     * @param mixed $oldValue
     * @return $this
     */
    public function setOldValue($oldValue)
    {
        $this->updateChanges(func_get_arg(0));
        $this->oldValue = $oldValue;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getOldValue()
    {
        return $this->oldValue;
    }

    /**
     * @param mixed $propertyName
     * @return $this
     */
    public function setPropertyName($propertyName)
    {
        $this->updateChanges(func_get_arg(0));
        $this->propertyName = $propertyName;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getPropertyName()
    {
        return $this->propertyName;
    }

    /**
     * @param mixed $timeStamp
     * @return $this
     */
    public function setTimeStamp($timeStamp)
    {
        $this->updateChanges(func_get_arg(0));
        $this->timeStamp = $timeStamp;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getTimeStamp()
    {
        return $this->timeStamp;
    }

    /**
     * @param mixed $userId
     * @return $this
     */
    public function setUserId($userId)
    {
        $this->updateChanges(func_get_arg(0));
        $this->userId = $userId;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getUserId()
    {
        return $this->userId;
    }

}
