<?php

class Door
{
    protected $id;
    protected $locationId;
    protected $centerX;
    protected $centerY;
    protected $radius;
    protected $startAngle;
    protected $clockwise;
    protected $color;
    protected $width;

    protected $changes = array();

    /**
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
     * @param mixed $color
     * @return $this
     */
    public function setColor($color) {
        $this->updateChanges(func_get_arg(0));
        $this->color = $color;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getColor() {
        return $this->color;
    }

    /**
     * @param mixed $centerX
     * @return $this
     */
    public function setCenterX($centerX) {
        $this->updateChanges(func_get_arg(0));
        $this->centerX = $centerX;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getCenterX() {
        return $this->centerX;
    }

    /**
     * @param mixed $centerY
     * @return $this
     */
    public function setCenterY($centerY) {
        $this->updateChanges(func_get_arg(0));
        $this->centerY = $centerY;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getCenterY() {
        return $this->centerY;
    }

    /**
     * @param mixed $clockwise
     * @return $this
     */
    public function setClockwise($clockwise) {
        $this->updateChanges(func_get_arg(0));
        $this->clockwise = $clockwise;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getClockwise() {
        return $this->clockwise;
    }

    /**
     * @param mixed $id
     * @return $this
     */
    public function setId($id) {
        $this->updateChanges(func_get_arg(0));
        $this->id = $id;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getId() {
        return $this->id;
    }

    /**
     * @param mixed $locationId
     * @return $this
     */
    public function setLocationId($locationId) {
        $this->updateChanges(func_get_arg(0));
        $this->locationId = $locationId;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getLocationId() {
        return $this->locationId;
    }

    /**
     * @param mixed $radius
     * @return $this
     */
    public function setRadius($radius) {
        $this->updateChanges(func_get_arg(0));
        $this->radius = $radius;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getRadius() {
        return $this->radius;
    }

    /**
     * @param mixed $startAngle
     * @return $this
     */
    public function setStartAngle($startAngle) {
        $this->updateChanges(func_get_arg(0));
        $this->startAngle = $startAngle;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getStartAngle() {
        return $this->startAngle;
    }

    /**
     * @param mixed $width
     * @return $this
     */
    public function setWidth($width) {
        $this->updateChanges(func_get_arg(0));
        $this->width = $width;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getWidth() {
        return $this->width;
    }

    /**
     * @param mixed $id
     * @return $this
     */

}
