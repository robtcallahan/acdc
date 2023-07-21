-- MySQL dump 10.13  Distrib 5.5.33, for osx10.6 (i386)
--
-- Host: localhost    Database: acdc
-- ------------------------------------------------------
-- Server version	5.5.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `acdc`
--

/*!40000 DROP DATABASE IF EXISTS `acdc`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `acdc` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci */;

USE `acdc`;

--
-- Table structure for table `action`
--

DROP TABLE IF EXISTS `action`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `action` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `assetId` int(10) DEFAULT NULL,
  `sysId` varchar(33) COLLATE utf8_unicode_ci NOT NULL,
  `timeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `userId` int(10) NOT NULL,
  `action` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `assetId_idx` (`assetId`),
  KEY `userId_idx` (`userId`),
  CONSTRAINT `action_assetId_fk` FOREIGN KEY (`assetId`) REFERENCES `asset` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `action_userId_fk` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `action`
--

LOCK TABLES `action` WRITE;
/*!40000 ALTER TABLE `action` DISABLE KEYS */;
/*!40000 ALTER TABLE `action` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset`
--

DROP TABLE IF EXISTS `asset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asset` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `sysId` varchar(33) COLLATE utf8_unicode_ci DEFAULT NULL,
  `sysClassName` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  `assetClass` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `foundBy` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `cabinetId` int(10) DEFAULT NULL,
  `name` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `label` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `deviceType` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `manufacturer` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL,
  `model` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `serialNumber` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `assetTag` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `elevation` int(5) DEFAULT NULL,
  `numRUs` decimal(5,1) NOT NULL DEFAULT '0.0',
  `installStatus` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  `assetStateId` int(2) NOT NULL DEFAULT '1',
  `powerStatus` enum('ON','OFF') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'ON',
  `businessServiceSysId` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
  `subsystemSysId` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
  `lastUpdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sysId` (`sysId`),
  KEY `cabinetId` (`cabinetId`),
  KEY `bs_index` (`businessServiceSysId`),
  KEY `ss_index` (`subsystemSysId`),
  KEY `assetStatusId_idx` (`assetStateId`),
  CONSTRAINT `asset_assetStateId_fk` FOREIGN KEY (`assetStateId`) REFERENCES `asset_state` (`id`),
  CONSTRAINT `asset_businessService_fk` FOREIGN KEY (`businessServiceSysId`) REFERENCES `business_service` (`sysId`),
  CONSTRAINT `asset_cabinetId_fk` FOREIGN KEY (`cabinetId`) REFERENCES `cabinet` (`id`),
  CONSTRAINT `asset_subsystem_fk` FOREIGN KEY (`subsystemSysId`) REFERENCES `subsystem` (`sysId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset`
--

LOCK TABLES `asset` WRITE;
/*!40000 ALTER TABLE `asset` DISABLE KEYS */;
/*!40000 ALTER TABLE `asset` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_exception`
--

DROP TABLE IF EXISTS `asset_exception`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asset_exception` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `assetId` int(10) NOT NULL,
  `exceptionType` int(5) NOT NULL,
  `exceptionDetails` varchar(1000) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `assetId_idx` (`assetId`),
  CONSTRAINT `asset_exception_assetId_fk` FOREIGN KEY (`assetId`) REFERENCES `asset` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_exception`
--

LOCK TABLES `asset_exception` WRITE;
/*!40000 ALTER TABLE `asset_exception` DISABLE KEYS */;
/*!40000 ALTER TABLE `asset_exception` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_state`
--

DROP TABLE IF EXISTS `asset_state`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asset_state` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_state`
--

LOCK TABLES `asset_state` WRITE;
/*!40000 ALTER TABLE `asset_state` DISABLE KEYS */;
INSERT INTO `asset_state` (`id`, `name`) VALUES (1,'Installed'),(2,'In Transit'),(3,'Decommed On-Tile'),(4,'Decommed Off-Tile'),(5,'Decommed Off-Site'),(6,'Awaiting Disposal'),(7,'Disposed');
/*!40000 ALTER TABLE `asset_state` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit`
--

DROP TABLE IF EXISTS `audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `assetId` int(10) DEFAULT NULL,
  `timeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `userId` int(10) NOT NULL,
  `propertyName` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `oldValue` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `newValue` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `assetId_idx` (`assetId`),
  KEY `userId_idx` (`userId`),
  CONSTRAINT `audit_assetId_fk` FOREIGN KEY (`assetId`) REFERENCES `asset` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `audit_userId_fk` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit`
--

LOCK TABLES `audit` WRITE;
/*!40000 ALTER TABLE `audit` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_service`
--

DROP TABLE IF EXISTS `business_service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `business_service` (
  `sysId` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`sysId`),
  UNIQUE KEY `name_index` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_service`
--

LOCK TABLES `business_service` WRITE;
/*!40000 ALTER TABLE `business_service` DISABLE KEYS */;
INSERT INTO `business_service` (`sysId`, `name`) VALUES ('b99cc3b10a0a3cac001b91611e61d8a5','CARE'),('b99cc3cf0a0a3cac00be992f12663533','Data Center'),('b99cc3d60a0a3cac017fe3e56ed8fb58','Data Services'),('b99cc4bf0a0a3cac00c3e4408cd2707d','Database - Shared'),('b99cc3e10a0a3cac00662bac6a0fd2fa','DDOS Tools'),('b99cc3ee0a0a3cac00f0ec175cb5e2de','Enterprise Financial'),('b99cc3f80a0a3cac0170273cc8e9178c','Enterprise Infrastructure'),('b99cc3fe0a0a3cac016c72a28e0a5533','ENUM'),('20f3816e0a0a3cab0081f24f3b5b4c74','Generic PKI/CA'),('b99cc4100a0a3cac0174d9c8be29f6ba','InfoSec'),('f76b22c40a0a3cac00c62b83e0a552f2','LSMS'),('b99cc41e0a0a3cac0011e0039d74f9eb','Microsoft Systems'),('b99cc4240a0a3cac012c4ead3607d263','Mobile Cloud'),('b99cc42f0a0a3cac0091369d4049da22','NAS/NANPA'),('b99cc4b80a0a3cac01ac85616c2451f1','Network - Shared'),('b99cc4dd0a0a3cac00c1ae4f010410fa','Network Operations Center'),('550385b410a9e084bba92981f5cb89f1','NeuStar-Labs'),('75bde76a10f8a004bba92981f5cb8952','NIS (UNIX)'),('b99cc44c0a0a3cac007ba60dbd965bec','NMS'),('b99cc4520a0a3cac01230445a15a7d7f','NPAC'),('9c1486fb10b0e404bba92981f5cb891f','NPAC - Brazil'),('365744b08df1c9042bd59db7ec75d37d','NPAC - Dev/QA/PMT'),('88d63258c16cf040a211e4fd9cb13b35','NPAC Storage (US & CA)'),('b99cc4580a0a3cac00707b8158d2203f','OMS'),('68bbcfc4341bbc007fa2c3d12d79c82f','OMS-Adapter'),('ecbbcfc4341bbc007fa2c3d12d79c830','OMS-ASR'),('24bbcfc4341bbc007fa2c3d12d79c832','OMS-ESR'),('a0bbcfc4341bbc007fa2c3d12d79c833','OMS-IMM'),('acbbcfc4341bbc007fa2c3d12d79c834','OMS-Report'),('64bbcfc4341bbc007fa2c3d12d79c835','OMS-SOA'),('af3a11b38d7c49402bd59db7ec75d367','Operations Chassis'),('3d9ea77e51af8d00ad508a2cc67a1ba6','Operations Hypervisors'),('c9896c6c8d414d402bd59db7ec75d336','Operations Management Servers'),('b99cc45f0a0a3cac00704385a726d0b9','PAS'),('4266df4d0a0a3cab00e8a40fc9b10438','Pathfinder'),('53c23d477bea1c80bba99ff39b4d4d85','Peoplesoft FIN'),('b99cc4650a0a3cac00aa52f2127078e2','PORT - PS'),('50b14dc811f1f0007fa2908b78101bf1','Private Cloud'),('b99cc4760a0a3cac012c71142cbc7083','Registry'),('426616a60a0a3cab00f50e003b04984e','RMS'),('42671c460a0a3cab000d3643b3f26f14','SIP-IX'),('427351ce0a0a3cab009ee08abcc2a6b8','Site Protect'),('b99cc47c0a0a3cac00066f9e11d5d737','Storage - Corporate'),('b99cc3bd0a0a3cac00cf9398ddb05b21','Storage - Offline'),('86be2a8730bcb4807fa228ae87abc007','Storage - Ultra'),('b99cc4c50a0a3cac012e864fe7e57491','Systems - Shared'),('b99cc4980a0a3cac01f987fe7d3b89eb','Telecom'),('b99cc49f0a0a3cac000d7260ddfb85a9','UltraDNS'),('0115e4d00a0a3cab0102840616a4dbed','UltraDNS-EDNS'),('0116f8ef0a0a3cab019e0520c6cfa8df','UltraDNS-Shared Services'),('b99cc3e80a0a3cac0164441a9d01140a','UltraViolet'),('b99cc4ac0a0a3cac003ab9022d01ca15','Web Services'),('b99cc4b20a0a3cac00a68ffbaee9fd2b','Webmetrics'),('42677e770a0a3cab011393dc0ee763fb','WMRS');
/*!40000 ALTER TABLE `business_service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cabinet`
--

DROP TABLE IF EXISTS `cabinet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cabinet` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `locationId` int(4) NOT NULL,
  `name` varchar(16) COLLATE utf8_unicode_ci NOT NULL,
  `cabinetTypeId` int(10) NOT NULL,
  `sysId` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
  `x` int(10) NOT NULL,
  `y` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cabinet_cabinetTypeId_fk` (`cabinetTypeId`),
  KEY `location_id_idx` (`locationId`),
  CONSTRAINT `cabinet_cabinetTypeId_fk` FOREIGN KEY (`cabinetTypeId`) REFERENCES `cabinet_type` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cabinet_locationId_fk` FOREIGN KEY (`locationId`) REFERENCES `location` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=563 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cabinet`
--

LOCK TABLES `cabinet` WRITE;
/*!40000 ALTER TABLE `cabinet` DISABLE KEYS */;
INSERT INTO `cabinet` (`id`, `locationId`, `name`, `cabinetTypeId`, `sysId`, `x`, `y`) VALUES (1,1,'A01',1,'1699a1e551505504ad508a2cc67a1b6d',144,72),(2,1,'A02',1,'4c2eef4c0a0a3cab01fcdfa9588bebf1',168,72),(3,1,'A03',12,'4c2eef4f0a0a3cab0077313273a0f325',192,72),(4,1,'A04',12,'4c2eef520a0a3cab0140b158698bcd0e',222,72),(5,1,'A05',12,'384214ca1081ac04bba92981f5cb8959',252,72),(7,1,'A07',13,'4c2eef610a0a3cab01924501004d30c7',282,72),(8,1,'A08',1,'4c2eef640a0a3cab00d2bc68e7d12335',312,72),(9,1,'A09',1,'3c4214ca1081ac04bba92981f5cb895a',336,72),(15,1,'A27',1,'4c2eef870a0a3cab019dceb12d5602ed',768,72),(16,1,'A28',1,'054214ca1081ac04bba92981f5cb895d',792,72),(17,1,'A29',1,'494214ca1081ac04bba92981f5cb895d',816,72),(18,1,'A30',1,'4c2eef900a0a3cab005f48f407351d63',840,72),(19,1,'A31',1,'4c2eef930a0a3cab00a3d9fb1adb630e',864,72),(20,1,'A32',1,'4c2eef960a0a3cab0078e473b057231c',888,72),(21,1,'B01',2,'4c2eef9c0a0a3cab01d9b5efd0718c99',144,144),(22,1,'B02',2,'4c2eef9f0a0a3cab002ba853da54727a',168,144),(23,1,'B03',1,'0d4214ca1081ac04bba92981f5cb895f',192,144),(24,1,'B04',12,'414214ca1081ac04bba92981f5cb8960',216,144),(25,1,'B05',1,'e699a1e551505504ad508a2cc67a1b6e',240,144),(26,1,'B06',1,'4c2eefab0a0a3cab0044e0ba66805182',264,144),(27,1,'B07',1,'db01833b108de044bba92981f5cb8950',288,144),(28,1,'B08',2,'4c2eefb10a0a3cab009eb76cedea917e',312,144),(29,1,'B09',2,'4c2eefa80a0a3cab000c5ba741bb5ae1',336,144),(30,1,'B22',2,'4c2eefba0a0a3cab012b08d280c954d4',648,144),(31,1,'B23',2,'4c2eefbd0a0a3cab01ad71ed37a6c2f7',672,144),(32,1,'B24',2,'4c2eefc10a0a3cab011ba290cdd2e793',696,144),(33,1,'B25',1,'4347e527346ac504ad5022d9dd0831c1',720,144),(34,1,'B26',1,'4c2eefc90a0a3cab015bb546bd875f9f',744,144),(35,1,'B27',1,'4c2eefcd0a0a3cab00f8179e9ebf3177',768,144),(36,1,'B28',1,'4c2eefd40a0a3cab01473a6aa452dae3',792,144),(37,1,'B29',1,'4c2eefd70a0a3cab00ef156a5408c824',816,144),(38,1,'B30',1,'4c2eefda0a0a3cab00f188d596a18838',840,144),(39,1,'B31',1,'4c2eefdd0a0a3cab015d952636cd5edb',864,144),(40,1,'B32',1,'4c2eefe10a0a3cab01ec45a55246b7ca',888,144),(41,1,'C01',1,'4c2eefef0a0a3cab018be81f543ae625',144,216),(43,1,'C03',1,'454214ca1081ac04bba92981f5cb8966',192,216),(44,1,'C04',1,'4c2ef0060a0a3cab006874615ab48946',216,216),(45,1,'C05',1,'4c2ef0090a0a3cab00feffbf99fe0066',240,216),(46,1,'C06',1,'054214ca1081ac04bba92981f5cb8967',264,216),(47,1,'C07',1,'4c2ef00f0a0a3cab007394ab0ab25021',288,216),(48,1,'C08',11,'4c2ef0150a0a3cab003ce918826d9838',312,216),(49,1,'C09',11,'4c2ef0120a0a3cab009d662deca1da1c',336,216),(50,1,'C22',1,'4c2ef01c0a0a3cab00c088bc90b29adf',648,216),(51,1,'C23',1,'aa99a1e551505504ad508a2cc67a1b6f',672,216),(52,1,'C24',1,'4c2ef0210a0a3cab01b84c648539ebff',696,216),(53,1,'C25',1,'0d4214ca1081ac04bba92981f5cb8969',720,216),(54,1,'C26',1,'414214ca1081ac04bba92981f5cb896a',744,216),(55,1,'C27',1,'4c2ef02d0a0a3cab01d1d12cfdaaea9d',768,216),(56,1,'C28',1,'4c2ef02a0a0a3cab00527f406aa861f5',792,216),(57,1,'C29',1,'4c2ef0300a0a3cab012269e5d5ae5f60',816,216),(58,1,'C30',1,'4c2ef0340a0a3cab0129199a28482fc3',840,216),(59,1,'C31',1,'4c2ef0370a0a3cab018ac20d46bb0305',864,216),(60,1,'C32',1,'4c2ef03a0a0a3cab010ab6149291fbf8',888,216),(62,1,'D01',1,'054214ca1081ac04bba92981f5cb896c',144,288),(63,1,'D02',1,'494214ca1081ac04bba92981f5cb896c',168,288),(64,1,'D03',1,'4c2ef04c0a0a3cab00035cc9d792d26f',192,288),(65,1,'D04',1,'4c2ef0490a0a3cab008d17bbdc1c23bc',216,288),(66,1,'D05',1,'094214ca1081ac04bba92981f5cb896d',240,288),(67,1,'D06',1,'6e99a1e551505504ad508a2cc67a1b70',264,288),(68,1,'D07',1,'4c2ef0580a0a3cab00883b21725ad563',288,288),(69,1,'D08',1,'4c2ef05c0a0a3cab006876a2d98889c9',312,288),(71,1,'D09',1,'4c2ef0600a0a3cab0051a1f450077bdd',336,288),(80,1,'A23',1,'4c2eef7d0a0a3cab01bd4821e8e84ca5',672,72),(81,1,'A22',2,'4c2eef7a0a0a3cab01e50de1586e31ac',648,72),(82,1,'A24',1,'304214ca1081ac04bba92981f5cb895c',696,72),(83,1,'A26',1,'4c2eef840a0a3cab014f48fdc4a8a17d',744,72),(84,1,'A25',1,'454214ca1081ac04bba92981f5cb895c',720,72),(130,1,'F12',1,'4c2ef1130a0a3cab00695e19db9d1b2d',408,432),(133,1,'F27',15,'4c2ef13b0a0a3cab01d54ad4714baefd',768,432),(134,1,'F31',15,'4c2ef14b0a0a3cab00f4440e591ec8a6',864,432),(135,1,'F30',15,'4c2ef1470a0a3cab015e05e43bbaa017',840,432),(136,1,'G25',1,'4c2ef19b0a0a3cab009703dbb06452d9',720,504),(137,1,'F03',1,'4c2ef0e40a0a3cab015a163028a2e241',192,432),(138,1,'E07',1,'4c2ef0820a0a3cab017246b797f35509',288,360),(139,1,'F07',1,'4c2ef0eb0a0a3cab019697572f96e9fc',288,432),(140,1,'E03',1,'4c2ef0740a0a3cab01c376c6cc2b6b5b',192,360),(141,1,'E02',1,'4c2ef0710a0a3cab01493eeea33a231c',168,360),(142,1,'K20',3,'0c15cffb108de044bba92981f5cb8960',600,720),(143,1,'E04',1,'4c2ef0780a0a3cab019b2bc58bb61655',216,360),(144,1,'E05',1,'4c2ef07b0a0a3cab00e66c7236815e4b',240,360),(145,1,'E01',1,'4c2ef06e0a0a3cab002fd46b0d62b7cc',144,360),(146,1,'E06',1,'4c2ef07f0a0a3cab01e2a9885bf71d74',264,360),(147,1,'F09',1,'4c2ef1160a0a3cab0001ecd8ac3f0b1b',336,432),(148,1,'F08',1,'4c2ef10f0a0a3cab01061e9419302272',312,432),(149,1,'J29',1,'4c2ef2480a0a3cab01f4b43f54ecc376',816,648),(150,1,'J31',1,'4c2ef24f0a0a3cab01bd87c20c7eb91a',864,648),(152,1,'G29',2,'4c2ef1a50a0a3cab0078964a3dff0316',816,504),(153,1,'J21',2,'4c2ef22a0a0a3cab01db4b5aca8a3a8d',624,648),(154,1,'H03',1,'4c2ef1b70a0a3cab0118a11220fb6123',192,576),(155,1,'H27',1,'4c2ef1f30a0a3cab00595d0197cf3188',768,576),(156,1,'H26',1,'4c2ef1f00a0a3cab015416af64a9d00a',744,576),(157,1,'H25',1,'4c2ef1ec0a0a3cab00e520580ada4a4d',720,576),(158,1,'E29',1,'4c2ef0c50a0a3cab00785272db556a2f',816,360),(159,1,'H02',1,'4c2ef1b30a0a3cab00d2867aca44f687',168,576),(160,1,'G27',15,'4c2ef19e0a0a3cab00f2dfb0bce28833',768,504),(161,1,'J26',1,'4c2ef23e0a0a3cab012e1611bcd808c0',744,648),(162,1,'J24',1,'4c2ef2370a0a3cab00f1a3ddefced8b8',696,648),(163,1,'J25',1,'4c2ef23a0a0a3cab01c9dca73d26fcb5',720,648),(164,1,'G24',1,'4c2ef1970a0a3cab00ba7fa7b48b8ad9',696,504),(165,1,'J23',1,'4c2ef2340a0a3cab0153b0f0e6ee3b4b',672,648),(166,1,'L22',1,'4c2ef4470a0a3cab01e95fc2fe550bbd',648,792),(167,1,'F23',15,'4c2ef12d0a0a3cab017a0344e5eb6ec4',672,432),(168,1,'E23',1,'4c2ef0ae0a0a3cab01a5de94b4fde212',672,360),(169,1,'G04',2,'4c2ef15a0a0a3cab000616277a0e30d8',216,504),(170,1,'F06',1,'054214ca1081ac04bba92981f5cb897d',264,432),(172,1,'L26',1,'4c2ef4530a0a3cab018e1dbcaa8bb5f1',744,792),(173,1,'G28',15,'4c2ef1a20a0a3cab01a978604f8372eb',792,504),(174,1,'H29',1,'4c2ef1f90a0a3cab01f2fc303bdffaaa',816,576),(175,1,'G30',2,'4c2ef1a90a0a3cab0175c88bd2dad7bf',840,504),(176,1,'G01',2,'094214ca1081ac04bba92981f5cb8983',144,504),(177,1,'G02',2,'4c2ef1520a0a3cab014a6bc406c968f5',168,504),(178,1,'G03',2,'4c2ef1560a0a3cab0068e9ae27419f2c',192,504),(179,1,'F24',15,'4c2ef1310a0a3cab00ae14a7739bc2cf',696,432),(180,1,'F29',15,'4c2ef1420a0a3cab001b5173c8aa80a7',816,432),(181,1,'F25',15,'4c2ef1340a0a3cab000b1b1fc19a6380',720,432),(183,1,'H06',1,'4c2ef1c30a0a3cab005b99736a1259b9',264,576),(185,1,'E22',1,'4c2ef0aa0a0a3cab008d96941fc89782',648,360),(186,1,'H01',1,'4c2ef1ac0a0a3cab00e73cb4262260f2',144,576),(188,1,'J07',1,'4c2ef21a0a0a3cab0168764175f93959',288,648),(189,1,'L24',1,'4c2ef44d0a0a3cab019f46053444a423',696,792),(190,1,'E18',1,'4c2ef0a10a0a3cab0117796548077ea5',552,360),(191,1,'E24',1,'4c2ef0b30a0a3cab01eebdd30325ba41',696,360),(192,1,'E17',1,'4c2ef0980a0a3cab011ec99adb877a82',528,360),(193,1,'E14',1,'4c2ef0900a0a3cab00f6bd8e4977dc8a',456,360),(194,1,'E13',1,'4c2ef08c0a0a3cab0008d219408cdaa3',432,360),(195,1,'H31',1,'194214ca1081ac04bba92981f5cb8992',864,576),(197,1,'H04',1,'4c2ef1bb0a0a3cab0189f2292dc37605',216,576),(198,1,'L23',1,'4c2ef44a0a0a3cab008f25a5fc767569',672,792),(199,1,'E26',1,'4c2ef0bf0a0a3cab010cdb3626286b51',744,360),(200,1,'E28',1,'4c2ef0c20a0a3cab018fc09950809d96',792,360),(201,1,'E27',1,'4c2ef0bb0a0a3cab01a855f107d4d3c5',768,360),(202,1,'E30',1,'4c2ef0c90a0a3cab01f34654a9870c97',840,360),(203,1,'E25',1,'4c2ef0b70a0a3cab01b4aa31fc36990c',720,360),(204,1,'J27',1,'4c2ef2410a0a3cab01cf9d4b06806d40',768,648),(205,1,'F14',1,'4c2ef11e0a0a3cab00f480ca6e3ae24d',456,432),(206,1,'K05',3,'4c2ef3d10a0a3cab009eac5020490937',168,720),(207,1,'K25',3,'4c2ef4070a0a3cab001b9aee0f992f17',720,720),(208,1,'K24',3,'4c2ef4030a0a3cab0116d0eb9a3ecfbc',696,720),(209,1,'K19',3,'bcdaad6b346ac504ad5022d9dd0831db',576,720),(210,1,'K11',3,'4c2ef4260a0a3cab00e3d0a36b8e5b67',312,720),(211,1,'K09',3,'4c2ef4560a0a3cab00fe89328e8bddb2',264,720),(212,1,'K03',3,'4c2ef2590a0a3cab01b0be52807c3183',120,720),(213,1,'K12',3,'4c2ef3e50a0a3cab0115f982b0fe20c4',336,720),(214,1,'K10',3,'4c2ef3de0a0a3cab01ad24ab648eb836',288,720),(215,1,'K23',3,'7a9da2db60c8d1082bd5afd6314f03fb',672,720),(216,1,'K22',3,'379de2db60c8d1082bd5afd6314f0326',648,720),(217,1,'K21',3,'114214ca1081ac04bba92981f5cb89a0',624,720),(218,1,'K04',3,'4c2ef41c0a0a3cab0086c964b84dc334',144,720),(219,1,'K01',3,'4c2ef2450a0a3cab014e280ab94f3d98',72,720),(220,1,'K02',3,'4c2ef3d40a0a3cab01d72d6a72dacb3d',96,720),(221,1,'J09',1,'4c2ef2240a0a3cab01498240e9670786',336,648),(222,1,'J08',1,'114214ca1081ac04bba92981f5cb8995',312,648),(223,1,'K26',3,'1ecd2adb60c8d1082bd5afd6314f035a',744,720),(224,1,'F13',1,'4c2ef11a0a0a3cab01ec9e414f921c27',432,432),(225,1,'H09',1,'4c2ef1cd0a0a3cab01fecd39af374012',336,576),(226,1,'H08',1,'4c2ef1c90a0a3cab009a16e43b3a3b06',312,576),(228,1,'L10',2,'4c2ef42c0a0a3cab01db781ec3521227',288,792),(229,1,'L02',3,'4c2ef4200a0a3cab0182c584fef61b8d',72,792),(230,1,'L06',4,'7a7ba1eb346ac504ad5022d9dd083102',168,792),(231,1,'L07',4,'ce9b65eb346ac504ad5022d9dd0831c3',198,792),(232,1,'L08',4,'7a99a1e551505504ad508a2cc67a1b75',228,792),(233,1,'L11',2,'4c2ef42f0a0a3cab0129f419b62dfef8',312,792),(236,1,'L09',4,'114214ca1081ac04bba92981f5cb89a5',258,792),(237,1,'L05',5,'1d4214ca1081ac04bba92981f5cb89a3',144,792),(238,1,'L04',5,'273ba9ab346ac504ad5022d9dd0831d9',120,792),(239,1,'L03',5,'4c2ef4230a0a3cab00fa0f6efa6f1f9c',96,792),(241,1,'K06',3,'4c2ef3ce0a0a3cab0184dcd9d63d4fe8',192,720),(242,1,'K07',3,'194214ca1081ac04bba92981f5cb899d',216,720),(243,1,'K08',3,'4c2ef3f90a0a3cab001a5401ba87ac4e',240,720),(246,1,'J04',1,'1d4214ca1081ac04bba92981f5cb8993',216,648),(247,1,'J05',1,'4c2ef2140a0a3cab003a7f5e3a4f4e6a',240,648),(248,1,'J06',1,'4c2ef2180a0a3cab005847430fdbbd31',264,648),(249,1,'J01',9,'4c2ef1fc0a0a3cab0183b1fd30d51ccf',144,648),(250,1,'J02',1,'4c2ef2020a0a3cab015f3b8c5bda5858',168,648),(252,1,'K27',3,'d115c33f108de044bba92981f5cb89b2',768,720),(253,1,'H05',1,'4c2ef1bf0a0a3cab00b0090bd2222d63',240,576),(254,1,'H07',1,'4c2ef1c60a0a3cab011dbc9ad643b0ed',288,576),(257,1,'G05',5,'4c2ef1660a0a3cab0044ce3662117f2c',240,504),(258,1,'G06',5,'414214ca1081ac04bba92981f5cb8985',264,504),(259,1,'G07',5,'aac072df60c8d1082bd5afd6314f03ef',288,504),(260,1,'G08',7,'4c2ef1620a0a3cab00ed929f8b7d3029',312,504),(261,1,'G09',7,'114214ca1081ac04bba92981f5cb8986',336,504),(262,1,'F02',1,'454214ca1081ac04bba92981f5cb897c',168,432),(263,1,'F04',1,'4c2ef0e00a0a3cab01f775bc681704bc',216,432),(264,1,'F05',1,'6b0347bb108de044bba92981f5cb8987',240,432),(265,1,'E09',8,'4c2ef0850a0a3cab01cb7a9bcc26bd47',336,360),(266,1,'F01',10,'014214ca1081ac04bba92981f5cb897c',144,432),(268,1,'D32',5,'4c2ef0680a0a3cab007886e1b0687ca2',888,288),(269,1,'D31',5,'4c2ef0640a0a3cab00230636537d863f',864,288),(270,1,'D30',5,'103f8c177b851000bba99ff39b4d4d83',840,288),(271,1,'D22',4,'854214ca1081ac04bba92981f5cb896f',648,288),(272,1,'D25',4,'454214ca1081ac04bba92981f5cb8970',738,288),(273,1,'D26',12,'9a3f265f60c8d1082bd5afd6314f03e6',768,288),(274,1,'D24',4,'014214ca1081ac04bba92981f5cb8970',708,288),(275,1,'D23',12,'4c2ef0540a0a3cab0066d95354c9aab2',678,288),(276,1,'D21',8,'414214ca1081ac04bba92981f5cb896f',624,288),(277,1,'D27',4,'cd4214ca1081ac04bba92981f5cb8970',792,288),(278,1,'E31',1,'2299a1e551505504ad508a2cc67a1b72',864,360),(279,1,'F22',14,'4c2ef1290a0a3cab002a357d2e149b2f',648,432),(282,1,'G22',1,'4c2ef1860a0a3cab0088efdb95ceeb99',648,504),(283,1,'G23',1,'4c2ef1940a0a3cab01075dd7fe2068c4',672,504),(285,1,'H22',1,'4c2ef1e20a0a3cab01af401f7619003d',648,576),(286,1,'H23',1,'4c2ef1e60a0a3cab0089d4283a4f7d7e',672,576),(287,1,'H24',1,'4c2ef1e90a0a3cab0101fee202877c52',696,576),(288,1,'H28',1,'4c2ef1f60a0a3cab014d642925fedce3',792,576),(289,1,'H30',2,'e299a1e551505504ad508a2cc67a1b73',840,576),(290,1,'J28',1,'194214ca1081ac04bba92981f5cb8999',792,648),(291,1,'J30',1,'37028f3b108de044bba92981f5cb89d2',840,648),(292,1,'L19',1,'4c2ef4350a0a3cab01bbeac3df5d0b7d',576,792),(293,1,'L20',1,'a33c8bb710cde044bba92981f5cb8957',600,792),(294,1,'L21',1,'063ccfb710cde044bba92981f5cb897d',624,792),(295,1,'L25',1,'4c2ef4500a0a3cab01ed31548085c950',720,792),(296,1,'L27',1,'1d4214ca1081ac04bba92981f5cb89a8',768,792),(301,1,'PDU-2',16,NULL,408,648),(302,1,'PDU-1',16,NULL,504,648),(303,1,'STS2-#2',17,NULL,408,624),(304,1,'STS2-#1',17,NULL,504,624),(306,1,'PDU-4',16,NULL,408,288),(307,1,'STS2-#4',17,NULL,408,264),(308,1,'PDU-3',16,NULL,504,288),(309,1,'STS2-#3',17,NULL,504,264),(310,1,'PDU-8',16,NULL,408,168),(311,1,'STS2-#8',17,NULL,408,210),(312,1,'STS2-#7',17,NULL,504,210),(313,1,'PDU-7',16,NULL,504,168),(314,1,'PDU-6',16,NULL,408,96),(315,1,'STS2-#6',17,NULL,408,72),(316,1,'PDU-5',16,NULL,504,96),(317,1,'STS2-#5',17,NULL,504,72),(318,1,'STS2-#9',17,NULL,552,240),(319,1,'PDU-9',16,NULL,552,168),(320,1,'PDU-10',16,NULL,552,72),(321,1,'STS2-#10',17,NULL,552,120),(322,1,'E15',1,'0f01c3f7108de044bba92981f5cb89ec',480,360),(323,1,'E16',1,'57014bf7108de044bba92981f5cb89e2',504,360),(325,2,'13D',1,'344214ca1081ac04bba92981f5cb8951',432,264),(327,2,'05A',1,'704214ca1081ac04bba92981f5cb8929',168,48),(328,2,'15B',1,'704214ca1081ac04bba92981f5cb8954',480,120),(329,2,'02A',1,'056d2e9b60c8d1082bd5afd6314f038f',96,48),(330,2,'04D',1,'b04214ca1081ac04bba92981f5cb8928',144,264),(331,2,'07C',1,'fc4214ca1081ac04bba92981f5cb8946',216,192),(332,2,'14E',2,'f44214ca1081ac04bba92981f5cb8953',456,336),(333,2,'04B',1,'dbff3237108de044bba92981f5cb89a5',144,120),(334,2,'05E',1,'744214ca1081ac04bba92981f5cb892a',168,336),(335,2,'02D',1,'3c4214ca1081ac04bba92981f5cb8923',96,264),(336,2,'16B',1,'b84214ca1081ac04bba92981f5cb8955',504,120),(337,2,'13E',1,'784214ca1081ac04bba92981f5cb8951',432,336),(338,2,'03E',1,'4c2eed9f0a0a3cab00fb718f62881db7',120,336),(339,2,'06F',2,'f84214ca1081ac04bba92981f5cb8945',192,408),(340,1,'2-3',1,'1ca6460d34b68d04ad5022d9dd0831e2',456,504),(341,3,'01G',1,'463fc82410e9a084bba92981f5cb8917',72,552),(342,2,'06E',1,'b44214ca1081ac04bba92981f5cb8945',192,336),(343,2,'16D',1,'fc4214ca1081ac04bba92981f5cb8955',504,264),(344,2,'06A',1,'b04214ca1081ac04bba92981f5cb8944',192,48),(346,2,'10B',1,'62d6fab7104de044bba92981f5cb8990',360,120),(347,3,'09G',2,'92dda29b60c8d1082bd5afd6314f036b',126,600),(348,2,'05B',1,'b44214ca1081ac04bba92981f5cb8929',168,120),(349,2,'05F',1,'e9d7f23b104de044bba92981f5cb8958',168,408),(350,2,'11F',1,'b04214ca1081ac04bba92981f5cb894e',384,408),(351,2,'10F',1,'200087b7108de044bba92981f5cb8942',360,408),(352,2,'17B',1,'784214ca1081ac04bba92981f5cb8956',528,120),(353,2,'01D',1,'521e6edb60c8d1082bd5afd6314f0387',72,264),(354,2,'15D',1,'f84214ca1081ac04bba92981f5cb8954',480,264),(355,2,'03B',1,'b84214ca1081ac04bba92981f5cb8925',120,120),(356,2,'02B',1,'b04214ca1081ac04bba92981f5cb8923',96,120),(357,2,'14D',1,'b04214ca1081ac04bba92981f5cb8953',456,264),(358,2,'09B',1,'4c2eee230a0a3cab016dd62eb690ea79',264,120),(359,2,'M5',1,'87d7bef7104de044bba92981f5cb897e',504,24),(360,2,'05D',1,'304214ca1081ac04bba92981f5cb892a',168,264),(361,2,'12B',1,'3c4214ca1081ac04bba92981f5cb894e',408,120),(362,2,'13B',1,'b84214ca1081ac04bba92981f5cb8950',432,120),(363,2,'M15',1,'57d7723b104de044bba92981f5cb89de',528,24),(364,2,'07D',1,'344214ca1081ac04bba92981f5cb8947',216,264),(365,2,'11E',1,'7c4214ca1081ac04bba92981f5cb894d',384,336),(367,1,'K29',1,'b699a1e551505504ad508a2cc67a1b74',816,720),(369,2,'03A',1,'744214ca1081ac04bba92981f5cb8925',120,48),(370,2,'08A',1,'4c2eee0e0a0a3cab0070dcff8eb103e8',240,48),(371,2,'07E',1,'784214ca1081ac04bba92981f5cb8947',216,336),(373,2,'07B',1,'b84214ca1081ac04bba92981f5cb8946',216,120),(374,2,'07A',1,'5fd6fab7104de044bba92981f5cb89ab',216,48),(375,2,'07F',2,'bc4214ca1081ac04bba92981f5cb8947',216,408),(376,2,'12D',1,'b44214ca1081ac04bba92981f5cb894f',408,264),(377,3,'08G',2,'0541dce410e9a084bba92981f5cb8995',102,600),(378,2,'08B',1,'384214ca1081ac04bba92981f5cb8948',240,120),(384,2,'01C',1,'15de6a1f60c8d1082bd5afd6314f03fa',72,192),(385,2,'15E',2,'304214ca1081ac04bba92981f5cb8955',480,336),(386,2,'10H',1,'784214ca1081ac04bba92981f5cb894c',360,672),(387,2,'01F',1,'f69036df60c8d1082bd5afd6314f0326',72,408),(389,1,'G31',1,'4c2ef1af0a0a3cab01700d1c1b86c397',864,504),(390,3,'13G',12,'4c2eef100a0a3cab01a7b93999542ebf',438,600),(391,2,'08D',1,'8e3e621f60c8d1082bd5afd6314f0301',240,264),(392,3,'06G',12,'33405ca410e9a084bba92981f5cb8941',198,552),(393,2,'12E',1,'f84214ca1081ac04bba92981f5cb894f',408,336),(394,2,'02E',12,'704214ca1081ac04bba92981f5cb8924',96,336),(395,2,'08C',1,'14fe6e1f60c8d1082bd5afd6314f0338',240,192),(396,2,'01B',1,'b84214ca1081ac04bba92981f5cb8920',72,120),(399,2,'11H',1,'f44214ca1081ac04bba92981f5cb894e',384,672),(404,2,'01A',1,'114b22d760c8d1082bd5afd6314f030b',72,48),(406,2,'04A',1,'4c2eeda70a0a3cab01bacc0dd08083b8',144,48),(407,2,'09A',1,'3c4214ca1081ac04bba92981f5cb8949',264,48),(408,2,'14B',1,'4a3ee5ef346ac504ad5022d9dd08314d',456,120),(409,2,'10C',1,'304214ca1081ac04bba92981f5cb894b',360,192),(410,2,'11D',1,'384214ca1081ac04bba92981f5cb894d',384,264),(411,2,'04G',1,'3c4214ca1081ac04bba92981f5cb8928',144,552),(413,2,'11C',1,'f04214ca1081ac04bba92981f5cb894d',384,192),(414,2,'10D',1,'4c2eeec80a0a3cab008062e86fd52093',360,264),(415,2,'03F',1,'4c2eeda30a0a3cab01851e7937ad0f7d',120,408),(416,2,'02H',1,'304214ca1081ac04bba92981f5cb8925',96,672),(417,2,'01H',1,'f5ce6a1f60c8d1082bd5afd6314f0364',72,672),(418,2,'10E',2,'4c2eeecd0a0a3cab00e0eb4e5000d642',360,336),(423,2,'03D',1,'344214ca1081ac04bba92981f5cb8926',120,264),(424,1,'Bldg 08',1,NULL,24,24),(440,2,'02G',1,'f84214ca1081ac04bba92981f5cb8924',96,552),(443,1,'2-4',1,'f0c60a0d34b68d04ad5022d9dd083135',504,504),(448,1,'F26',15,'4c2ef1380a0a3cab0140cb511a443ba6',744,432),(459,2,'02F',1,'b44214ca1081ac04bba92981f5cb8924',96,408),(463,1,'MDF',1,'4c2ef4630a0a3cab00abff0051b5659b',192,24),(466,1,'1-5',1,'b93bb90c11f5f0007fa2908b78101b02',528,432),(469,1,'1-6',1,'90360ec934b68d04ad5022d9dd08319e',552,432),(470,1,'C02',1,'014214ca1081ac04bba92981f5cb8966',168,216),(471,1,'J20',2,'4c2ef2270a0a3cab01050f56f5a79ddd',600,648),(472,3,'07G',12,'ec7929e160d099082bd5afd6314f0343',72,600),(475,3,'12G',12,'de99ad6551505504ad508a2cc67a1b25',408,600),(476,3,'05G',12,'934054a410e9a084bba92981f5cb8920',168,552),(477,2,'06B',1,'a43e221f60c8d1082bd5afd6314f03d8',192,120),(478,2,'11B',1,'4c2eeed90a0a3cab01e2dc552676bb60',384,120),(479,2,'12F',1,'304214ca1081ac04bba92981f5cb8950',408,408),(480,3,'14G',12,'d699ad6551505504ad508a2cc67a1b28',468,600),(481,1,'3-5',1,'f427c24d34b68d04ad5022d9dd0831c7',528,576),(482,1,'3-6',1,'362f8f66516f4d00ad508a2cc67a1bb2',552,576),(483,1,'3-4',1,'f357ce0d34b68d04ad5022d9dd0831fe',504,576),(484,1,'3-3',1,'8a47864d34b68d04ad5022d9dd08316e',456,576),(485,5,'101',1,'91fd2edb60c8d1082bd5afd6314f031a',50,50),(486,5,'102',1,'4deaf8e910192844bba92981f5cb8978',50,50),(487,5,'AE1',1,'7eaee61f60c8d1082bd5afd6314f03ef',50,50),(488,5,'103',1,'a4ea7ce910192844bba92981f5cb89e7',50,50),(490,3,'15G',1,'dbfeae1f60c8d1082bd5afd6314f0329',504,600),(491,2,'03C',1,'fc4214ca1081ac04bba92981f5cb8925',120,192),(495,2,'06C',1,'96fb7cd551501504ad508a2cc67a1b9f',192,192),(496,1,'1-4',1,'3f160ec934b68d04ad5022d9dd08318b',504,432),(497,1,'2-1',1,'43760ec934b68d04ad5022d9dd08316b',408,504),(498,1,'2-2',1,'8696860d34b68d04ad5022d9dd08310f',432,504),(500,1,'2-5',1,'d9d60a0d34b68d04ad5022d9dd08313a',528,504),(503,1,'2-6',1,'44e68a0d34b68d04ad5022d9dd083118',552,504),(504,1,'3-1',1,'d217c24d34b68d04ad5022d9dd0831c3',408,576),(505,1,'3-2',1,'9b67468934b68d04ad5022d9dd083165',432,576),(506,2,'13F',1,'bc4214ca1081ac04bba92981f5cb8951',432,408),(507,2,'01E',1,'784214ca1081ac04bba92981f5cb8921',72,336),(509,2,'13C',1,'fc4214ca1081ac04bba92981f5cb8950',432,192),(523,10,'DC Office',1,NULL,50,50),(524,11,'Bldg 10',1,NULL,50,50),(525,12,'Bldg 06',1,NULL,50,50),(526,2,'02C',1,'f44214ca1081ac04bba92981f5cb8923',96,192),(527,2,'04C',1,'4c2eedaf0a0a3cab0156af31354b6ca9',144,192),(528,2,'04E',1,'4c2eedb70a0a3cab00a5a81167fbd9c2',144,336),(529,2,'05C',1,'4c2eedce0a0a3cab00fa808ae5ba9e63',168,192),(530,3,'10G',1,'ac8929e160d099082bd5afd6314f0384',360,552),(531,2,'12C',1,'704214ca1081ac04bba92981f5cb894f',408,192),(532,2,'14C',1,'ca4e69ef346ac504ad5022d9dd08310a',456,192),(533,3,'16G',1,'5299a1e551505504ad508a2cc67a1b6c',504,552),(534,3,'17G',1,'4c2eef420a0a3cab01e4e99b22c07fa2',528,552),(541,1,'D29',1,'494214ca1081ac04bba92981f5cb8971',816,288),(543,1,'E12',1,'454214ca1081ac04bba92981f5cb8975',408,360),(544,1,'E19',1,'094214ca1081ac04bba92981f5cb8977',576,360),(545,1,'F28',1,'054214ca1081ac04bba92981f5cb8982',792,432),(549,1,'J03',1,'4c2ef2050a0a3cab01d4480d2aa7771e',192,648),(550,1,'J19',1,'4c2ef2200a0a3cab012f3585c5bb3945',576,648),(551,1,'J22',1,'4c2ef22d0a0a3cab015f5eede416776f',648,648),(552,1,'K28',1,'4c2ef4100a0a3cab002dacccb605b2cc',792,720),(553,1,'L01',1,'194214ca1081ac04bba92981f5cb89a2',48,792),(554,1,'L12',1,'4c2ef4320a0a3cab008604441b5615fa',336,792),(555,1,'L28',1,'84c2b1ffe055f0002bd5a432afdb801d',792,792),(556,5,'',1,NULL,50,50),(557,2,'MDF-1',1,NULL,50,50);
/*!40000 ALTER TABLE `cabinet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cabinet_type`
--

DROP TABLE IF EXISTS `cabinet_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cabinet_type` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `type` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `imageName` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `width` int(5) NOT NULL,
  `length` int(5) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cabinet_type`
--

LOCK TABLES `cabinet_type` WRITE;
/*!40000 ALTER TABLE `cabinet_type` DISABLE KEYS */;
INSERT INTO `cabinet_type` (`id`, `name`, `type`, `imageName`, `width`, `length`) VALUES (1,'Standard 24x36','standard_24x36','cabinet_24x36.gif',24,36),(2,'HP Blade Cabinet 24x48','hp_blade_cabinet','cabinet_hp_24x48.gif',24,48),(3,'Standard 24x43','standard_24x43','cabinet_24x43.gif',24,43),(4,'EMC Symmetrix 30x40','emc_symmetrix','cabinet_emc_30x40.gif',30,40),(5,'EMC 24x38','emc','cabinet_emc_24x38.gif',24,38),(6,'Battery Cabinet 48x34','battery_cabinet','cabinet_battery_48x34.gif',48,34),(7,'Quantum 24x36','quantum','cabinet_quantum_24x36.gif',24,36),(8,'EMC Connectrix 30x40','emc_connectrix','cabinet_emc_connectrix_30x40.gif',30,40),(9,'Quest 30x36','quest','cabinet_quest_30x36.gif',30,36),(10,'Verint 24x37','verint','cabinet_verint_24x37.gif',4,37),(11,'Netezza 24x38','netezza','cabinet_netezza_24x38.gif',24,38),(12,'EMC VMAX 30x36','emc_vmax','cabinet_emc_vmax_30x36.gif',30,36),(13,'EMC VNX 24x36','emc_vnx','cabinet_emc_vnx_24x36.gif',24,36),(14,'IBM XIV 24x44','ibm_xiv','cabinet_ibm_xiv_24x44.gif',24,44),(15,'IBM 25x43','ibm','cabinet_ibm_25x43.gif',25,43),(16,'PDU 32x44','pdu','pdu_32x44.gif',32,44),(17,'STS 32x30','sts','sts_32x30.gif',32,30);
/*!40000 ALTER TABLE `cabinet_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_run_time`
--

DROP TABLE IF EXISTS `job_run_time`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_run_time` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `jobName` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `runTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_run_time`
--

LOCK TABLES `job_run_time` WRITE;
/*!40000 ALTER TABLE `job_run_time` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_run_time` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `location` (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `sysId` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `street` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `city` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `state` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `zip` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_idx` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location`
--

LOCK TABLES `location` WRITE;
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
INSERT INTO `location` (`id`, `sysId`, `name`, `street`, `city`, `state`, `zip`) VALUES (1,'252770b80a0a3cac01a23e2b410dd37d','Sterling-VA-NSR-B8','45980 Center Oak Plaza','Sterling','VA','20166'),(2,'25276f670a0a3cac01e34ffb0d7c6b2d','Charlotte-NC-CLT-1','8910 Lenox Pointe Drive Suite A','Charlotte','NC','28273'),(3,'25276f6f0a0a3cac01d11f0742c048a5','Charlotte-NC-CLT-3','8910 Lenox Pointe Drive Suite A','Charlotte','NC','28273'),(5,'25276fd80a0a3cac01e61db25636a1a1','Ashburn-VA-EQIX-DC2','\"DC2\" UltraDNS c/o Equinix 21715 Filigree Ct, Ste F','Ashburn','VA','20147'),(9,'25276f9c0a0a3cac009095c5670ee61c','Concord-CA-NSR','1800 Sutter St Suite 780','Concord','CA','94520'),(10,'d408697434724d04ad5022d9dd08315b','Building 8 Storage',NULL,NULL,NULL,NULL),(11,'25276f440a0a3cac0094e0aa31fda861','Sterling-VA-NSR-B1','21631 Ridgetop Circle','Sterling','VA','20166'),(12,'5a48a1b434724d04ad5022d9dd083155','Sterling-VA-JK-Moving','44112 Mercure Circle','Sterling','VA','20166'),(13,'25276f670a0a3cac01e34ffb0d7c6b2d','Charlotte-NC-NSR-CLT-1','8910 Lenox Pointe Drive Suite A','Charlotte','NC','28273');
/*!40000 ALTER TABLE `location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login`
--

DROP TABLE IF EXISTS `login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `login` (
  `userId` int(5) NOT NULL,
  `numLogins` int(4) NOT NULL,
  `lastLogin` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ipAddr` varchar(24) COLLATE utf8_unicode_ci DEFAULT NULL,
  `userAgent` varchar(132) COLLATE utf8_unicode_ci DEFAULT NULL,
  KEY `userId` (`userId`),
  CONSTRAINT `login_userId_fk` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login`
--

LOCK TABLES `login` WRITE;
/*!40000 ALTER TABLE `login` DISABLE KEYS */;
/*!40000 ALTER TABLE `login` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `page_view`
--

DROP TABLE IF EXISTS `page_view`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `page_view` (
  `userId` int(5) NOT NULL,
  `page` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `accessTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `userId` (`userId`),
  CONSTRAINT `page_view_userId_fk` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page_view`
--

LOCK TABLES `page_view` WRITE;
/*!40000 ALTER TABLE `page_view` DISABLE KEYS */;
/*!40000 ALTER TABLE `page_view` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subsystem`
--

DROP TABLE IF EXISTS `subsystem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subsystem` (
  `sysId` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`sysId`),
  UNIQUE KEY `name_index` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subsystem`
--

LOCK TABLES `subsystem` WRITE;
/*!40000 ALTER TABLE `subsystem` DISABLE KEYS */;
INSERT INTO `subsystem` (`sysId`, `name`) VALUES ('f432116a99e93000ad50086852dd803b','Application Hosts - Brazil'),('e432dd2a99e93000ad50086852dd80e3','Application Hosts - NPAC'),('ec32dd2a99e93000ad50086852dd80f2','Arbor'),('fc32116a99e93000ad50086852dd8037','Assets-Registry'),('e832dd2a99e93000ad50086852dd80f3','Assets-UltraViolet'),('ec32dd2a99e93000ad50086852dd80fe','Blue Coat'),('f432116a99e93000ad50086852dd803f','Call Center'),('f032116a99e93000ad50086852dd803f','Call Reporting'),('f832116a99e93000ad50086852dd8038','Chassis VC Family - NPAC'),('2c32dd2a99e93000ad50086852dd80c4','Clariion Array'),('f432116a99e93000ad50086852dd8035','Clariion Array - Ultra'),('f432116a99e93000ad50086852dd8022','Confererncing'),('ec32dd2a99e93000ad50086852dd80ef','Data Center'),('e032dd2a99e93000ad50086852dd80f0','Data Center Apps'),('52fd99e434938508ad5022d9dd083188','Data Services-Analysis Tools-Dev'),('56fd99e434938508ad5022d9dd08318b','Data Services-Analysis Tools-Prod'),('d6fd99e434938508ad5022d9dd08318d','Data Services-Data Warehouse-Dev'),('1afd99e434938508ad5022d9dd08318e','Data Services-Data Warehouse-DR'),('6afd99e434938508ad5022d9dd08318f','Data Services-Data Warehouse-Prod'),('2efd99e434938508ad5022d9dd0831e8','Data Services-Hadoop Data Nodes-Dev'),('eefd99e434938508ad5022d9dd0831eb','Data Services-Hadoop Data Nodes-Prod'),('22fd99e434938508ad5022d9dd0831ed','Data Services-Hadoop Master Nodes-Dev'),('e2fd99e434938508ad5022d9dd0831f0','Data Services-Hadoop Master Nodes-Prod'),('26fd99e434938508ad5022d9dd0831f1','Data Services-Hadoop Utility Nodes-Dev'),('e432dd2a99e93000ad50086852dd80f0','Data Warehouse'),('e432dd2a99e93000ad50086852dd80eb','Database Clones - NPAC'),('2c32dd2a99e93000ad50086852dd80c0','Database Hosts - Brazil'),('f032116a99e93000ad50086852dd803d','Database Hosts - NPAC'),('cb65b50534768d04ad5022d9dd083106','Database Hosts-CARE'),('e432dd2a99e93000ad50086852dd80f2','Database Infrastructure'),('f832116a99e93000ad50086852dd801c','DDMI'),('2432dd2a99e93000ad50086852dd80ca','DMX Array'),('ec32dd2a99e93000ad50086852dd80fa','EDL'),('fc32116a99e93000ad50086852dd800b','eHealth'),('f432116a99e93000ad50086852dd801f','EMC Tools'),('e432dd2a99e93000ad50086852dd80ff','Encase'),('e432dd2a99e93000ad50086852dd80fc','ENUM - CT'),('e032dd2a99e93000ad50086852dd80fc','ENUM Dev'),('e432116a99e93000ad50086852dd8004','Exchange'),('e832dd2a99e93000ad50086852dd80ff','Firewalls / VPNs'),('ec32dd2a99e93000ad50086852dd80ff','Forensics Tools'),('fc32116a99e93000ad50086852dd800f','FTP - NPAC'),('9832dd2a99e93000ad50086852dd809b','Generic CA'),('9432dd2a99e93000ad50086852dd809d','HSM'),('c602c10c11f1f0007fa2908b78101b0a','IAD - 01'),('0362c10c11f1f0007fa2908b78101b4c','IAD - 02'),('e032116a99e93000ad50086852dd8000','IDS'),('2432dd2a99e93000ad50086852dd80be','InfoSec'),('2832dd2a99e93000ad50086852dd80be','InfoSec Admin'),('e432116a99e93000ad50086852dd8000','IronMail'),('f032116a99e93000ad50086852dd8010','IVR-NPAC'),('ec32116a99e93000ad50086852dd8004','LAN - NT'),('e832116a99e93000ad50086852dd8004','LAN Infrastructure Dev'),('ec32116a99e93000ad50086852dd8000','LDAP'),('97708cb48d198d802bd59db7ec75d3a8','LogPuller-NPAC'),('f832116a99e93000ad50086852dd800e','LSMS Distribution Databases'),('2032dd2a99e93000ad50086852dd80c7','Media Server'),('e032116a99e93000ad50086852dd8007','Mobile Cloud Assets'),('e032116a99e93000ad50086852dd8005','MS Back Office'),('ec32116a99e93000ad50086852dd8007','NAS'),('2c32dd2a99e93000ad50086852dd80c7','NAS/NANPA'),('2032dd2a99e93000ad50086852dd80c8','NAS/NANPA Dev'),('2432dd2a99e93000ad50086852dd80c8','NAS/NANPA QA'),('5b5d79398d4acd442bd59db7ec75d3cc','NAS/NANPA-Network'),('90835b4c11be38807fa2908b78101be9','NCC'),('84d5714534768d04ad5022d9dd08313a','NDM Hosts-CARE'),('e032116a99e93000ad50086852dd8006','NetApp Storage'),('f432116a99e93000ad50086852dd800c','Netcool'),('e032116a99e93000ad50086852dd8008','Network'),('e032116a99e93000ad50086852dd8001','Network Access Control (NAC)'),('e432116a99e93000ad50086852dd8008','Network Tools'),('2432dd2a99e93000ad50086852dd80bf','Network-UltraViolet'),('fc32116a99e93000ad50086852dd8012','Neustar LSMS Gateway'),('f032116a99e93000ad50086852dd8038','Neustar Web Performance Management (WPM)'),('2d4e39798d4acd442bd59db7ec75d372','NeuStar-Labs-Network'),('e832dd2a99e93000ad50086852dd80eb','NFS Appliance'),('e832116a99e93000ad50086852dd8008','NGM'),('e032dd2a99e93000ad50086852dd80e3','NIS - DB Server'),('2832dd2a99e93000ad50086852dd80bc','NMS'),('2832dd2a99e93000ad50086852dd80bf','NOC Lab'),('f032116a99e93000ad50086852dd800f','NPAC'),('f832116a99e93000ad50086852dd800f','NPAC - Dev'),('512880348df1c9042bd59db7ec75d338','NPAC - DEV/QA/PMT-Application Hosts'),('657808348df1c9042bd59db7ec75d31d','NPAC - Dev/QA/PMT-Chassis VC Family'),('211948748df1c9042bd59db7ec75d304','NPAC - Dev/QA/PMT-Database Hosts'),('e4f944f48df1c9042bd59db7ec75d3a1','NPAC - Dev/QA/PMT-NMT'),('fc32116a99e93000ad50086852dd8010','NPAC - Midwest'),('f432116a99e93000ad50086852dd8013','NPAC - Southwest'),('ec32dd2a99e93000ad50086852dd80e9','NPAC Arrays'),('e832dd2a99e93000ad50086852dd80ea','NPAC SAN Switches'),('8b42fea529273c80a21130d9dae3a799','NPAC Storage Management Host'),('f832116a99e93000ad50086852dd8014','OMS'),('a4f49bcc341bbc007fa2c3d12d79c890','OMS-Adapter-Gateway'),('fc32116a99e93000ad50086852dd8014','OMS-ASR-Database'),('f032116a99e93000ad50086852dd8015','OMS-ASR-Gateway'),('f032116a99e93000ad50086852dd8017','OMS-ESR-Database'),('f032116a99e93000ad50086852dd8018','OMS-IMM-Database'),('f032116a99e93000ad50086852dd801b','OMS-Report-Database'),('fc32116a99e93000ad50086852dd8019','OMS-SOA-Gateway'),('f7bad9b38d7c49402bd59db7ec75d34b','Operations Chassis-Cisco'),('dbfaddb38d7c49402bd59db7ec75d36e','Operations Chassis-Flex Fabric'),('2b5bd5f38d7c49402bd59db7ec75d35f','Operations Chassis-Virtual Connect'),('ca7277f251ef8d00ad508a2cc67a1baa','Operations Hypervisors-Power VM'),('1f32801c8de1c9c02bd59db7ec75d365','Operations Management Servers-HMC'),('6ce96cac8d414d402bd59db7ec75d395','Operations Management Servers-HP SIM'),('204a24ec8d414d402bd59db7ec75d3aa','Operations Management Servers-IBM System'),('3b72801c8de1c9c02bd59db7ec75d3b0','Operations Management Servers-Jumphosts'),('736ae0ec8d414d402bd59db7ec75d33a','Operations Management Servers-Solaris Op'),('e432116a99e93000ad50086852dd8001','Oracle IDM'),('fc32116a99e93000ad50086852dd801b','PAS'),('2432dd2a99e93000ad50086852dd80cb','PAS Dev'),('2832dd2a99e93000ad50086852dd80cb','PAS QA'),('2c32dd2a99e93000ad50086852dd80c2','Pathfinder'),('f832116a99e93000ad50086852dd8022','PBX'),('e032116a99e93000ad50086852dd8002','PGP'),('f032116a99e93000ad50086852dd801c','PORT - PS'),('e832dd2a99e93000ad50086852dd80ee','Production Backup'),('e032dd2a99e93000ad50086852dd80f5','PS - Stat'),('e432dd2a99e93000ad50086852dd80f5','PS FIN - Asset Management'),('e832dd2a99e93000ad50086852dd80f5','PS FIN - Billing'),('e432116a99e93000ad50086852dd8002','Radius'),('f832116a99e93000ad50086852dd8033','SAN Switch'),('f032116a99e93000ad50086852dd8040','SAN Switch - Offline Storage'),('9032dd2a99e93000ad50086852dd809b','SAN Switch - Ultra'),('2c32dd2a99e93000ad50086852dd80be','SIEM'),('e032dd2a99e93000ad50086852dd80fd','SIP-IX'),('ee5fb5b98d4acd442bd59db7ec75d3a4','SIP-IX-Network'),('2032dd2a99e93000ad50086852dd80c1','Site Protect'),('f832116a99e93000ad50086852dd801f','Storage'),('2832dd2a99e93000ad50086852dd80c4','Storage Management Host'),('fc32116a99e93000ad50086852dd8021','SysAdmin Tools'),('f432116a99e93000ad50086852dd8021','Systems Infrastructure'),('2832dd2a99e93000ad50086852dd80ca','Tape Libraries'),('9432dd2a99e93000ad50086852dd809e','Technology'),('f432116a99e93000ad50086852dd8023','Telecom-Other'),('e032116a99e93000ad50086852dd8003','Tripwire'),('bd40ef54ede04100ad5041df68d73368','Ultra-Advanced Reporting'),('8db36c4f8d6849002bd59db7ec75d31b','Ultra-Network'),('f032116a99e93000ad50086852dd8025','UltraDNS'),('f832116a99e93000ad50086852dd8030','UltraDNS - CT'),('f432116a99e93000ad50086852dd8030','UltraDNS - DEV'),('f832116a99e93000ad50086852dd8031','UltraDNS - QA'),('f432116a99e93000ad50086852dd8028','UltraDNS Infrastructure'),('f032116a99e93000ad50086852dd8029','UltraDNS Leaf Databases'),('f832116a99e93000ad50086852dd8029','UltraDNS Microsoft Servers'),('f432116a99e93000ad50086852dd802a','UltraDNS MXBacker'),('f032116a99e93000ad50086852dd802b','UltraDNS Pre-Production'),('e432116a99e93000ad50086852dd8005','Virtual server host'),('9032dd2a99e93000ad50086852dd8099','Virtualization Controller'),('2432dd2a99e93000ad50086852dd80c5','VMAX Array'),('e032dd2a99e93000ad50086852dd80e4','VNX Array'),('f032116a99e93000ad50086852dd8023','Voicemail'),('2c32dd2a99e93000ad50086852dd80bf','VTC'),('fc32116a99e93000ad50086852dd8041','VTL/Deduplication Appliance'),('00e65649343a8d04ad5022d9dd083119','Web & App Hosts-CARE'),('fc32116a99e93000ad50086852dd8031','Web Services'),('fc32116a99e93000ad50086852dd8039','Web/Database Hosts - RMS'),('f432116a99e93000ad50086852dd8032','Webmetrics'),('9432dd2a99e93000ad50086852dd809a','WMRS'),('e432dd2a99e93000ad50086852dd80e4','XIV Array');
/*!40000 ALTER TABLE `subsystem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
  `lastName` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
  `userName` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `nickName` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
  `empId` varchar(16) COLLATE utf8_unicode_ci DEFAULT NULL,
  `title` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
  `dept` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
  `office` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(64) COLLATE utf8_unicode_ci DEFAULT NULL,
  `officePhone` varchar(16) COLLATE utf8_unicode_ci DEFAULT NULL,
  `mobilePhone` varchar(16) COLLATE utf8_unicode_ci DEFAULT NULL,
  `accessCode` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`userName`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` (`id`, `firstName`, `lastName`, `userName`, `nickName`, `empId`, `title`, `dept`, `office`, `email`, `officePhone`, `mobilePhone`, `accessCode`) VALUES (1,'Robert','Callahan','rcallaha',NULL,'002386','Principal Systems Engr','066002 - Corporate Systems Opera','B8 Office/Cube 32','Robert.Callahan@neustar.biz','(571) 434-5165','(703) 851-5412',3),(2,'Meg (Geisler)','Callahan','mgeisler',NULL,'003907','Principal Bus Systems Analyst','066001 - System Operations','Sterling','meg.geisler@neustar.biz','703)-464-4245','703-328-2544',2),(3,'Iris','Culpepper','iculpepp',NULL,'003194','Principal Bus Systems Analyst','005237 - Corporate Systems - Saa','Bldg 10, 2nd Floor, Cube 53','Iris.Culpepper@neustar.biz','(571) 434-6050',' ',0),(4,'James','Weber','jweber',NULL,'002746','Dir Data Centers','005117 - Operations Mgmt','B8 Office/Cube 76','James.Weber@neustar.biz','571-434-5917','571-334-0587',0),(5,'Melinda','Miller','mmiller',NULL,'003171','Mgr Systems Admin','005106 - Data Center Facility Op',NULL,'Melinda.Miller@neustar.biz','(303) 802-1383',NULL,3),(6,'David','Bennett','dbennett',NULL,'002453','Sr Data Center Techn','005106 - Data Center Facility Op','B8 Office/Cube 106','David.Bennett@neustar.biz','(571) 434-3513','571-221-8521',3),(11,'Steve','Clark','sclark',NULL,'000968','Staff Sys Admin','005165 - Shared Systems Administ','B8 Office/Cube 13','Steve.Clark@neustar.biz','(571) 434-5646','3042791289',0),(12,'Angelica','Brown','abrown',NULL,'SPP0000899','Contractor - Data Storage Scienc',NULL,NULL,'Angelica.Brown@neustar.biz','703-547-6023','703-309-9073',0),(13,'Allyson','Raines','s_araine',NULL,NULL,'Contractor',NULL,NULL,'Allyson.Raines@neustar.biz','571-434-6816','(804)356-1336',0),(15,'Saneeta','Narla','snarla',NULL,'002559','Systems Integrator','005106 - Data Center Facility Op',NULL,'Saneeta.Narla@neustar.biz','(571) 434-5692',NULL,2),(16,'Bob','Reinsel','s_breins',NULL,'SPP0001178','Contractor',NULL,NULL,'Bob.Reinsel@neustar.biz','703-547-6008',NULL,0),(17,'Mark','Murphy','s_mmurph',NULL,'SPP0001042','Contractor',NULL,NULL,'Mark.Murphy@neustar.biz','(571) 434-3479','7034638452',0),(18,'Geoffrey','Salinger','gsalinge',NULL,'002319','Dir Systems & Storage','005165 - Shared Systems Administ','Bld 8, Cube 124','Geoffrey.Salinger@neustar.biz','(571) 434-5114','(571) 299-9125',0),(19,'Stuart','Horner','s_shorne',NULL,'SPP0001029','Contractor',NULL,NULL,'Stuart.Horner@neustar.biz','(703) 464-4255','540-818-4788',0),(20,'Geoffrey','Giekes','ggiekes',NULL,'002782','Sr Network & Info Sec Engr','005105 - SOC','B8 Office/Cube 49','Geoffrey.Giekes@neustar.biz','(703) 464-4044',NULL,0),(21,'Chandru','Khemani','ckhemani',NULL,'000851','Sr Storage Engr','005168 - Storage & Back-up','B8 Office/Cube 12','Chandru.khemani@neustar.biz','(571) 434-5336','(571) 217-6451',0),(22,'Amit','Rai','arai',NULL,'000976','Sr Network Engr','005110 - Network Operations','B8 Office/Cube 3','Amit.Rai@neustar.biz','(571) 434-5668','(571) 216-5121',0),(23,'Jill','Bowyer','jbowyer',NULL,'002441','Mgr Systems Admin','005168 - Storage & Back-up','B8 Office/Cube 26','Jill.Bowyer@neustar.biz','(571) 969 1972','(571) 969 1972',0),(24,'Udhayakumar','Parerikkal','uparerik',NULL,'000614','Mgr CRM','066002 - Corporate Systems Opera','B10 Office/Cube 20','Udhayakumar.Parerikkal@neustar.biz','(571) 434-5752','(571) 239-0996',0),(25,'Duan','Harvey','s_dharve',NULL,'SPP0001359','Contractor',NULL,NULL,'Duan.Harvey@neustar.biz',NULL,NULL,0),(26,'Thiyagarajan','Loganathan','tloganat',NULL,NULL,'Contractor - ICS',NULL,'Building 8, Sterling','Thiyagarajan.Loganathan@neustar.biz','571-434-5191','571-208-7764',0),(27,'Michael','Kelley','s_mkelle',NULL,NULL,'Contractor',NULL,NULL,'Michael.Kelley@neustar.biz','703-464-4059','3042573495',0),(28,'Troy','Bateman','tbateman',NULL,'SPP0000944','Contractor - Cyntherian, LLC',NULL,NULL,'Troy.Bateman@neustar.biz',NULL,NULL,2),(29,'Prashant','Konnur','pkonnur',NULL,'004058','Sr Storage Engr','005168 - Storage & Back-up',NULL,'Prashant.Konnur@neustar.biz','571-434-5648',NULL,0),(30,'Kenneth','Manning','kmanning',NULL,'003281','Sr Sales Eng','004422 - Neusentry Product Devel',NULL,'Kenneth.Manning@neustar.biz','(202) 533-2713',NULL,0),(31,'James','Webster','jawebste',NULL,'003181','Sr Systems Admin','005106 - Data Center Facility Op',NULL,'James.Webster@neustar.biz','(303) 802-1380',NULL,0),(32,'Scott','Womersley','swomersl',NULL,'003182','Sr Microsoft System Engg Admin','005106 - Data Center Facility Op','Denver','Scott.Womersley@neustar.biz','(303) 802-1381',NULL,0),(33,'Sohrab','Aidun','saidun',NULL,'004129','Sr Systems Admin Unix','005122 - Ops & Eng Other','Building 10 Cube 1238','Sohrab.Aidun@neustar.biz','(703)464-4292','(571) 533-7856',0),(34,'Michael','McNicholl','mmcnicho',NULL,'001141','Dir Svce Mgmt','005102 - Planning and Metrics','B8 Office/Cube 77','Michael.McNicholl@neustar.biz','(571) 434-5754','703-463-7354',0),(35,'Nagaraju','Ananthula','nananthu',NULL,'SPP0001146','Contractor',NULL,NULL,'Nagaraju.Ananthula@neustar.biz',NULL,NULL,0),(36,'Seramavalavan','Vilvanathan','svilvana',NULL,'SPP0000190','Contractor - ICS',NULL,NULL,'Seramavalavan.Vilvanathan@neustar.biz',NULL,NULL,0),(37,'Michael','Feinstein','mfeins',NULL,'004242','Business Analyst','005102 - Planning and Metrics',NULL,'michael.feinstein@neustar.biz','(571)434-6819',NULL,0),(38,'Justin','Lewis','jlewis',NULL,NULL,'Contractor',NULL,NULL,'Justin.Lewis@neustar.biz','(571) 434-4685',NULL,0),(39,'Christine','Ofner','cofner',NULL,'002567','Sr Technical Project Mgr','005133 - I&O Project Management','B10 Office/Cube 30','Christine.Ofner@neustar.biz','(571) 434-3492',NULL,0),(40,'Shanmugam','Ponnuswamy','sponnusw',NULL,NULL,'Contractor',NULL,NULL,'Shanmugam.Ponnuswamy@neustar.biz',NULL,NULL,0),(41,'Ganesh','Murthy','gmurthy',NULL,'SPP0001026','Contractor',NULL,NULL,'Ganesh.Murthy@neustar.biz',NULL,NULL,0),(42,'Hemant','Sant','hsant',NULL,'SPP0000894','Contractor - ICS',NULL,NULL,'Hemant.Sant@neustar.biz',NULL,'011-91-887906869',0),(43,'Edward','Beuerlein','ebeuerle',NULL,'002827','Sr Security Engr','005108 - Security Operations','B8 Office/Cube 39','Edward.Beuerlein@neustar.biz','571-246-0471','571-246-0471',0),(44,'Rajan','Gurusamy','rgurusam',NULL,'SPP0000176','Contractor - ICS',NULL,NULL,'Rajan.Gurusamy@neustar.biz','919578925920','919578925920',0),(45,'Paul','Yaroschak','pyarosch',NULL,'003595','Staff Security Engr','005105 - SOC',NULL,'Paul.Yaroschak@neustar.biz','703-464-4209',NULL,0),(46,'William','Zegeer','wzegeer',NULL,'003275','Sr Security Engr','005108 - Security Operations','Sterling Building 8','William.Zegeer@neustar.biz','(571) 434-5932','5712497710',0),(47,'Navin','Theruvingal','ntheruvi',NULL,NULL,'Contractor',NULL,NULL,'Navin.Theruvingal@neustar.biz',NULL,NULL,0),(48,'Ekanth','Reddy','s_ereddy',NULL,NULL,'Contractor',NULL,NULL,'Ekanth.Reddy@neustar.biz',NULL,NULL,0),(49,'Patricia','Cruz','pcruz',NULL,'004007','Staff Storage Engr','005168 - Storage & Back-up',NULL,'Patricia.Cruz@neustar.biz','703-464-4058',NULL,0),(50,'John','Bennett','jbennett',NULL,'000850','Staff Sys Admin','005120 - Application Support',NULL,'John.Bennett@neustar.biz','(571) 434-5707','(571) 425-8345',0),(51,'Sanjay','Shivam','sshivam',NULL,NULL,'Contractor',NULL,NULL,'Sanjay.Shivam@neustar.biz',NULL,NULL,0),(52,'Lavanya','Desai','LDESAI',NULL,'001220','Sr Software Engr','005230 - Corporate Systems','RT3 Office/Cube 2173','Lavanya.Desai@neustar.biz','(571) 434-3458','240-418-9631',0),(53,'Ramachandra','Reddy','rareddy',NULL,'SPP0000274','Contractor',NULL,NULL,'Ramachandra.Reddy@neustar.biz',NULL,NULL,0),(54,'Daniel','Phillips','dphillip',NULL,'004121','Software Engr','005227 - Data Warehouse',NULL,'Daniel.Phillips@neustar.biz','571-434-5530',NULL,0),(55,'Zeshan','Nasir','znasir',NULL,NULL,'Contractor','005107 - Network Operations Cent',NULL,'Zeshan.Nasir@neustar.biz','(571) 434-5547',NULL,0),(56,'Mehrdad','Karjoo','mkarjoo',NULL,'004335','Sr. Systems Administrator',NULL,NULL,'Mehrdad.Karjoo@neustar.biz','571-434-5388',NULL,0),(57,'Alex','Skinner','askinner',NULL,'002485','Staff Sys Admin','005223 - Software Dev - Registry','1-(502)653-3851','Alex.Skinner@neustar.biz','(502) 653-3851',' ',0),(58,'Manisha','Nandedkar','MNANDEDK',NULL,'003069','Sr Bus Systems Analyst','005230 - Corporate Systems','RT3 Office/Cube 2180','Manisha.Nandedkar@neustar.biz','(571) 434-5438',NULL,0),(59,'Ray','Lewis','rlewis',NULL,'002749','Sr Systems Engr','005237 - Corporate Systems - Saa','B8 Office/Cube 31','Ray.Lewis@neustar.biz','(703) 464-4054','(571) 208-4990',0),(60,'Alethia','Tippin','atippin',NULL,'004204','Project Coordinator','005224 - Program Management','RT3','Alethia.Tippin@neustar.biz','571.434.5604',NULL,0),(61,'Brian','Darlage','bdarlage',NULL,'002648','Sr Prod Support Rep Tier 1','005333 - Business Operations Oth',NULL,'Brian.Darlage@neustar.biz','(502) 653-3839','(571) 354-9378 w',0),(62,'James','Rector','jrector',NULL,'002543','Solutions Specialist','005350 - Customer Service',NULL,'James.Rector@neustar.biz','(502) 653-3826',NULL,0),(63,'Pratima','Reddy','PREDDY',NULL,'004072','Mgr Financial Apps','005230 - Corporate Systems',NULL,'Pratima.Reddy@neustar.biz','571-434-5419',NULL,0),(64,'Brian','Gant','bgant',NULL,'003818','Sr Systems Engr','005160 - Strategic Tools & Solut',NULL,'Brian.Gant@neustar.biz','(703) 547-6060','(703) 341-7337',0),(65,'Jaipal','Banala','jbanala',NULL,'001754','Sr Software Engr','005230 - Corporate Systems','RT3 Office/Cube 2174','Jaipal.Banala@neustar.biz','571-434-5187',NULL,0),(66,'Brenda','Gilbert','bgilbert',NULL,'002452','Dir QA','005234 - QA Enterprise','B10 Office/Cube 2148','Brenda.Gilbert@neustar.biz','(571) 434-4669','(614) 783-7103',0),(68,'Suresh','Bodepudi','sbodepud',NULL,'004304','Sr. Systems Admin','005230 - Corporate Systems',NULL,'Suresh.Bodepudi@neustar.biz','571-434-3582',NULL,0),(70,'Anand','Rao','arao',NULL,'000809','Industry Standards Mgr','005312 - OMS Customer Support an','RT, 2058','anand.rao@neustar.biz','(571) 434-3504','571-344-9627',0),(71,'Andi','Pollard','apollard',NULL,'003986','HR Bus Partner','001252 - Employee Relations',NULL,'Andi.Pollard@neustar.biz','(502)653-3953',NULL,0),(73,'Edward','Barker','ebarker',NULL,'000658','Dir NPAC Architecture','005132 - Software Development','RT3 Office/Cube 3169','Edward.Barker@neustar.biz','(571) 434-5566','(571) 243-0215',0),(74,'Manjunath','Bandaru','mbandaru',NULL,NULL,'Contractor',NULL,NULL,'Manjunath.Bandaru@neustar.biz',NULL,NULL,0),(75,'Gary','Morgenstern','gmorgens',NULL,'003885','Sr Business Analyst','005102 - Planning and Metrics','BLD10 Cube 1124','Gary.Morgenstern@neustar.biz','(703) 547-6018','1-571-643-6398',0),(76,'Daniel','Bateman','s_dbatem',NULL,NULL,'Contractor',NULL,NULL,'Daniel.Bateman@neustar.biz','304 615 2786','304 615 2786',2),(77,'Alan','Davis','adavis',NULL,'002425','Sr Systems Admin','005120 - Application Support','RT3 Cube 3229','Alan.Davis@neustar.biz','(571) 434-5556','571-425-1409',0),(78,'Bobby','Choochan','bchoocha',NULL,'000783','Principal Security Engr','005108 - Security Operations','B8 Office/Cube 34','bobby.choochan@neustar.biz','(571) 434-5623','(571) 235-0744',0),(79,'Kevin','Hansen','kehansen',NULL,'002315','NOC Analyst','005107 - Network Operations Cent','Bldg 8, NOC','Kevin.Hansen@neustar.biz','(571) 434-5710','(202) 802-1725',0),(80,'Nicolas','Georgel','ngeorgel',NULL,'004127','Mgr Systems Admin','005165 - Shared Systems Administ','BLD8-137','Nicolas.Georgel@neustar.biz','571-434-5131','571-247-4075',0),(81,'Vellore Santhanagopal','Nanda Gopal','vgopal',NULL,'SPP0000303','Contractor',NULL,NULL,'VelloreSanthanagopal.NandaGopal@neustar.biz',NULL,NULL,0);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2013-12-02 20:57:32
