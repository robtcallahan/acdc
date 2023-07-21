<?php

class Text
{
    protected $id;
    protected $locationId;
    protected $string;
    protected $fontFamily;
    protected $fontSize;
    protected $fontWeight;
    protected $color;
    protected $x;
    protected $y;
    protected $rotation;

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
     * @param mixed $fontFamily
     * @return $this
     */
    public function setFontFamily($fontFamily) {
        $this->updateChanges(func_get_arg(0));
        $this->fontFamily = $fontFamily;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getFontFamily() {
        return $this->fontFamily;
    }

    /**
     * @param mixed $fontSize
     * @return $this
     */
    public function setFontSize($fontSize) {
        $this->updateChanges(func_get_arg(0));
        $this->fontSize = $fontSize;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getFontSize() {
        return $this->fontSize;
    }

    /**
     * @param mixed $fontWeight
     * @return $this
     */
    public function setFontWeight($fontWeight) {
        $this->updateChanges(func_get_arg(0));
        $this->fontWeight = $fontWeight;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getFontWeight() {
        return $this->fontWeight;
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
     * @param mixed $string
     * @return $this
     */
    public function setString($string) {
        $this->updateChanges(func_get_arg(0));
        $this->string = $string;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getString() {
        return $this->string;
    }

    /**
     * @param mixed $x
     * @return $this
     */
    public function setX($x) {
        $this->updateChanges(func_get_arg(0));
        $this->x = $x;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getX() {
        return $this->x;
    }

    /**
     * @param mixed $y
     * @return $this
     */
    public function setY($y) {
        $this->updateChanges(func_get_arg(0));
        $this->y = $y;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getY() {
        return $this->y;
    }


}
