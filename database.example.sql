/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE TABLE IF NOT EXISTS `accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Change Me',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `salt` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `properties` (
  `propertyID` int NOT NULL AUTO_INCREMENT,
  `ownerID` int DEFAULT NULL,
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `address2` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `province` varchar(25) COLLATE utf8mb4_general_ci NOT NULL,
  `city` varchar(25) COLLATE utf8mb4_general_ci NOT NULL,
  `country` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `postal` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `neighbourhood` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `garage` tinyint NOT NULL DEFAULT (0),
  `sqft` int NOT NULL,
  `transport` tinyint NOT NULL DEFAULT (0),
  `delisted` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`propertyID`) USING BTREE,
  KEY `FK_OwnerID` (`ownerID`) USING BTREE,
  CONSTRAINT `FK_properties_OwnerID` FOREIGN KEY (`ownerID`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `workspaces` (
  `workspaceID` int NOT NULL AUTO_INCREMENT,
  `ownerID` int NOT NULL,
  `propertyID` int NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `term` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `capacity` int NOT NULL DEFAULT (0),
  `price` double NOT NULL DEFAULT (0),
  `rating` decimal(2,1) DEFAULT NULL,
  `delisted` tinyint NOT NULL DEFAULT '1',
  `smoking_allowed` tinyint NOT NULL DEFAULT '0',
  `availability_date` date NOT NULL DEFAULT '2025-04-01',
  `image` longblob NOT NULL,
  PRIMARY KEY (`workspaceID`),
  KEY `FK_OwnerID` (`ownerID`),
  KEY `FK_propertyID` (`propertyID`),
  CONSTRAINT `FK_workspaces_OwnerID` FOREIGN KEY (`ownerID`) REFERENCES `accounts` (`id`),
  CONSTRAINT `FK_workspaces_propertyID` FOREIGN KEY (`propertyID`) REFERENCES `properties` (`propertyID`),
  CONSTRAINT `workspaces_chk_1` CHECK (((`rating` >= 0) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;