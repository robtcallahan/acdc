-- phpMyAdmin SQL Dump
-- version 3.5.0-rc2
-- http://www.phpmyadmin.net
--
-- Host: chopcprvt2.nc.neustar.com
-- Generation Time: Oct 23, 2014 at 12:54 PM
-- Server version: 5.1.67
-- PHP Version: 5.3.3

-- SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
-- SET time_zone = "+00:00";

--
-- Database: `acdc`
--

-- --------------------------------------------------------

--
-- Table structure for table `placeholder`
--

DROP TABLE IF EXISTS `placeholder`;
CREATE TABLE IF NOT EXISTS `placeholder` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `locationId` int(5) NOT NULL,
  `cabinetTypeId` int(5) NOT NULL,
  `text` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `x` int(5) NOT NULL,
  `y` int(5) NOT NULL,
  `rotation` decimal(5,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `locationId` (`locationId`),
  KEY `cabinetTypeId` (`cabinetTypeId`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=6 ;

--
-- Dumping data for table `placeholder`
--

INSERT INTO `placeholder` (`locationId`, `cabinetTypeId`, `text`, `x`, `y`, `rotation`) VALUES

-- POD 1 C
(14, 21,   'RPP', 4,  4,   0.00),
(14, 21,   'RPP', 5,  4,   0.00),
(14, 19,  'P1C2', 4,  6, -90.00),
(14, 19,  'P1C3', 4,  7, -90.00),
(14, 19,  'P1C4', 4,  8, -90.00),
(14, 19,  'P1C5', 4,  9, -90.00),
(14, 19,  'P1C6', 4, 10, -90.00),
(14, 19,  'P1C7', 4, 11, -90.00),
(14, 19,  'P1C8', 4, 12, -90.00),
(14, 19,  'P1C9', 4, 13, -90.00),
(14, 19, 'P1C10', 4, 14, -90.00),
(14, 19, 'P1C11', 4, 15, -90.00),
(14, 19, 'P1C12', 4, 16, -90.00),
(14, 19, 'P1C13', 4, 17, -90.00),
(14, 19, 'P1C14', 4, 18, -90.00),
(14, 19, 'P1C15', 4, 19, -90.00),

-- Perf Tiles
(14, 22,      '', 6,  5,   0.00),
(14, 22,      '', 7,  5,   0.00),
(14, 22,      '', 6,  6,   0.00),
(14, 22,      '', 6,  7,   0.00),
(14, 22,      '', 6,  8,   0.00),
(14, 22,      '', 6,  9,   0.00),
(14, 22,      '', 7,  9,   0.00),
(14, 22,      '', 6, 10,   0.00),
(14, 22,      '', 7, 10,   0.00),
(14, 22,      '', 6, 11,   0.00),
(14, 22,      '', 7, 11,   0.00),
(14, 22,      '', 6, 12,   0.00),
(14, 22,      '', 7, 12,   0.00),
(14, 22,      '', 6, 13,   0.00),
(14, 22,      '', 7, 13,   0.00),
(14, 22,      '', 6, 14,   0.00),
(14, 22,      '', 7, 14,   0.00),
(14, 22,      '', 6, 15,   0.00),
(14, 22,      '', 7, 15,   0.00),
(14, 22,      '', 7, 16,   0.00),
(14, 22,      '', 7, 17,   0.00),
(14, 22,      '', 7, 18,   0.00),


-- POD 1 B
(14, 21,   'RPP',  8,  4,  0.00),
(14, 21,   'RPP',  9,  4,  0.00),

-- POD 1 A
(14, 21,   'RPP', 12,  4,   0.00),
(14, 21,   'RPP', 13,  4,   0.00),
(14, 19,  'P1A2', 12,  6, -90.00),
(14, 19,  'P1A3', 12,  7, -90.00),
(14, 19,  'P1A4', 12,  8, -90.00),
(14, 19,  'P1A5', 12,  9, -90.00),
(14, 19,  'P1A6', 12, 10, -90.00),
(14, 19,  'P1A7', 12, 11, -90.00),
(14, 19,  'P1A8', 12, 12, -90.00),
(14, 19,  'P1A9', 12, 13, -90.00),
(14, 19, 'P1A10', 12, 14, -90.00),
(14, 19, 'P1A11', 12, 15, -90.00),
(14, 19, 'P1A12', 12, 16, -90.00),
(14, 19, 'P1A13', 12, 17, -90.00),
(14, 19, 'P1A14', 12, 18, -90.00),
(14, 19, 'P1A15', 12, 19, -90.00),

-- TELCO 1
(14, 19,  'T1A6', 20,  6, 0),
(14, 19,  'T1A5', 21,  6, 0),
(14, 19,  'T1A4', 22,  6, 0),
(14, 19,  'T1A3', 23,  6, 0),
(14, 19,  'T1A2', 24,  6, 0),
(14, 19,  'T1A1', 25,  6, 0),

(14, 19,  'T1B6', 20, 10, 0),
(14, 19,  'T1B5', 21, 10, 0),
(14, 19,  'T1B4', 22, 10, 0),
(14, 19,  'T1B3', 23, 10, 0),
(14, 19,  'T1B2', 24, 10, 0),
(14, 21,   'RPP', 25, 10, 0),
(14, 21,   'RPP', 25, 11, 0),

-- NET 1
(14, 19,  'N1E8', 20, 16, 0),
(14, 19,  'N1E7', 21, 16, 0),
(14, 19,  'N1E6', 22, 16, 0),
(14, 19,  'N1E5', 23, 16, 0),
(14, 19,  'N1E4', 24, 16, 0),
(14, 19,  'N1E3', 25, 16, 0),
(14, 19,  'N1E2', 26, 16, 0),
(14, 19,  'N1E1', 27, 16, 0),

(14, 19,  'N1D8', 20, 20, 0),
(14, 19,  'N1D7', 21, 20, 0),
(14, 19,  'N1D6', 22, 20, 0),
(14, 19,  'N1D5', 23, 20, 0),
(14, 19,  'N1D4', 24, 20, 0),
(14, 19,  'N1D3', 25, 20, 0),
(14, 19,  'N1D2', 26, 20, 0),
(14, 19,  'N1D1', 27, 20, 0),

(14, 19,  'N1C8', 20, 24, 0),
(14, 19,  'N1C7', 21, 24, 0),
(14, 19,  'N1C6', 22, 24, 0),
(14, 19,  'N1C5', 23, 24, 0),
(14, 19,  'N1C4', 24, 24, 0),
(14, 19,  'N1C3', 25, 24, 0),
(14, 19,  'N1C2', 26, 24, 0),
(14, 21,   'RPP', 27, 24, 0),
(14, 21,   'RPP', 27, 25, 0),

(14, 19,  'N1B8', 20, 28, 0),
(14, 19,  'N1B7', 21, 28, 0),
(14, 19,  'N1B6', 22, 28, 0),
(14, 19,  'N1B5', 23, 28, 0),
(14, 19,  'N1B4', 24, 28, 0),
(14, 19,  'N1B3', 25, 28, 0),
(14, 19,  'N1B2', 26, 28, 0),
(14, 19,  'N1B1', 27, 28, 0),

(14, 19,  'N1A8', 20, 32, 0),
(14, 19,  'N1A7', 21, 32, 0),
(14, 19,  'N1A6', 22, 32, 0),
(14, 19,  'N1A5', 23, 32, 0),
(14, 19,  'N1A4', 24, 32, 0),
(14, 19,  'N1A3', 25, 32, 0),
(14, 19,  'N1A2', 26, 32, 0),
(14, 19,  'N1A1', 27, 32, 0),

-- NET 2
(14, 19,  'N2E1', 34,  6, 0),
(14, 19,  'N2E2', 35,  6, 0),
(14, 19,  'N2E3', 36,  6, 0),
(14, 19,  'N2E4', 37,  6, 0),
(14, 19,  'N2E5', 38,  6, 0),
(14, 19,  'N2E6', 39,  6, 0),
(14, 19,  'N2E7', 40,  6, 0),
(14, 19,  'N2E8', 41,  6, 0),

(14, 19,  'N2D1', 34, 10, 0),
(14, 19,  'N2D2', 35, 10, 0),
(14, 19,  'N2D3', 36, 10, 0),
(14, 19,  'N2D4', 37, 10, 0),
(14, 19,  'N2D5', 38, 10, 0),
(14, 19,  'N2D6', 39, 10, 0),
(14, 19,  'N2D7', 40, 10, 0),
(14, 19,  'N2D8', 41, 10, 0),

(14, 21,   'RPP', 34, 14, 0),
(14, 21,   'RPP', 34, 15, 0),
(14, 19,  'N2C2', 35, 14, 0),
(14, 19,  'N2C3', 36, 14, 0),
(14, 19,  'N2C4', 37, 14, 0),
(14, 19,  'N2C5', 38, 14, 0),
(14, 19,  'N2C6', 39, 14, 0),
(14, 19,  'N2C7', 40, 14, 0),
(14, 19,  'N2C8', 41, 14, 0),

(14, 19,  'N2B1', 34, 18, 0),
(14, 19,  'N2B2', 35, 18, 0),
(14, 19,  'N2B3', 36, 18, 0),
(14, 19,  'N2B4', 37, 18, 0),
(14, 19,  'N2B5', 38, 18, 0),
(14, 19,  'N2B6', 39, 18, 0),
(14, 19,  'N2B7', 40, 18, 0),
(14, 19,  'N2B8', 41, 18, 0),

(14, 19,  'N2A1', 34, 22, 0),
(14, 19,  'N2A2', 35, 22, 0),
(14, 19,  'N2A3', 36, 22, 0),
(14, 19,  'N2A4', 37, 22, 0),
(14, 19,  'N2A5', 38, 22, 0),
(14, 19,  'N2A6', 39, 22, 0),
(14, 19,  'N2A7', 40, 22, 0),
(14, 19,  'N2A8', 41, 22, 0),

-- TELCO 1
(14, 21,   'RPP', 36, 28, 0),
(14, 21,   'RPP', 36, 29, 0),
(14, 19,  'T2B2', 37, 28, 0),
(14, 19,  'T2B3', 38, 28, 0),
(14, 19,  'T2B4', 39, 28, 0),
(14, 19,  'T2B5', 40, 28, 0),
(14, 19,  'T2B6', 41, 28, 0),

(14, 19,  'T2A1', 36, 32, 0),
(14, 19,  'T2A2', 37, 32, 0),
(14, 19,  'T2A3', 38, 32, 0),
(14, 19,  'T2A4', 39, 32, 0),
(14, 19,  'T2A5', 40, 32, 0),
(14, 19,  'T2A6', 41, 32, 0),

--  POD 2 A
(14, 21,   'RPP', 48,  4,   0.00),
(14, 21,   'RPP', 49,  4,   0.00),
(14, 19,  'P2A2', 48,  6, -90.00),
(14, 19,  'P2A3', 48,  7, -90.00),
(14, 19,  'P2A4', 48,  8, -90.00),
(14, 19,  'P2A5', 48,  9, -90.00),
(14, 19,  'P2A6', 48, 10, -90.00),
(14, 19,  'P2A7', 48, 11, -90.00),
(14, 19,  'P2A8', 48, 12, -90.00),
(14, 19,  'P2A9', 48, 13, -90.00),
(14, 19, 'P2A10', 48, 14, -90.00),
(14, 19, 'P2A11', 48, 15, -90.00),
(14, 19, 'P2A12', 48, 16, -90.00),
(14, 19, 'P2A13', 48, 17, -90.00),
(14, 19, 'P2A14', 48, 18, -90.00),
(14, 19, 'P2A15', 48, 19, -90.00),

-- Perf Tiles
(14, 22,      '', 55,  5,   0.00),
(14, 22,      '', 55,  6,   0.00),
(14, 22,      '', 55,  7,   0.00),
(14, 22,      '', 54,  8,   0.00),
(14, 22,      '', 55,  8,   0.00),
(14, 22,      '', 54,  9,   0.00),
(14, 22,      '', 55,  9,   0.00),
(14, 22,      '', 54, 10,   0.00),
(14, 22,      '', 55, 10,   0.00),
(14, 22,      '', 54, 11,   0.00),
(14, 22,      '', 55, 11,   0.00),
(14, 22,      '', 54, 12,   0.00),
(14, 22,      '', 55, 12,   0.00),
(14, 22,      '', 54, 13,   0.00),
(14, 22,      '', 55, 13,   0.00),
(14, 22,      '', 54, 14,   0.00),
(14, 22,      '', 55, 14,   0.00),
(14, 22,      '', 54, 15,   0.00),
(14, 22,      '', 55, 15,   0.00),
(14, 22,      '', 54, 16,   0.00),
(14, 22,      '', 54, 17,   0.00),
(14, 22,      '', 54, 18,   0.00),


-- POD 2 B
(14, 21,   'RPP', 52,  4,   0.00),
(14, 21,   'RPP', 53,  4,   0.00),
(14, 19,  'P2B2', 52,  6, -90.00),
(14, 19,  'P2B3', 52,  7, -90.00),
(14, 19,  'P2B4', 52,  8, -90.00),
(14, 19,  'P2B5', 52,  9, -90.00),
(14, 19,  'P2B6', 52, 10, -90.00),
(14, 19,  'P2B7', 52, 11, -90.00),
(14, 19,  'P2B8', 52, 12, -90.00),
(14, 19,  'P2B9', 52, 13, -90.00),
(14, 19, 'P2B10', 52, 14, -90.00),
(14, 19, 'P2B11', 52, 15, -90.00),
(14, 19, 'P2B12', 52, 16, -90.00),
(14, 19, 'P2B13', 52, 17, -90.00),
(14, 19, 'P2B14', 52, 18, -90.00),
(14, 19, 'P2B15', 52, 19, -90.00),

-- POD 2 C
(14, 21,   'RPP', 56,  4,  0.00),
(14, 21,   'RPP', 57,  4,  0.00),
(14, 19,  'P2C2', 56,  6, -90.00),
(14, 19,  'P2C3', 56,  7, -90.00),
(14, 19,  'P2C4', 56,  8, -90.00),
(14, 19,  'P2C5', 56,  9, -90.00),
(14, 19,  'P2C6', 56, 10, -90.00),
(14, 19,  'P2C7', 56, 11, -90.00),
(14, 19,  'P2C8', 56, 12, -90.00),
(14, 19,  'P2C9', 56, 13, -90.00),
(14, 19, 'P2C10', 56, 14, -90.00),
(14, 19, 'P2C11', 56, 15, -90.00),
(14, 19, 'P2C12', 56, 16, -90.00),
(14, 19, 'P2C13', 56, 17, -90.00),
(14, 19, 'P2C14', 56, 18, -90.00),
(14, 19, 'P2C15', 56, 19, -90.00);
