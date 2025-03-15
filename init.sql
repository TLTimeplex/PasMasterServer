-- Erstelle die Datenbank (falls noch nicht vorhanden)
CREATE DATABASE IF NOT EXISTS pasmaster;

-- Verwende die Datenbank
USE pasmaster;

-- Erstelle die Tabelle `users` (falls noch nicht vorhanden)
CREATE TABLE IF NOT EXISTS `Users` (
  `Login` varchar(100) NOT NULL COMMENT 'Username used for login',
  `System_ID` int NOT NULL AUTO_INCREMENT COMMENT 'ID in database for recognition',
  `Password_Hash` text NOT NULL COMMENT 'Password Hash used for gaining access to the api',
  PRIMARY KEY (`Login`),
  UNIQUE KEY `Users_UNIQUE` (`System_ID`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Erstelle die Tabelle `devices` (falls noch nicht vorhanden)
CREATE TABLE IF NOT EXISTS `Devices` (
  `System_ID` int NOT NULL,
  `Public_Key` text NOT NULL COMMENT 'Public RSA key part of the users device',
  `API_Token` varchar(100) DEFAULT NULL COMMENT 'Used for accessing the API without the password',
  `Token_Expire` datetime DEFAULT NULL COMMENT 'Until this time the token is usable to access the API. After that it is only used for unbaning a user if he uses a banned IPaddress.',
  `Device_ID` int NOT NULL AUTO_INCREMENT COMMENT 'Unique device ID, currently unused',
  `Device_Description` varchar(256) NOT NULL COMMENT 'A short message to identefy the device for the user itself',
  `Activated` int DEFAULT NULL COMMENT 'Shows if the Device was accepted by the user by any outher device yet.\nShows the DeviceID of the Device that accepted him',
  `Last_Connection` text COMMENT 'Last Used IP address. If divers token will be unvalided instantly.',
  PRIMARY KEY (`Device_ID`),
  KEY `Devices_Users_FK_1` (`Activated`),
  KEY `Devices_Users_FK` (`System_ID`),
  CONSTRAINT `Devices_Users_FK` FOREIGN KEY (`System_ID`) REFERENCES `Users` (`System_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Devices_Users_FK_1` FOREIGN KEY (`Activated`) REFERENCES `Devices` (`Device_ID`) ON DELETE SET NULL ON UPDATE CASCADE -- Need to be checked if it works
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Erstelle die Tabelle `data` (falls noch nicht vorhanden)
CREATE TABLE IF NOT EXISTS `Data_Relation` (
  `Data_ID` int NOT NULL AUTO_INCREMENT,
  `System_ID` int NOT NULL,
  `Timestamp` timestamp NOT NULL COMMENT 'Time when data was inserted or updated',
  PRIMARY KEY (`Data_ID`),
  KEY `Data_Relation_Users_FK` (`System_ID`),
  CONSTRAINT `Data_Relation_Users_FK` FOREIGN KEY (`System_ID`) REFERENCES `Users` (`System_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Erstelle die Tabelle `data` (falls noch nicht vorhanden)
CREATE TABLE IF NOT EXISTS `Data` (
  `Data_ID` int NOT NULL,
  `Device_ID` int NOT NULL,
  `Data` text NOT NULL COMMENT 'Encrypted Data',
  `Key` text NOT NULL COMMENT 'Encrypted AES key for decrypting the data',
  PRIMARY KEY (`Data_ID`, `Device_ID`),
  KEY `Data_Devices_FK` (`Device_ID`),
  CONSTRAINT `Data_Data_Relation_FK` FOREIGN KEY (`Data_ID`) REFERENCES `Data_Relation` (`Data_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Data_Devices_FK` FOREIGN KEY (`Device_ID`) REFERENCES `Devices` (`Device_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;