<?php

class RUReservation
{
	protected $id;
	protected $cabinetId;
    protected $elevation;
    protected $numRUs;
    protected $ruNumbers;
	protected $projectName;
    protected $businessService;
    protected $businessServiceId;
    protected $assetName;
    protected $model;
    protected $serialNumber;
    protected $assetTag;
    protected $reservationDate;
    protected $estimatedInstallDate;

    protected $locationName;
    protected $locationId;
    protected $cabinetName;

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
     * @return mixed
     */
    public function getId() {
        return $this->id;
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
    public function getCabinetId() {
        return $this->cabinetId;
    }

    /**
     * @param mixed $cabinetId
     * @return $this
     */
    public function setCabinetId($cabinetId) {
        $this->updateChanges(func_get_arg(0));
        $this->cabinetId = $cabinetId;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getRuNumbers() {
        return $this->ruNumbers;
    }

    /**
     * @param mixed $ruNumbers
     * @return $this
     */
    public function setRuNumbers($ruNumbers) {
        $this->updateChanges(func_get_arg(0));
        $this->ruNumbers = $ruNumbers;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getProjectName() {
        return $this->projectName;
    }

    /**
     * @param mixed $projectName
     * @return $this
     */
    public function setProjectName($projectName) {
        $this->updateChanges(func_get_arg(0));
        $this->projectName = $projectName;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getNumRUs() {
        return $this->numRUs;
    }

    /**
     * @param mixed $numRUs
     * @return $this
     */
    public function setNumRUs($numRUs) {
        $this->updateChanges(func_get_arg(0));
        $this->numRUs = $numRUs;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getElevation() {
        return $this->elevation;
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
    public function getAssetName() {
        return $this->assetName;
    }

    /**
     * @param mixed $assetName
     * @return $this
     */
    public function setAssetName($assetName) {
        $this->updateChanges(func_get_arg(0));
        $this->assetName = $assetName;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getModel() {
        return $this->model;
    }

    /**
     * @param mixed $model
     * @return $this
     */
    public function setModel($model) {
        $this->updateChanges(func_get_arg(0));
        $this->model = $model;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getSerialNumber() {
        return $this->serialNumber;
    }

    /**
     * @param mixed $serialNumber
     * @return $this
     */
    public function setSerialNumber($serialNumber) {
        $this->updateChanges(func_get_arg(0));
        $this->serialNumber = $serialNumber;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getAssetTag() {
        return $this->assetTag;
    }

    /**
     * @param mixed $assetTag
     * @return $this
     */
    public function setAssetTag($assetTag) {
        $this->updateChanges(func_get_arg(0));
        $this->assetTag = $assetTag;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getBusinessService() {
        return $this->businessService;
    }

    /**
     * @param mixed $businessService
     * @return $this
     */
    public function setBusinessService($businessService) {
        $this->updateChanges(func_get_arg(0));
        $this->businessService = $businessService;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getLocationName() {
        return $this->locationName;
    }

    /**
     * @param mixed $locationName
     * @return $this
     */
    public function setLocationName($locationName) {
        $this->updateChanges(func_get_arg(0));
        $this->locationName = $locationName;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getLocationId() {
        return $this->locationId;
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
    public function getCabinetName() {
        return $this->cabinetName;
    }

    /**
     * @param mixed $cabinetName
     * @return $this
     */
    public function setCabinetName($cabinetName) {
        $this->updateChanges(func_get_arg(0));
        $this->cabinetName = $cabinetName;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getReservationDate() {
        return $this->reservationDate;
    }

    /**
     * @param mixed $reservationDate
     * @return $this
     */
    public function setReservationDate($reservationDate) {
        $this->updateChanges(func_get_arg(0));
        $this->reservationDate = $reservationDate;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getEstimatedInstallDate() {
        return $this->estimatedInstallDate;
    }

    /**
     * @param mixed $estimatedInstallDate
     * @return $this
     */
    public function setEstimatedInstallDate($estimatedInstallDate) {
        $this->updateChanges(func_get_arg(0));
        $this->estimatedInstallDate = $estimatedInstallDate;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getBusinessServiceId() {
        return $this->businessServiceId;
    }

    /**
     * @param mixed $businessServiceId
     * @return $this
     */
    public function setBusinessServiceId($businessServiceId) {
        $this->updateChanges(func_get_arg(0));
        $this->businessServiceId = $businessServiceId;
        return $this;
    }

}
