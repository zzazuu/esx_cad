SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `cad_convictions` (
  `identifier` int(11) NOT NULL,
  `officer` varchar(255) NOT NULL,
  `steamIdentifier` varchar(255) NOT NULL,
  `suspect_name` varchar(255) NOT NULL,
  `reason` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `time_served` int(11) NOT NULL,
  `date` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `cad_convictions` (`identifier`, `officer`, `steamIdentifier`, `suspect_name`, `reason`, `time_served`, `date`) VALUES
(1, 'Tommy Cornell', 'Char3:1100001078fc88d', 'Lane Frost', 'Was involved in a bank robbery..... Was involved in a bank robbery..... Was involved in a bank robbery..... Was involved in a bank robbery..... Was involved in a bank robbery.....', 112, '11/08/2019');

ALTER TABLE `cad_convictions`
  ADD PRIMARY KEY (`identifier`);

ALTER TABLE `cad_convictions`
  MODIFY `identifier` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

CREATE TABLE `cad_fines` (
  `identifier` int(11) NOT NULL,
  `steamIdentifier` varchar(255) NOT NULL,
  `officer` varchar(255) NOT NULL,
  `receiver` varchar(255) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `amount` int(11) NOT NULL,
  `date` varchar(255) NOT NULL,
  `paid` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `cad_fines` (`identifier`, `steamIdentifier`, `officer`, `receiver`, `reason`, `amount`, `date`, `paid`) VALUES
(35, 'Char3:1100001078fc88d', 'Joey Tsunami', 'Lane Frost', 'testing new shit.', 123, '15/08/2019', 'n');

ALTER TABLE `cad_fines`
  ADD PRIMARY KEY (`identifier`);

ALTER TABLE `cad_fines`
  MODIFY `identifier` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;
COMMIT;

CREATE TABLE `cad_reports` (
  `identifier` int(11) NOT NULL,
  `officer` varchar(255) NOT NULL,
  `steamIdentifier` varchar(255) DEFAULT NULL,
  `suspects_name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `report` varchar(255) NOT NULL,
  `date` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `cad_reports` (`identifier`, `officer`, `steamIdentifier`, `suspects_name`, `report`, `date`) VALUES
(26, 'Susan Doyle', NULL, NULL, 'Was walking down legion on patrol and see an individual pass over what appeared to be a white substance. Persude on foot, however the suspect managed to escape. He was wearing all green, possibly as member of grove? ', '08/08/19'),
(27, 'Susan Doyle', 'Char3:1100001078fc88d', 'Lane Frost', 'Pertaining to the report I made previously, I managed to catch up with the suspect and detain him. The suspect in question, turned out to be one Mr Lane Frost, a head lieutenant of Grove Street. Upon searching Mr Frost, I found numerous backs of what appe', '08/08/19');

ALTER TABLE `cad_reports`
  ADD PRIMARY KEY (`identifier`);

CREATE TABLE `cad_users` (
  `steamIdentifier` varchar(255) NOT NULL,
  `name` varchar(50) NOT NULL,
  `dob` varchar(11) NOT NULL,
  `profile` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `cad_users` (`steamIdentifier`, `name`, `dob`, `profile`) VALUES
('Char1:1100001077d16d7', 'Test Account', '01/01/1992', '{\"gender\":\"F\",\"commercialL\":\"n\",\"bikeL\":\"n\",\"carL\":\"n\",\"height\":\"48\"}'),
('Char2:1100001078fc88d', 'Jodie Davis', '02/03/1992', '{\"gender\":\"F\",\"commercialL\":\"n\",\"bikeL\":\"n\",\"carL\":\"n\",\"height\":\"48\"}'),
('Char3:1100001078fc88d', 'Lane Frost', '19/06/1986', '{\"gender\":\"M\",\"commercialL\":\"n\",\"bikeL\":\"n\",\"carL\":\"n\",\"height\":\"48\"}'),
('Char4:1100001078fc88d', 'susan doyle', '19/05/2019', '{\"gender\":\"M\",\"commercialL\":\"n\",\"bikeL\":\"n\",\"carL\":\"n\",\"height\":\"85\"}'),
('steam:1100001077d16d7', 'Codie Alterman', '16/01/1974', '{\"commercialL\":\"n\",\"carL\":\"n\",\"bikeL\":\"n\",\"height\":\"96\",\"gender\":\"M\"}');

CREATE TABLE `cad_warrants` (
  `identifier` int(11) NOT NULL,
  `steamIdentifier` varchar(255) NOT NULL,
  `officer` varchar(255) NOT NULL,
  `receiver` varchar(255) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `date_issued` varchar(255) NOT NULL,
  `warrant_active` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `cad_warrants` (`identifier`, `steamIdentifier`, `officer`, `receiver`, `reason`, `date_issued`, `warrant_active`) VALUES
(15, 'Char3:1100001078fc88d', 'Joey Tsunami', 'Lane Frost', 'testing warrant shit', '01/01/1111', 'y');

ALTER TABLE `cad_warrants`
  ADD PRIMARY KEY (`identifier`);
