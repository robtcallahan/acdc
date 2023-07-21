<?php

class Line
{
    protected $id;
    protected $locationId;
    protected $top;
    protected $left;
    protected $width;
    protected $height;
    protected $angle;
    protected $scaleX;
    protected $scaleY;
    protected $x1;
    protected $y1;
    protected $x2;
    protected $y2;
    protected $color;
    protected $thickness;
    protected $cap;
    protected $isDoor;
    protected $opensDirection;
    protected $hingeSide;

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
     * @param mixed $x1
     * @return $this
     */
    public function setX1($x1) {
        $this->updateChanges(func_get_arg(0));
        $this->x1 = $x1;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getX1() {
        return $this->x1;
    }

    /**
     * @param mixed $x2
     * @return $this
     */
    public function setX2($x2) {
        $this->updateChanges(func_get_arg(0));
        $this->x2 = $x2;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getX2() {
        return $this->x2;
    }

    /**
     * @param mixed $y1
     * @return $this
     */
    public function setY1($y1) {
        $this->updateChanges(func_get_arg(0));
        $this->y1 = $y1;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getY1() {
        return $this->y1;
    }

    /**
     * @param mixed $y2
     * @return $this
     */
    public function setY2($y2) {
        $this->updateChanges(func_get_arg(0));
        $this->y2 = $y2;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getY2() {
        return $this->y2;
    }

    /**
     * @param mixed $cap
     * @return $this
     */
    public function setCap($cap) {
        $this->updateChanges(func_get_arg(0));
        $this->cap = $cap;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getCap() {
        return $this->cap;
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
     * @param mixed $isDoor
     * @return $this
     */
    public function setIsDoor($isDoor) {
        $this->updateChanges(func_get_arg(0));
        $this->isDoor = $isDoor;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getIsDoor() {
        return $this->isDoor;
    }

    /**
     * @param mixed $hingeSide
     * @return $this
     */
    public function setHingeSide($hingeSide) {
        $this->updateChanges(func_get_arg(0));
        $this->hingeSide = $hingeSide;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getHingeSide() {
        return $this->hingeSide;
    }

    /**
     * @param mixed $opensDirection
     * @return $this
     */
    public function setOpensDirection($opensDirection) {
        $this->updateChanges(func_get_arg(0));
        $this->opensDirection = $opensDirection;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getOpensDirection() {
        return $this->opensDirection;
    }

    /**
     * @return mixed
     */
    public function getTop() {
        return $this->top;
    }

    /**
     * @param mixed $top
     * @return $this
     */
    public function setTop($top) {
        $this->updateChanges(func_get_arg(0));
        $this->top = $top;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getLeft() {
        return $this->left;
    }

    /**
     * @param mixed $left
     * @return $this
     */
    public function setLeft($left) {
        $this->updateChanges(func_get_arg(0));
        $this->left = $left;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getHeight() {
        return $this->height;
    }

    /**
     * @param mixed $height
     * @return $this
     */
    public function setHeight($height) {
        $this->updateChanges(func_get_arg(0));
        $this->height = $height;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getThickness() {
        return $this->thickness;
    }

    /**
     * @param mixed $thickness
     * @return $this
     */
    public function setThickness($thickness) {
        $this->updateChanges(func_get_arg(0));
        $this->thickness = $thickness;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getScaleX() {
        return $this->scaleX;
    }

    /**
     * @param mixed $scaleX
     * @return $this
     */
    public function setScaleX($scaleX) {
        $this->updateChanges(func_get_arg(0));
        $this->scaleX = $scaleX;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getScaleY() {
        return $this->scaleY;
    }

    /**
     * @param mixed $scaleY
     * @return $this
     */
    public function setScaleY($scaleY) {
        $this->updateChanges(func_get_arg(0));
        $this->scaleY = $scaleY;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getAngle() {
        return $this->angle;
    }

    /**
     * @param mixed $angle
     * @return $this
     */
    public function setAngle($angle) {
        $this->updateChanges(func_get_arg(0));
        $this->angle = $angle;
        return $this;
    }


}
