-- MySQL dump 10.13  Distrib 5.7.26, for Linux (x86_64)
--
-- Host: localhost    Database: development
-- ------------------------------------------------------
-- Server version	5.7.26-0ubuntu0.18.04.1

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
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `account` (
  `account_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(30) NOT NULL,
  `description` varchar(100) NOT NULL,
  `account_type` varchar(45) NOT NULL,
  `ledger_account` varchar(45) NOT NULL,
  `investment_id` int(11) NOT NULL,
  `account_level` smallint(2) NOT NULL DEFAULT '0',
  `deposit_address` varchar(35) DEFAULT NULL,
  `autoconvert` tinyint(1) NOT NULL DEFAULT '0',
  `autoconvert_investment_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`account_id`),
  KEY `fk_account_user_idx` (`username`),
  KEY `fk_account_investment_idx` (`investment_id`),
  CONSTRAINT `fk_account_investment` FOREIGN KEY (`investment_id`) REFERENCES `investment` (`investment_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_account_user` FOREIGN KEY (`username`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `api_access_info`
--

DROP TABLE IF EXISTS `api_access_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `api_access_info` (
  `access_id` int(11) NOT NULL AUTO_INCREMENT,
  `investment_id` int(11) DEFAULT NULL,
  `type` varchar(45) NOT NULL,
  `description` varchar(45) DEFAULT NULL,
  `address` varchar(256) DEFAULT NULL,
  `api_key` varchar(64) DEFAULT NULL,
  `secret` varchar(128) DEFAULT NULL,
  `base_url` varchar(100) NOT NULL,
  PRIMARY KEY (`access_id`),
  UNIQUE KEY `access_id_UNIQUE` (`access_id`),
  KEY `fk_address_investment_idx` (`investment_id`),
  CONSTRAINT `fk_address_investment` FOREIGN KEY (`investment_id`) REFERENCES `investment` (`investment_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `control`
--

DROP TABLE IF EXISTS `control`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `control` (
  `investment_id` int(11) NOT NULL,
  `rake` decimal(5,2) NOT NULL DEFAULT '0.00',
  `affiliate_rake` decimal(5,2) NOT NULL DEFAULT '0.00',
  `fx_rake` decimal(5,2) NOT NULL DEFAULT '0.00',
  `fixed_rate_investment` decimal(5,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`investment_id`),
  KEY `fk_control_investment_idx` (`investment_id`),
  CONSTRAINT `fk_control_investment` FOREIGN KEY (`investment_id`) REFERENCES `investment` (`investment_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `currency_pair`
--

DROP TABLE IF EXISTS `currency_pair`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `currency_pair` (
  `currency_pair` varchar(10) NOT NULL,
  `spread` decimal(20,8) NOT NULL,
  `path` varchar(100) NOT NULL,
  PRIMARY KEY (`currency_pair`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='		';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exchange_rates_config`
--

DROP TABLE IF EXISTS `exchange_rates_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exchange_rates_config` (
  `config_id` int(11) NOT NULL AUTO_INCREMENT,
  `from_to` varchar(10) NOT NULL,
  `source` varchar(45) NOT NULL,
  `frequency_min` int(11) NOT NULL,
  `weight` int(11) NOT NULL,
  `reference_rate_gap` decimal(20,8) DEFAULT NULL,
  PRIMARY KEY (`config_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `global_config`
--

DROP TABLE IF EXISTS `global_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `global_config` (
  `param` varchar(40) NOT NULL,
  `value` varchar(100) NOT NULL,
  PRIMARY KEY (`param`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `investment`
--

DROP TABLE IF EXISTS `investment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `investment` (
  `investment_id` int(11) NOT NULL AUTO_INCREMENT,
  `investment_name` varchar(45) NOT NULL,
  `description` varchar(100) NOT NULL,
  `created_by` varchar(30) NOT NULL,
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `currency` varchar(5) NOT NULL,
  PRIMARY KEY (`investment_id`),
  UNIQUE KEY `investment_name_UNIQUE` (`investment_name`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `investment_trial_balance`
--

DROP TABLE IF EXISTS `investment_trial_balance`;
/*!50001 DROP VIEW IF EXISTS `investment_trial_balance`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `investment_trial_balance` AS SELECT
 1 AS `investment_id`,
 1 AS `currency`,
 1 AS `trial_balance`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `order_book`
--

DROP TABLE IF EXISTS `order_book`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_book` (
  `rate_id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `from_to` varchar(10) NOT NULL,
  `source` varchar(45) NOT NULL,
  `bid` decimal(20,8) NOT NULL,
  `ask` decimal(20,8) NOT NULL,
  `quoted_bid` decimal(20,8) NOT NULL,
  `quoted_ask` decimal(20,8) NOT NULL,
  PRIMARY KEY (`rate_id`),
  UNIQUE KEY `currency_code_UNIQUE` (`rate_id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pending_deposits`
--

DROP TABLE IF EXISTS `pending_deposits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pending_deposits` (
  `pending_deposit_id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `account_id` int(11) NOT NULL,
  `amount` decimal(20,8) NOT NULL,
  `transaction_id` varchar(45) NOT NULL,
  PRIMARY KEY (`pending_deposit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `process_log`
--

DROP TABLE IF EXISTS `process_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `process_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `process_type` varchar(45) NOT NULL,
  `status` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `quoted_fx_rates`
--

DROP TABLE IF EXISTS `quoted_fx_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quoted_fx_rates` (
  `rate_id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` datetime NOT NULL,
  `from_to` varchar(10) NOT NULL,
  `bid` decimal(20,8) NOT NULL,
  `ask` decimal(20,8) NOT NULL,
  `mid` decimal(20,8) NOT NULL,
  PRIMARY KEY (`rate_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transaction`
--

DROP TABLE IF EXISTS `transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transaction` (
  `transaction_id` int(6) unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int(11) NOT NULL,
  `created_by` varchar(30) NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `transaction_type` varchar(50) NOT NULL,
  `memo` varchar(500) DEFAULT NULL,
  `amount` decimal(20,8) NOT NULL,
  `transaction_event_id` varchar(256) NOT NULL,
  `investment_id` int(11) NOT NULL DEFAULT '1',
  `custom_memo` varchar(100) NOT NULL DEFAULT ' ',
  PRIMARY KEY (`transaction_id`),
  KEY `transaction_event` (`transaction_event_id`),
  KEY `fk_transaction_account_idx` (`account_id`),
  KEY `fk_transaction_investment_idx` (`investment_id`),
  CONSTRAINT `fk_transaction_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_transaction_investment` FOREIGN KEY (`investment_id`) REFERENCES `investment` (`investment_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=389 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `username` varchar(30) NOT NULL,
  `password` varchar(256) NOT NULL,
  `level` smallint(2) NOT NULL,
  `last_login` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `email` varchar(100) DEFAULT NULL,
  `email_verify_key` varchar(100) NOT NULL,
  `email_verify_flag` tinyint(1) NOT NULL DEFAULT '0',
  `email_token` varchar(30) DEFAULT NULL,
  `email_expire` timestamp NULL DEFAULT NULL,
  `affiliate` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `investment_trial_balance`
--

/*!50001 DROP VIEW IF EXISTS `investment_trial_balance`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `investment_trial_balance` AS select `investment`.`investment_id` AS `investment_id`,`investment`.`currency` AS `currency`,sum(`transaction`.`amount`) AS `trial_balance` from (`transaction` join `investment` on((`investment`.`investment_id` = `transaction`.`investment_id`))) group by `investment`.`investment_id`,`investment`.`currency` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-07-23 17:32:12
