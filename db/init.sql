-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema lockey_db
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema lockey_db
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `lockey_db` DEFAULT CHARACTER SET utf8;
USE `lockey_db` ;

-- -----------------------------------------------------
-- Table `lockey_db`.`User`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lockey_db`.`User` (
  `id_usr` INT NOT NULL AUTO_INCREMENT,
  `act_usr` INT NOT NULL DEFAULT 0,
  `nm_usr` VARCHAR(45) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  `em_usr` VARCHAR(45) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  `tel_usr` VARCHAR(10) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  `pwd_usr` VARCHAR(64) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  `type_usr` INT NOT NULL DEFAULT 3,
  `tk_usr` INT(6) NULL,
  PRIMARY KEY (`id_usr`),
  UNIQUE INDEX `id_user_UNIQUE` (`id_usr` ASC) VISIBLE)
ENGINE=InnoDB;


-- -----------------------------------------------------
-- Table `lockey_db`.`Wallet`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lockey_db`.`Wallet` (
  `id_wal` INT NOT NULL AUTO_INCREMENT,
  `id_usr` INT NOT NULL,
  `nknm_wal` VARCHAR(24) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  `nm_wal` VARCHAR(45) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  `num_wal` VARCHAR(16) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  `date_wal` DATE NOT NULL,
  PRIMARY KEY (`id_wal`),
  INDEX `fk_wallet_user_idx` (`id_usr` ASC) VISIBLE,
  CONSTRAINT `fk_wallet_user`
    FOREIGN KEY (`id_usr`)
    REFERENCES `lockey_db`.`User` (`id_usr`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE=InnoDB;


-- -----------------------------------------------------
-- Table `lockey_db`.`ShippingType`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lockey_db`.`ShippingType` (
  `id_shpgtype` INT NOT NULL AUTO_INCREMENT,
  `nm_shpgtype` VARCHAR(16) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  `time_shpgtype` TIME NOT NULL,
  PRIMARY KEY (`id_shpgtype`))
ENGINE=InnoDB;


-- -----------------------------------------------------
-- Table `lockey_db`.`Shipping`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lockey_db`.`Shipping` (
  `trk_shpg` VARCHAR(18) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  `id_usr` INT NOT NULL,
  `id_shpgtype` INT NOT NULL,
  `stat_shpg` INT NOT NULL DEFAULT 1,
  `dts_shpg` DATETIME NOT NULL DEFAULT NOW(),
  `dtu_shpg` DATETIME NOT NULL DEFAULT NOW(),
  `dte_shpg` DATETIME NULL,
  `pr_shpg` DOUBLE NOT NULL,
  `id_wal` INT NOT NULL,
  PRIMARY KEY (`trk_shpg`),
  UNIQUE INDEX `trk_shpg_UNIQUE` (`trk_shpg` ASC) VISIBLE,
  INDEX `fk_shipping_user_idx` (`id_usr` ASC) VISIBLE,
  INDEX `fk_shipping_wallet_idx` (`id_wal` ASC) VISIBLE,
  INDEX `fk_shipping)shippingtype_idx` (`id_shpgtype` ASC) VISIBLE,
  CONSTRAINT `fk_shipping_user`
    FOREIGN KEY (`id_usr`)
    REFERENCES `lockey_db`.`User` (`id_usr`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_shipping_wallet`
    FOREIGN KEY (`id_wal`)
    REFERENCES `lockey_db`.`Wallet` (`id_wal`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_shipping)shippingtype`
    FOREIGN KEY (`id_shpgtype`)
    REFERENCES `lockey_db`.`ShippingType` (`id_shpgtype`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE=InnoDB;


-- -----------------------------------------------------
-- Table `lockey_db`.`Locker`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lockey_db`.`Locker` (
  `id_lkr` INT NOT NULL AUTO_INCREMENT,
  `nm_lkr` VARCHAR(45) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  `dir_lkr` VARCHAR(150) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  PRIMARY KEY (`id_lkr`))
ENGINE=InnoDB;


-- -----------------------------------------------------
-- Table `lockey_db`.`DoorType`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lockey_db`.`DoorType` (
  `id_drtype` INT NOT NULL AUTO_INCREMENT,
  `nm_drtype` VARCHAR(16) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  `hgt_drtype` DOUBLE NOT NULL,
  `wd_drtype` DOUBLE NOT NULL,
  `deep_drtype` DOUBLE NOT NULL,
  `pr_drtype` DOUBLE NOT NULL,
  `wt_drtype` DOUBLE NULL,
  PRIMARY KEY (`id_drtype`))
ENGINE=InnoDB;


-- -----------------------------------------------------
-- Table `lockey_db`.`Door`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lockey_db`.`Door` (
  `id_door` INT NOT NULL AUTO_INCREMENT,
  `id_lkr` INT NOT NULL,
  `id_drtype` INT NOT NULL,
  `nm_door` INT NOT NULL,
  `stat_door` INT NULL,
  PRIMARY KEY (`id_door`),
  INDEX `fk_locker_idx` (`id_lkr` ASC) VISIBLE,
  INDEX `fk_door_doortype_idx` (`id_drtype` ASC) VISIBLE,
  CONSTRAINT `fk_door_locker`
    FOREIGN KEY (`id_lkr`)
    REFERENCES `lockey_db`.`Locker` (`id_lkr`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_door_doortype`
    FOREIGN KEY (`id_drtype`)
    REFERENCES `lockey_db`.`DoorType` (`id_drtype`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE=InnoDB;


-- -----------------------------------------------------
-- Table `lockey_db`.`Contact`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lockey_db`.`Contact` (
  `id_cont` INT NOT NULL AUTO_INCREMENT,
  `id_usr` INT NOT NULL,
  `nm_cont` VARCHAR(45) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  `em_cont` VARCHAR(45) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  `tel_cont` VARCHAR(10) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  PRIMARY KEY (`id_cont`),
  INDEX `fk_Contact_User_idx` (`id_usr` ASC) VISIBLE,
  CONSTRAINT `fk_Contact_User`
    FOREIGN KEY (`id_usr`)
    REFERENCES `lockey_db`.`User` (`id_usr`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE=InnoDB;


-- -----------------------------------------------------
-- Table `lockey_db`.`ShippingDoor`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lockey_db`.`ShippingDoor` (
  `id_shpgdr` INT NOT NULL AUTO_INCREMENT,
  `id_door` INT NOT NULL,
  `trk_shpg` VARCHAR(18) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  `id_cont` INT NOT NULL,
  `edge_shpgdr` INT(1) NOT NULL,
  `qr_shpgdr` INT(6) NULL,
  PRIMARY KEY (`id_shpgdr`),
  INDEX `fk_shippingdoor_shipping_idx` (`trk_shpg` ASC) VISIBLE,
  INDEX `fk_shippingdoor_door_idx` (`id_door` ASC) VISIBLE,
  INDEX `fk_shippingdoor_contact_idx` (`id_cont` ASC) VISIBLE,
  CONSTRAINT `fk_shippingdoor_shipping`
    FOREIGN KEY (`trk_shpg`)
    REFERENCES `lockey_db`.`Shipping` (`trk_shpg`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_shippingdoor_door`
    FOREIGN KEY (`id_door`)
    REFERENCES `lockey_db`.`Door` (`id_door`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_shippingdoor_contact`
    FOREIGN KEY (`id_cont`)
    REFERENCES `lockey_db`.`Contact` (`id_cont`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE=InnoDB;


-- -----------------------------------------------------
-- Table `lockey_db`.`Report`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lockey_db`.`Report` (
  `id_rpt` INT NOT NULL AUTO_INCREMENT,
  `id_usr` INT NOT NULL,
  `id_door` INT NOT NULL,
  `trk_shpg` VARCHAR(18) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NULL,
  `tit_rpt` VARCHAR(45) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  `msg_rpt` VARCHAR(256) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NULL,
  PRIMARY KEY (`id_rpt`),
  INDEX `fk_report_user_idx` (`id_usr` ASC) VISIBLE,
  INDEX `fk_report_door_idx` (`id_door` ASC) VISIBLE,
  INDEX `fk_report_shipping_idx` (`trk_shpg` ASC) VISIBLE,
  CONSTRAINT `fk_report_user`
    FOREIGN KEY (`id_usr`)
    REFERENCES `lockey_db`.`User` (`id_usr`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_report_door`
    FOREIGN KEY (`id_door`)
    REFERENCES `lockey_db`.`Door` (`id_door`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_report_shipping`
    FOREIGN KEY (`trk_shpg`)
    REFERENCES `lockey_db`.`Shipping` (`trk_shpg`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE=InnoDB;


-- -----------------------------------------------------
-- Table `lockey_db`.`Route`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lockey_db`.`Route` (
  `id_rte` INT NOT NULL AUTO_INCREMENT,
  `id_usr` INT NOT NULL,
  `date_rte` DATETIME NOT NULL,
  `stat_rte` INT NOT NULL,
  PRIMARY KEY (`id_rte`),
  INDEX `fk_route_user_idx` (`id_usr` ASC) VISIBLE,
  CONSTRAINT `fk_route_user`
    FOREIGN KEY (`id_usr`)
    REFERENCES `lockey_db`.`User` (`id_usr`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE=InnoDB;


-- -----------------------------------------------------
-- Table `lockey_db`.`RouteDetail`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lockey_db`.`RouteDetail` (
  `id_rtedtl` INT NOT NULL AUTO_INCREMENT,
  `id_rte` INT NOT NULL,
  `id_lkr` INT NOT NULL,
  `ord_rtedtl` INT NOT NULL,
  PRIMARY KEY (`id_rtedtl`),
  INDEX `fk_routedetail_route_idx` (`id_rte` ASC) VISIBLE,
  INDEX `fk_routedetail_locker_idx` (`id_lkr` ASC) VISIBLE,
  CONSTRAINT `fk_routedetail_route`
    FOREIGN KEY (`id_rte`)
    REFERENCES `lockey_db`.`Route` (`id_rte`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_routedetail_locker`
    FOREIGN KEY (`id_lkr`)
    REFERENCES `lockey_db`.`Locker` (`id_lkr`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE=InnoDB;

-- -----------------------------------------------------
-- Placeholder table for view `lockey_db`.`vUser`
-- -----------------------------------------------------
USE `lockey_db` ;
CREATE TABLE IF NOT EXISTS `lockey_db`.`vUser` (`id_usr` INT, `nm_usr` INT, `em_usr` INT, `tel_usr` INT, `tk_usr` INT, `type_usr` INT);

-- -----------------------------------------------------
-- View `lockey_db`.`vUser`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `lockey_db`.`vUser`;
USE `lockey_db`;
CREATE OR REPLACE VIEW `vUser` AS
    SELECT 
        id_usr,
        CASE act_usr
            WHEN 1 THEN 'ENABLED'
            ELSE 'DISABLED'
        END AS act_usr,
        nm_usr,
        pwd_usr,
        em_usr,
        tel_usr,
        CASE type_usr
            WHEN 1 THEN 'ADMIN'
            WHEN 2 THEN 'DELIVERER'
            ELSE 'CLIENT'
        END AS type_usr,
        tk_usr
    FROM
        User;

-- -----------------------------------------------------
-- View `lockey_db`.`ShippingDetail`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `lockey_db`.`ShippingDetail`;
USE `lockey_db`;
CREATE OR REPLACE VIEW `ShippingDetail` AS
    SELECT Shipping.*, 
		CASE Shipping.stat_shpg
			WHEN 1 THEN 'En espera de recoleccion'
			WHEN 2 THEN 'En espera del repartidor'
			WHEN 3 THEN 'En transito'
			WHEN 4 THEN 'En espera de recepción'
			WHEN 5 THEN 'Completado'
			WHEN 6 THEN 'En Almacén'
			WHEN 7 THEN 'Cancelado'
			ELSE 'Desconocido'
		END AS statnm_shpg,
		nm_shpgtype, nm_wal, num_wal, 
		User.em_usr, User.nm_usr,
		OriginContact.nm_cont as nm_contorg, OriginContact.em_cont as em_contorg, Origin.qr_shpgdr as qr_org, OriginDoor.nm_door as nm_drorg, OriginLocker.nm_lkr as nm_lkrorg, 
		DestinationContact.nm_cont as nm_contdst, DestinationContact.em_cont as em_contdst, Destination.qr_shpgdr as qr_dst, DestinationDoor.nm_door as nm_drdst, DestinationLocker.nm_lkr as nm_lkrdst,
		DoorType.nm_drtype, DoorType.hgt_drtype, DoorType.wd_drtype, DoorType.deep_drtype, DoorType.wt_drtype
		FROM       Shipping
		NATURAL JOIN Wallet
		NATURAL JOIN ShippingType
		NATURAL JOIN User
		RIGHT JOIN (ShippingDoor AS Origin, Door as OriginDoor, Locker as OriginLocker, Contact as OriginContact, DoorType)
				ON (Shipping.trk_shpg=Origin.trk_shpg AND OriginDoor.id_door=Origin.id_door AND OriginLocker.id_lkr=OriginDoor.id_lkr AND OriginContact.id_cont=Origin.id_cont AND OriginDoor.id_drtype=DoorType.id_drtype)
		RIGHT JOIN (ShippingDoor AS Destination, Door as DestinationDoor, Locker as DestinationLocker, Contact as DestinationContact)
				ON (Shipping.trk_shpg=Destination.trk_shpg AND DestinationDoor.id_door=Destination.id_door AND DestinationLocker.id_lkr=DestinationDoor.id_lkr AND DestinationContact.id_cont=Destination.id_cont)
		WHERE      Origin.trk_shpg=Destination.trk_shpg
				AND Origin.edge_shpgdr=1 AND Destination.edge_shpgdr=2
		ORDER BY Shipping.trk_shpg DESC;


-- -----------------------------------------------------
-- View `lockey_db`.`RouteShipping`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `lockey_db`.`RouteShipping`;
USE `lockey_db`;
CREATE OR REPLACE VIEW `RouteShipping` AS
    SELECT
		Route.id_rte, Route.id_usr as id_usr_rte, Route.date_rte, Route.stat_rte,
		RouteDetail.id_rtedtl, RouteDetail.ord_rtedtl,
		Locker.id_lkr, Locker.nm_lkr, Locker.dir_lkr,
		Door.id_door, Door.id_drtype, Door.nm_door, Door.stat_door,
		ShippingDetail.*
	FROM Route 
	NATURAL JOIN RouteDetail 
	NATURAL JOIN Locker 
	NATURAL JOIN Door 
	NATURAL JOIN ShippingDoor 
	INNER JOIN ShippingDetail 
		ON ShippingDetail.trk_shpg=ShippingDoor.trk_shpg 
	WHERE stat_rte=1 AND qr_shpgdr IS NOT NULL
		AND (ShippingDetail.stat_shpg=2 OR ShippingDetail.stat_shpg=3);


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- -----------------------------------------------------
-- Data for table `lockey_db`.`User`
-- -----------------------------------------------------
START TRANSACTION;
USE `lockey_db`;
INSERT INTO `lockey_db`.`User` (`id_usr`, `act_usr`, `nm_usr`, `em_usr`, `tel_usr`, `pwd_usr`, `type_usr`, `tk_usr`) VALUES (DEFAULT, 1, 'Gustavo Peduzzi', 'gustavopdzz0@gmail.com', '5610338516', 'e476acd96b5d450ccad79cc6bfa1f928784e47a713c4311c307a6db0f7ad8a41', 3, NULL);
INSERT INTO `lockey_db`.`User` (`id_usr`, `act_usr`, `nm_usr`, `em_usr`, `tel_usr`, `pwd_usr`, `type_usr`, `tk_usr`) VALUES (DEFAULT, 1, 'Luis Martinez', 'luis@lockeriit.com', '5566282790', 'e476acd96b5d450ccad79cc6bfa1f928784e47a713c4311c307a6db0f7ad8a41', 2, NULL);

COMMIT;

-- -----------------------------------------------------
-- Data for table `lockey_db`.`Wallet`
-- -----------------------------------------------------
START TRANSACTION;
USE `lockey_db`;
INSERT INTO `lockey_db`.`Wallet` (`id_wal`, `id_usr`, `nknm_wal`, `nm_wal`, `num_wal`, `date_wal`) VALUES (DEFAULT, 1, 'TDC Azul', 'Gustavo Alain Peduzzi Acevedo', '5243123265475854', '2025-09-22');
INSERT INTO `lockey_db`.`Wallet` (`id_wal`, `id_usr`, `nknm_wal`, `nm_wal`, `num_wal`, `date_wal`) VALUES (DEFAULT, 1, 'Debito'  , 'Luis Sanchez Martinez'        , '5243127556349076', '2024-12-31');

COMMIT;

-- -----------------------------------------------------
-- Data for table `lockey_db`.`ShippingType`
-- -----------------------------------------------------
START TRANSACTION;
USE `lockey_db`;
INSERT INTO `lockey_db`.`ShippingType` (`id_shpgtype`, `nm_shpgtype`, `time_shpgtype`) VALUES (DEFAULT, 'Normal', '24:00:00');
INSERT INTO `lockey_db`.`ShippingType` (`id_shpgtype`, `nm_shpgtype`, `time_shpgtype`) VALUES (DEFAULT, 'Express', '12:00:00');

COMMIT;

-- -----------------------------------------------------
-- Data for table `lockey_db`.`Shipping`
-- -----------------------------------------------------
START TRANSACTION;
USE `lockey_db`;
INSERT INTO `lockey_db`.`Shipping` (`trk_shpg`, `id_usr`,`id_shpgtype`, `stat_shpg`, `dts_shpg`, `dtu_shpg`, `dte_shpg`, `pr_shpg`, `id_wal`) VALUES ('202212010240004001', 1, 1, 5, '2022-12-01 02:40:00', '2022-12-01 12:40:00', '2022-12-01 12:40:00', 87.39, 1);
INSERT INTO `lockey_db`.`Shipping` (`trk_shpg`, `id_usr`,`id_shpgtype`, `stat_shpg`, `dts_shpg`, `dtu_shpg`, `dte_shpg`, `pr_shpg`, `id_wal`) VALUES ('202212080735004001', 1, 1, 4, '2022-12-08 07:35:00', '2022-12-08 15:35:00', 				   NULL,  90.99, 2);
INSERT INTO `lockey_db`.`Shipping` (`trk_shpg`, `id_usr`,`id_shpgtype`, `stat_shpg`, `dts_shpg`, `dtu_shpg`, `dte_shpg`, `pr_shpg`, `id_wal`) VALUES ('202212130530002003', 1, 1, 3, '2022-12-13 05:30:00', '2022-12-13 11:30:00', 				   NULL, 112.99, 2);
INSERT INTO `lockey_db`.`Shipping` (`trk_shpg`, `id_usr`,`id_shpgtype`, `stat_shpg`, `dts_shpg`, `dtu_shpg`, `dte_shpg`, `pr_shpg`, `id_wal`) VALUES ('202212140630001004', 1, 1, 4, '2022-12-14 06:30:00', '2022-12-14 14:30:00', 				   NULL, 135.01, 1);
INSERT INTO `lockey_db`.`Shipping` (`trk_shpg`, `id_usr`,`id_shpgtype`, `stat_shpg`, `dts_shpg`, `dtu_shpg`, `dte_shpg`, `pr_shpg`, `id_wal`) VALUES ('202212150310001002', 1, 1, 2, '2022-12-15 03:10:00', '2022-12-15 07:10:00', 				   NULL,  78.50, 1);
INSERT INTO `lockey_db`.`Shipping` (`trk_shpg`, `id_usr`,`id_shpgtype`, `stat_shpg`, `dts_shpg`, `dtu_shpg`, `dte_shpg`, `pr_shpg`, `id_wal`) VALUES ('202212190127002001', 1, 1, 3, '2022-12-19 01:27:00', '2022-12-19 07:27:00', 				   NULL, 150.00, 1);
INSERT INTO `lockey_db`.`Shipping` (`trk_shpg`, `id_usr`,`id_shpgtype`, `stat_shpg`, `dts_shpg`, `dtu_shpg`, `dte_shpg`, `pr_shpg`, `id_wal`) VALUES ('202212221045002001', 1, 1, 1, '2022-12-22 10:45:00', '2022-12-22 10:45:00', 				   NULL,  54.50, 2);
INSERT INTO `lockey_db`.`Shipping` (`trk_shpg`, `id_usr`,`id_shpgtype`, `stat_shpg`, `dts_shpg`, `dtu_shpg`, `dte_shpg`, `pr_shpg`, `id_wal`) VALUES ('202301030240001003', 1, 1, 7, '2023-01-02 02:40:00', '2023-01-03 16:45:00', '2023-01-03 16:45:00', 87.39, 1);
INSERT INTO `lockey_db`.`Shipping` (`trk_shpg`, `id_usr`,`id_shpgtype`, `stat_shpg`, `dts_shpg`, `dtu_shpg`, `dte_shpg`, `pr_shpg`, `id_wal`) VALUES ('202301010240002003', 1, 1, 6, '2023-01-01 02:40:00', '2023-01-01 13:40:00',           NULL, 87.39, 1);
COMMIT;

-- -----------------------------------------------------
-- Data for table `lockey_db`.`Locker`
-- -----------------------------------------------------
START TRANSACTION;
USE `lockey_db`;
INSERT INTO `lockey_db`.`Locker` (`id_lkr`, `nm_lkr`, `dir_lkr`) VALUES (DEFAULT, 'Plaza Torres', 'Av. Miguel Othon de Mendizabal Ote. 343, Nueva Industrial Vallejo, Gustavo A. Madero, 07700 Ciudad de Mexico, CDMX');
INSERT INTO `lockey_db`.`Locker` (`id_lkr`, `nm_lkr`, `dir_lkr`) VALUES (DEFAULT, 'Santa Fe', 'Vasco de Quiroga 3800, Santa Fe, Contadero, Cuajimalpa de Morelos, 05348 Ciudad de Mexico, CDMX');
INSERT INTO `lockey_db`.`Locker` (`id_lkr`, `nm_lkr`, `dir_lkr`) VALUES (DEFAULT, 'Forum Buenavista', 'Eje 1 Nte. 259, Buenavista, Cuauhtemoc, 06350 Ciudad de Mexico, CDMX');
INSERT INTO `lockey_db`.`Locker` (`id_lkr`, `nm_lkr`, `dir_lkr`) VALUES (DEFAULT, 'Plaza Antenas', 'Av. Canal de Garay 3278-3er piso, Tulyehualco Canal de Garay, Iztapalapa, 09910 Ciudad de Mexico, CDMX');


COMMIT;

-- -----------------------------------------------------
-- Data for table `lockey_db`.`DoorType`
-- -----------------------------------------------------
START TRANSACTION;
USE `lockey_db`;
INSERT INTO `lockey_db`.`DoorType` (`id_drtype`, `nm_drtype`, `hgt_drtype`, `wd_drtype`, `deep_drtype`, `wt_drtype`, `pr_drtype`) VALUES (DEFAULT, 'Chico', 10.93, 40.64, 63.5, NULL, 150);
INSERT INTO `lockey_db`.`DoorType` (`id_drtype`, `nm_drtype`, `hgt_drtype`, `wd_drtype`, `deep_drtype`, `wt_drtype`, `pr_drtype`) VALUES (DEFAULT, 'Mediano', 23.13, 40.64, 63.5, NULL, 200);
INSERT INTO `lockey_db`.`DoorType` (`id_drtype`, `nm_drtype`, `hgt_drtype`, `wd_drtype`, `deep_drtype`, `wt_drtype`, `pr_drtype`) VALUES (DEFAULT, 'Grande', 50.8, 40.64, 63.5, NULL, 250);

COMMIT;

-- -----------------------------------------------------
-- Data for table `lockey_db`.`Door`
-- -----------------------------------------------------
START TRANSACTION;
USE `lockey_db`;



INSERT INTO `lockey_db`.`Door` (`id_door`, `id_lkr`, `id_drtype`, `nm_door`, `stat_door`) VALUES (DEFAULT, 1, 2, 01, 1);
INSERT INTO `lockey_db`.`Door` (`id_door`, `id_lkr`, `id_drtype`, `nm_door`, `stat_door`) VALUES (DEFAULT, 1, 3, 02, 1);
INSERT INTO `lockey_db`.`Door` (`id_door`, `id_lkr`, `id_drtype`, `nm_door`, `stat_door`) VALUES (DEFAULT, 1, 1, 03, 1);
INSERT INTO `lockey_db`.`Door` (`id_door`, `id_lkr`, `id_drtype`, `nm_door`, `stat_door`) VALUES (DEFAULT, 2, 2, 01, 1);
INSERT INTO `lockey_db`.`Door` (`id_door`, `id_lkr`, `id_drtype`, `nm_door`, `stat_door`) VALUES (DEFAULT, 2, 3, 02, 1);
INSERT INTO `lockey_db`.`Door` (`id_door`, `id_lkr`, `id_drtype`, `nm_door`, `stat_door`) VALUES (DEFAULT, 2, 1, 03, 1);
INSERT INTO `lockey_db`.`Door` (`id_door`, `id_lkr`, `id_drtype`, `nm_door`, `stat_door`) VALUES (DEFAULT, 3, 3, 01, 1);
INSERT INTO `lockey_db`.`Door` (`id_door`, `id_lkr`, `id_drtype`, `nm_door`, `stat_door`) VALUES (DEFAULT, 3, 1, 02, 1);
INSERT INTO `lockey_db`.`Door` (`id_door`, `id_lkr`, `id_drtype`, `nm_door`, `stat_door`) VALUES (DEFAULT, 3, 3, 03, 1);
INSERT INTO `lockey_db`.`Door` (`id_door`, `id_lkr`, `id_drtype`, `nm_door`, `stat_door`) VALUES (DEFAULT, 4, 1, 01, 1);
INSERT INTO `lockey_db`.`Door` (`id_door`, `id_lkr`, `id_drtype`, `nm_door`, `stat_door`) VALUES (DEFAULT, 4, 3, 02, 1);
INSERT INTO `lockey_db`.`Door` (`id_door`, `id_lkr`, `id_drtype`, `nm_door`, `stat_door`) VALUES (DEFAULT, 4, 1, 03, 1);

COMMIT;

-- -----------------------------------------------------
-- Data for table `lockey_db`.`Contact`
-- -----------------------------------------------------
START TRANSACTION;
USE `lockey_db`;
INSERT INTO `lockey_db`.`Contact` (`id_cont`, `id_usr`, `nm_cont`, `em_cont`, `tel_cont`) VALUES (DEFAULT, 1, 'Juan daniel', 'juanakolatronik@gmail.com', '5568854817');
INSERT INTO `lockey_db`.`Contact` (`id_cont`, `id_usr`, `nm_cont`, `em_cont`, `tel_cont`) VALUES (DEFAULT, 1, 'Oscar Mosso', 'Mosscar@gmail.com'        , '5512468933');
INSERT INTO `lockey_db`.`Contact` (`id_cont`, `id_usr`, `nm_cont`, `em_cont`, `tel_cont`) VALUES (DEFAULT, 1, 'Marquitos'  , 'Torres20@gmail.com'       , '5610338516');

COMMIT;

-- -----------------------------------------------------
-- Data for table `lockey_db`.`ShippingDoor`
-- -----------------------------------------------------
START TRANSACTION;
USE `lockey_db`;
INSERT INTO `lockey_db`.`ShippingDoor` (`id_shpgdr`, `id_door`, `trk_shpg`, `id_cont`, `edge_shpgdr`, `qr_shpgdr`) VALUES (DEFAULT, 10,'202212010240004001', 3, 1, NULL);
INSERT INTO `lockey_db`.`ShippingDoor` (`id_shpgdr`, `id_door`, `trk_shpg`, `id_cont`, `edge_shpgdr`, `qr_shpgdr`) VALUES (DEFAULT, 1, '202212010240004001', 2, 2, NULL);
INSERT INTO `lockey_db`.`ShippingDoor` (`id_shpgdr`, `id_door`, `trk_shpg`, `id_cont`, `edge_shpgdr`, `qr_shpgdr`) VALUES (DEFAULT, 10,'202212080735004001', 1, 1, NULL);
INSERT INTO `lockey_db`.`ShippingDoor` (`id_shpgdr`, `id_door`, `trk_shpg`, `id_cont`, `edge_shpgdr`, `qr_shpgdr`) VALUES (DEFAULT, 1, '202212080735004001', 3, 2, 780192);
INSERT INTO `lockey_db`.`ShippingDoor` (`id_shpgdr`, `id_door`, `trk_shpg`, `id_cont`, `edge_shpgdr`, `qr_shpgdr`) VALUES (DEFAULT, 2, '202212130530002003', 2, 1, NULL);
INSERT INTO `lockey_db`.`ShippingDoor` (`id_shpgdr`, `id_door`, `trk_shpg`, `id_cont`, `edge_shpgdr`, `qr_shpgdr`) VALUES (DEFAULT, 7, '202212130530002003', 1, 2, 892789);
INSERT INTO `lockey_db`.`ShippingDoor` (`id_shpgdr`, `id_door`, `trk_shpg`, `id_cont`, `edge_shpgdr`, `qr_shpgdr`) VALUES (DEFAULT, 3, '202212140630001004', 2, 1, NULL);
INSERT INTO `lockey_db`.`ShippingDoor` (`id_shpgdr`, `id_door`, `trk_shpg`, `id_cont`, `edge_shpgdr`, `qr_shpgdr`) VALUES (DEFAULT, 12,'202212140630001004', 3, 2, 347883);
INSERT INTO `lockey_db`.`ShippingDoor` (`id_shpgdr`, `id_door`, `trk_shpg`, `id_cont`, `edge_shpgdr`, `qr_shpgdr`) VALUES (DEFAULT, 1, '202212150310001002', 3, 1, 456723);
INSERT INTO `lockey_db`.`ShippingDoor` (`id_shpgdr`, `id_door`, `trk_shpg`, `id_cont`, `edge_shpgdr`, `qr_shpgdr`) VALUES (DEFAULT, 4, '202212150310001002', 2, 2, NULL);
INSERT INTO `lockey_db`.`ShippingDoor` (`id_shpgdr`, `id_door`, `trk_shpg`, `id_cont`, `edge_shpgdr`, `qr_shpgdr`) VALUES (DEFAULT, 5, '202212190127002001', 1, 1, NULL);
INSERT INTO `lockey_db`.`ShippingDoor` (`id_shpgdr`, `id_door`, `trk_shpg`, `id_cont`, `edge_shpgdr`, `qr_shpgdr`) VALUES (DEFAULT, 3, '202212190127002001', 2, 2, 493435);
INSERT INTO `lockey_db`.`ShippingDoor` (`id_shpgdr`, `id_door`, `trk_shpg`, `id_cont`, `edge_shpgdr`, `qr_shpgdr`) VALUES (DEFAULT, 5, '202212221045002001', 3, 1, 357236);
INSERT INTO `lockey_db`.`ShippingDoor` (`id_shpgdr`, `id_door`, `trk_shpg`, `id_cont`, `edge_shpgdr`, `qr_shpgdr`) VALUES (DEFAULT, 3, '202212221045002001', 1, 2, NULL);
INSERT INTO `lockey_db`.`ShippingDoor` (`id_shpgdr`, `id_door`, `trk_shpg`, `id_cont`, `edge_shpgdr`, `qr_shpgdr`) VALUES (DEFAULT, 1, '202301030240001003', 3, 1, NULL);
INSERT INTO `lockey_db`.`ShippingDoor` (`id_shpgdr`, `id_door`, `trk_shpg`, `id_cont`, `edge_shpgdr`, `qr_shpgdr`) VALUES (DEFAULT, 8, '202301030240001003', 1, 2, NULL);
INSERT INTO `lockey_db`.`ShippingDoor` (`id_shpgdr`, `id_door`, `trk_shpg`, `id_cont`, `edge_shpgdr`, `qr_shpgdr`) VALUES (DEFAULT, 4, '202301010240002003', 3, 1, NULL);
INSERT INTO `lockey_db`.`ShippingDoor` (`id_shpgdr`, `id_door`, `trk_shpg`, `id_cont`, `edge_shpgdr`, `qr_shpgdr`) VALUES (DEFAULT, 9, '202301010240002003', 1, 2, NULL);
COMMIT;

-- -----------------------------------------------------
-- Data for table `lockey_db`.`Report`
-- -----------------------------------------------------
START TRANSACTION;
USE `lockey_db`;
INSERT INTO `lockey_db`.`Report` (`id_rpt`, `id_usr`, `id_door`, `trk_shpg`, `tit_rpt`, `msg_rpt`) VALUES (DEFAULT, 2, 1, NULL                , 'Puerta aberiada', 'La puerta del casillero 03 del locker Santa fe esta atorada y no abre');
INSERT INTO `lockey_db`.`Report` (`id_rpt`, `id_usr`, `id_door`, `trk_shpg`, `tit_rpt`, `msg_rpt`) VALUES (DEFAULT, 2, 2, NULL                , 'Casillero Sucio', 'El casillero 01 del locker de Plaza torres esta sucio, necesita limpieza');
INSERT INTO `lockey_db`.`Report` (`id_rpt`, `id_usr`, `id_door`, `trk_shpg`, `tit_rpt`, `msg_rpt`) VALUES (DEFAULT, 2, 3, '202212140630001004', 'Paquete abierto', 'El paquete que recibi en el locker esta abierto');

COMMIT;

-- -----------------------------------------------------
-- Data for table `lockey_db`.`Route`
-- -----------------------------------------------------
START TRANSACTION;
USE `lockey_db`;
INSERT INTO `lockey_db`.`Route` (`id_rte`, `id_usr`, `date_rte`, `stat_rte`) VALUES (DEFAULT, 2, NOW(), 1);

COMMIT;

-- -----------------------------------------------------
-- Data for table `lockey_db`.`RouteDetail`
-- -----------------------------------------------------
START TRANSACTION;
USE `lockey_db`;
INSERT INTO `lockey_db`.`RouteDetail` (`id_rtedtl`, `id_rte`, `id_lkr`, `ord_rtedtl`) VALUES (DEFAULT, 1, 1, 1);
INSERT INTO `lockey_db`.`RouteDetail` (`id_rtedtl`, `id_rte`, `id_lkr`, `ord_rtedtl`) VALUES (DEFAULT, 1, 2, 2);
INSERT INTO `lockey_db`.`RouteDetail` (`id_rtedtl`, `id_rte`, `id_lkr`, `ord_rtedtl`) VALUES (DEFAULT, 1, 3, 3);
INSERT INTO `lockey_db`.`RouteDetail` (`id_rtedtl`, `id_rte`, `id_lkr`, `ord_rtedtl`) VALUES (DEFAULT, 1, 4, 4);
-- INSERT INTO `lockey_db`.`RouteDetail` (`id_rtedtl`, `id_rte`, `id_lkr`, `ord_rtedtl`) VALES (DEFAULT, 1, 1, 5);

COMMIT;