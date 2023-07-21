<?php
/*******************************************************************************
 *
 * $Id: ACDC.php 82443 2014-01-03 14:28:19Z rcallaha $
 * $Date: 2014-01-03 09:28:19 -0500 (Fri, 03 Jan 2014) $
 * $Author: rcallaha $
 * $Revision: 82443 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/lib/ACDC.php $
 *
 *******************************************************************************
 */

use STS\DB\MySqlDB;

class ACDC
{
	protected $db;
	protected $dbOld;
		
	public function __construct()
	{
		$configOld = $GLOBALS['config'];
        $config = array();

        $dbIndex = 'acdc';
        $config['dbIndex'] = $dbIndex;
        $config['tableName'] = 'asset';
        $config['idAutoIncremented'] = 0;

        // check for all needed config params
            // config is an object - the "old" way of doing things
            $config['appName'] = property_exists($configOld, 'appName') ? $configOld->appName : $dbIndex;
            $config['logLevel'] = property_exists($configOld, 'logLevel') ? $configOld->logLevel : STS\Util\SysLog::NOTICE;

            if (!property_exists($configOld, 'databases')) throw new \ErrorException("databases category not defined in config");
            if (!property_exists($configOld->databases, $dbIndex)) throw new \ErrorException("{$dbIndex} database not defined in config->databases");
            if (!property_exists($configOld->databases->$dbIndex, 'server')) throw new \ErrorException("server not defined in config->databases->{$dbIndex}");
            if (!property_exists($configOld->databases->$dbIndex, 'type')) throw new \ErrorException("type not defined in config->databases->{$dbIndex}");
            if (!property_exists($configOld->databases->$dbIndex, 'username')) throw new \ErrorException("username not defined in config->databases->{$dbIndex}");
            if (!property_exists($configOld->databases->$dbIndex, 'password')) throw new \ErrorException("password not defined in config->databases->{$dbIndex}");
            if (!property_exists($configOld->databases->$dbIndex, 'database')) throw new \ErrorException("database not defined in config->databases->{$dbIndex}");

            $config['databases'] = array(
                $dbIndex => array(
                    'server' => $configOld->databases->$dbIndex->server,
                    'type'     => $configOld->databases->$dbIndex->type,
                    'username' => $configOld->databases->$dbIndex->username,
                    'password' => $configOld->databases->$dbIndex->password,
                    'database' => $configOld->databases->$dbIndex->database
                )
            );



		$this->db = new MySqlDB($config);
		$this->dciDB = new MySqlDB($config);
	}

	public function getCabinets()
	{
		$sql = "select c.id, c.cabinetTypeId, c.name, c.site, c.location, c.x, c.y,
		               ct.id as ctId, ct.name as ctName, ct.type as ctType, ct.imageName as ctImageName,
		               ct.width as ctWidth, ct.length as ctLength
		        from   cabinet c, cabinet_type ct
		        where  ct.id = c.cabinetTypeId
		        order by c.name;";
        
		$this->db->connect();
        $results = $this->db->getAllObjects($sql);
        $this->db->close();
		return $results;
	}
	
	public function getCabinetAssets($cabinetId)
	{
		$sql = "select a.id, a.sysId, a.sysClassName, a.cabinetId, lower(a.name) as name, a.label, a.manufacturer, a.model,
		               a.serialNumber, a.assetTag, a.elevation, a.numRUs
		        from   cabinet c, cabinet_type ct, asset_state stat, asset a
		        where  c.id = " . $cabinetId . "
		          and  ct.id = c.cabinetTypeId
		          and  a.cabinetId = c.id
		          and  stat.id = a.assetStateId
		          and  (stat.name = 'Installed' or stat.name = 'Decommed On-Tile' or stat.name = 'Inventory')
		        order  by a.name;";
        
		$this->db->connect();
        $results = $this->db->getAllObjects($sql);
        $this->db->close();
		return $results;
	}

    /**
     * @param $cabinetId
     * @return boolean
     */
   	public function cabinetHasExceptions($cabinetId)
   	{
        $sql     = "select   id, name, sysId, sysClassName, elevation, numRUs
                      from   asset
                     where  cabinetId = " . $cabinetId . "
                            and  (sysId is null
                                  or numRUs is null or numRUs = 0
                                  or ((elevation is null or elevation = 0) and numRUs != 44));";
        $this->db->connect();
        $results = $this->db->getAllObjects($sql);
        $this->db->close();
        if (count($results) > 0) {
            return 1;
        } else {
            return 0;
        }
   	}

    public function getCabinetExceptions($cabinetId)
   	{
   		$sql     = "select   id, name, sysId, sysClassName, elevation, numRUs
                      from   asset
                      where  cabinetId = " . $cabinetId . "
                        and  (sysId is null
                              or numRUs is null or numRUs = 0
                              or ((elevation is null or elevation = 0) and numRUs != 44));";
        $this->db->connect();
        $results = $this->db->getAllObjects($sql);
        $this->db->close();
        return $results;
   	}

}

