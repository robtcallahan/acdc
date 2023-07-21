-- phpMyAdmin SQL Dump
-- version 3.5.0-rc2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Oct 23, 2014 at 03:50 PM
-- Server version: 5.1.67
-- PHP Version: 5.3.3

-- SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
-- SET time_zone = "+00:00";

--
-- Database: `acdc`
--

-- --------------------------------------------------------

--
-- Table structure for table `text`
--

DROP TABLE IF EXISTS `text`;
CREATE TABLE IF NOT EXISTS `text` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `locationId` int(5) NOT NULL,
  `string` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `font` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `color` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `x` decimal(5,2) NOT NULL,
  `y` decimal(5,2) NOT NULL,
  `rotation` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `locationId` (`locationId`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

--
-- Dumping data for table `text`
--

INSERT INTO `text` (`locationId`, `string`, `font`, `color`, `x`, `y`, `rotation`) VALUES

-- Room names
(14, 'Pod 1', 'bold 14pt Calibri', 'black', 8.00, 3.00, 0),
(14, 'Pod 2', 'bold 14pt Calibri', 'black', 52.00, 3.00, 0),
(14, 'Telco 1', 'bold 14pt Calibri', 'black', 23.00, 5.00, 0),
(14, 'Network 1', 'bold 14pt Calibri', 'black', 22.50, 15.00, 0),
(14, 'Network 2', 'bold 14pt Calibri', 'black', 36.50, 5.00, 0),
(14, 'Telco 2', 'bold 14pt Calibri', 'black', 37.00, 27.00, 0),

-- Pod 1
(14, 'C', 'bold 12pt Calibri', 'black',  4.8, 3.75, 0),
(14, 'B', 'bold 12pt Calibri', 'black',  8.8, 3.75, 0),
(14, 'A', 'bold 12pt Calibri', 'black', 12.8, 3.75, 0),

(14,  '1', 'bold 12pt Calibri', 'black', 2.50,  4.75, 0),
(14,  '2', 'bold 12pt Calibri', 'black', 2.50,  5.75, 0),
(14,  '3', 'bold 12pt Calibri', 'black', 2.50,  6.75, 0),
(14,  '4', 'bold 12pt Calibri', 'black', 2.50,  7.75, 0),
(14,  '5', 'bold 12pt Calibri', 'black', 2.50,  8.75, 0),
(14,  '6', 'bold 12pt Calibri', 'black', 2.50,  9.75, 0),
(14,  '7', 'bold 12pt Calibri', 'black', 2.50, 10.75, 0),
(14,  '8', 'bold 12pt Calibri', 'black', 2.50, 11.75, 0),
(14,  '9', 'bold 12pt Calibri', 'black', 2.50, 12.75, 0),
(14, '10', 'bold 12pt Calibri', 'black', 2.25, 13.75, 0),
(14, '11', 'bold 12pt Calibri', 'black', 2.25, 14.75, 0),
(14, '12', 'bold 12pt Calibri', 'black', 2.25, 15.75, 0),
(14, '13', 'bold 12pt Calibri', 'black', 2.25, 16.75, 0),
(14, '14', 'bold 12pt Calibri', 'black', 2.25, 17.75, 0),
(14, '15', 'bold 12pt Calibri', 'black', 2.25, 18.75, 0),

-- Telco 1
(14, 'A', 'bold 12pt Calibri', 'black', 18.5,  7.25, 0),
(14, 'B', 'bold 12pt Calibri', 'black', 18.5, 11.25, 0),

(14, '6', 'bold 12pt Calibri', 'black', 20.3,  5.75, 0),
(14, '5', 'bold 12pt Calibri', 'black', 21.3,  5.75, 0),
(14, '4', 'bold 12pt Calibri', 'black', 22.3,  5.75, 0),
(14, '3', 'bold 12pt Calibri', 'black', 23.3,  5.75, 0),
(14, '2', 'bold 12pt Calibri', 'black', 24.3,  5.75, 0),
(14, '1', 'bold 12pt Calibri', 'black', 25.3,  5.75, 0),

-- Network 1
(14, 'E', 'bold 12pt Calibri', 'black', 18.5, 17.25, 0),
(14, 'D', 'bold 12pt Calibri', 'black', 18.5, 21.25, 0),
(14, 'C', 'bold 12pt Calibri', 'black', 18.5, 25.25, 0),
(14, 'B', 'bold 12pt Calibri', 'black', 18.5, 29.25, 0),
(14, 'A', 'bold 12pt Calibri', 'black', 18.5, 33.25, 0),

(14, '8', 'bold 12pt Calibri', 'black', 20.3, 15.75, 0),
(14, '7', 'bold 12pt Calibri', 'black', 21.3, 15.75, 0),
(14, '6', 'bold 12pt Calibri', 'black', 22.3, 15.75, 0),
(14, '5', 'bold 12pt Calibri', 'black', 23.3, 15.75, 0),
(14, '4', 'bold 12pt Calibri', 'black', 24.3, 15.75, 0),
(14, '3', 'bold 12pt Calibri', 'black', 25.3, 15.75, 0),
(14, '2', 'bold 12pt Calibri', 'black', 26.3, 15.75, 0),
(14, '1', 'bold 12pt Calibri', 'black', 27.3, 15.75, 0),

-- Network 2
(14, 'E', 'bold 12pt Calibri', 'black', 32.5,  7.25, 0),
(14, 'D', 'bold 12pt Calibri', 'black', 32.5, 11.25, 0),
(14, 'C', 'bold 12pt Calibri', 'black', 32.5, 15.25, 0),
(14, 'B', 'bold 12pt Calibri', 'black', 32.5, 19.25, 0),
(14, 'A', 'bold 12pt Calibri', 'black', 32.5, 23.25, 0),

(14, '1', 'bold 12pt Calibri', 'black', 34.3,  5.75, 0),
(14, '2', 'bold 12pt Calibri', 'black', 35.3,  5.75, 0),
(14, '3', 'bold 12pt Calibri', 'black', 36.3,  5.75, 0),
(14, '4', 'bold 12pt Calibri', 'black', 37.3,  5.75, 0),
(14, '5', 'bold 12pt Calibri', 'black', 38.3,  5.75, 0),
(14, '6', 'bold 12pt Calibri', 'black', 39.3,  5.75, 0),
(14, '7', 'bold 12pt Calibri', 'black', 40.3,  5.75, 0),
(14, '8', 'bold 12pt Calibri', 'black', 41.3,  5.75, 0),

--  Telco 2
(14, 'B', 'bold 12pt Calibri', 'black', 32.5, 29.25, 0),
(14, 'A', 'bold 12pt Calibri', 'black', 32.5, 33.25, 0),

(14, '1', 'bold 12pt Calibri', 'black', 36.3, 27.75, 0),
(14, '2', 'bold 12pt Calibri', 'black', 37.3, 27.75, 0),
(14, '3', 'bold 12pt Calibri', 'black', 38.3, 27.75, 0),
(14, '4', 'bold 12pt Calibri', 'black', 39.3, 27.75, 0),
(14, '5', 'bold 12pt Calibri', 'black', 40.3, 27.75, 0),
(14, '6', 'bold 12pt Calibri', 'black', 41.3, 27.75, 0),

-- Pod 2
(14, 'A', 'bold 12pt Calibri', 'black', 48.8, 3.75, 0),
(14, 'B', 'bold 12pt Calibri', 'black', 52.8, 3.75, 0),
(14, 'C', 'bold 12pt Calibri', 'black', 56.8, 3.75, 0),

(14,  '1', 'bold 12pt Calibri', 'black', 46.50,  4.75, 0),
(14,  '2', 'bold 12pt Calibri', 'black', 46.50,  5.75, 0),
(14,  '3', 'bold 12pt Calibri', 'black', 46.50,  6.75, 0),
(14,  '4', 'bold 12pt Calibri', 'black', 46.50,  7.75, 0),
(14,  '5', 'bold 12pt Calibri', 'black', 46.50,  8.75, 0),
(14,  '6', 'bold 12pt Calibri', 'black', 46.50,  9.75, 0),
(14,  '7', 'bold 12pt Calibri', 'black', 46.50, 10.75, 0),
(14,  '8', 'bold 12pt Calibri', 'black', 46.50, 11.75, 0),
(14,  '9', 'bold 12pt Calibri', 'black', 46.50, 12.75, 0),
(14, '10', 'bold 12pt Calibri', 'black', 46.25, 13.75, 0),
(14, '11', 'bold 12pt Calibri', 'black', 46.25, 14.75, 0),
(14, '12', 'bold 12pt Calibri', 'black', 46.25, 15.75, 0),
(14, '13', 'bold 12pt Calibri', 'black', 46.25, 16.75, 0),
(14, '14', 'bold 12pt Calibri', 'black', 46.25, 17.75, 0),
(14, '15', 'bold 12pt Calibri', 'black', 46.25, 18.75, 0)

;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `text`
--
ALTER TABLE `text`
  ADD CONSTRAINT `text_ibfk_1` FOREIGN KEY (`locationId`) REFERENCES `location` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
