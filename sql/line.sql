-- phpMyAdmin SQL Dump
-- version 3.5.0-rc2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jun 30, 2015 at 01:59 PM
-- Server version: 5.1.67
-- PHP Version: 5.3.3

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `acdc`
--

-- --------------------------------------------------------

--
-- Table structure for table `line`
--

DROP TABLE IF EXISTS `line`;
CREATE TABLE IF NOT EXISTS `line` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `locationId` int(5) NOT NULL,
  `top` decimal(7,2) NOT NULL DEFAULT '0.00',
  `left` decimal(7,2) NOT NULL DEFAULT '0.00',
  `width` decimal(7,2) NOT NULL DEFAULT '0.00',
  `height` decimal(7,2) NOT NULL DEFAULT '0.00',
  `angle` decimal(5,2) NOT NULL DEFAULT '0.00',
  `scaleX` decimal(7,2) NOT NULL DEFAULT '1.00',
  `scaleY` decimal(7,2) NOT NULL DEFAULT '1.00',
  `x1` decimal(7,2) NOT NULL DEFAULT '0.00',
  `y1` decimal(7,2) NOT NULL DEFAULT '0.00',
  `x2` decimal(7,2) NOT NULL DEFAULT '0.00',
  `y2` decimal(7,2) NOT NULL DEFAULT '0.00',
  `color` varchar(10) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'black',
  `thickness` float(4,2) NOT NULL DEFAULT '3.00',
  `cap` varchar(10) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'butt',
  PRIMARY KEY (`id`),
  KEY `locationId` (`locationId`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=71 ;

--
-- Dumping data for table `line`
--

INSERT INTO `line` (`id`, `locationId`, `top`, `left`, `width`, `height`, `angle`, `scaleX`, `scaleY`, `x1`, `y1`, `x2`, `y2`, `color`, `thickness`, `cap`) VALUES
(1, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 2.00, 2.00, 14.00, 2.00, 'black', 3.00, 'butt'),
(2, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 15.50, 2.00, 16.00, 2.00, 'black', 3.00, 'butt'),
(4, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 16.00, 2.00, 16.00, 24.00, 'black', 3.00, 'butt'),
(5, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 16.00, 24.00, 15.50, 24.00, 'black', 3.00, 'butt'),
(8, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 12.50, 24.00, 2.00, 24.00, 'black', 3.00, 'butt'),
(9, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 2.00, 24.00, 2.00, 2.00, 'black', 3.00, 'butt'),
(10, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 18.00, 4.00, 26.50, 4.00, 'black', 3.00, 'butt'),
(13, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 29.50, 4.00, 30.00, 4.00, 'black', 3.00, 'butt'),
(14, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 30.00, 4.00, 30.00, 36.00, 'black', 3.00, 'butt'),
(15, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 30.00, 36.00, 29.50, 36.00, 'black', 3.00, 'butt'),
(18, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 26.50, 36.00, 18.00, 36.00, 'black', 3.00, 'butt'),
(19, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 18.00, 36.00, 18.00, 4.00, 'black', 3.00, 'butt'),
(20, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 18.00, 14.00, 30.00, 14.00, 'black', 3.00, 'butt'),
(21, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 32.00, 4.00, 32.50, 4.00, 'black', 3.00, 'butt'),
(24, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 35.50, 4.00, 44.00, 4.00, 'black', 3.00, 'butt'),
(25, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 44.00, 4.00, 44.00, 36.00, 'black', 3.00, 'butt'),
(26, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 44.00, 36.00, 35.50, 36.00, 'black', 3.00, 'butt'),
(29, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 32.50, 36.00, 32.00, 36.00, 'black', 3.00, 'butt'),
(30, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 32.00, 36.00, 32.00, 4.00, 'black', 3.00, 'butt'),
(31, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 32.00, 26.00, 44.00, 26.00, 'black', 3.00, 'butt'),
(32, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 46.00, 2.00, 46.50, 2.00, 'black', 3.00, 'butt'),
(34, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 48.00, 2.00, 60.00, 2.00, 'black', 3.00, 'butt'),
(35, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 60.00, 2.00, 60.00, 24.00, 'black', 3.00, 'butt'),
(36, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 60.00, 24.00, 49.50, 24.00, 'black', 3.00, 'butt'),
(37, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 49.50, 24.00, 48.50, 23.00, 'black', 3.00, 'butt'),
(38, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 47.50, 23.00, 46.50, 24.00, 'black', 3.00, 'butt'),
(39, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 46.50, 24.00, 46.00, 24.00, 'black', 3.00, 'butt'),
(40, 14, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 1.00, 46.00, 24.00, 46.00, 2.00, 'black', 3.00, 'butt'),
(70, 14, 96.00, 96.00, 48.00, 0.00, 0.00, 1.00, 1.00, -24.00, 0.00, 24.00, 0.00, 'black', 3.00, 'butt');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `line`
--
ALTER TABLE `line`
  ADD CONSTRAINT `line_ibfk_1` FOREIGN KEY (`locationId`) REFERENCES `location` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

