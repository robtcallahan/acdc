select t.id,t.sysId,t.sysClassName,t.assetClass,t.foundBy,t.cabinetId,t.name,t.label,
      t.deviceType,t.manufacturer,t.model,t.serialNumber,t.assetTag,t.elevation,t.numRUs,
      t.installStatus,t.assetStateId,t.powerStatus,t.businessServiceSysId,t.subsystemSysId,t.lastUpdate,
      bs.name as businessService,
      ss.name as subsystem,
      c.id as cabinetId, c.name as cabinet,
      l.id as locationId, l.name as location,
      stat.name as state
from   asset t
left   outer join business_service bs on bs.sysId = t.businessServiceSysId
left   outer join subsystem ss on ss.sysId = t.subsystemSysId
left   outer join cabinet c on c.id = t.cabinetId
left   outer join location l on l.id = c.locationId
left   outer join asset_state stat on stat.id = t.assetStateId
where  t.label like '%chbkqtl1%'
order by t.label asc;
