-- phpMyAdmin SQL Dump
-- version 4.6.6deb5
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 27, 2019 at 12:04 PM
-- Server version: 5.7.25-0ubuntu0.18.04.2
-- PHP Version: 7.2.15-0ubuntu0.18.04.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `development`
--

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
CREATE TABLE `account` (
  `account_id` int(11) NOT NULL,
  `username` varchar(30) NOT NULL,
  `description` varchar(100) NOT NULL,
  `account_type` varchar(45) NOT NULL,
  `ledger_account` varchar(45) NOT NULL,
  `investment_id` int(11) NOT NULL,
  `account_level` smallint(2) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `control`
--

DROP TABLE IF EXISTS `control`;
CREATE TABLE `control` (
  `investment_id` int(11) NOT NULL,
  `rake` decimal(5,2) NOT NULL DEFAULT '0.00',
  `affiliate_rake` decimal(5,2) NOT NULL DEFAULT '0.00',
  `fx_rake` decimal(5,2) NOT NULL DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `exchange_rate`
--

DROP TABLE IF EXISTS `exchange_rate`;
CREATE TABLE `exchange_rate` (
  `rate_id` int(11) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `from_currency` varchar(5) NOT NULL,
  `to_currency` varchar(5) NOT NULL,
  `rate` decimal(20,8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `investment`
--

DROP TABLE IF EXISTS `investment`;
CREATE TABLE `investment` (
  `investment_id` int(11) NOT NULL,
  `investment_name` varchar(45) NOT NULL,
  `description` varchar(100) NOT NULL,
  `created_by` varchar(30) NOT NULL,
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `currency` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Stand-in structure for view `investment_trial_balance`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `investment_trial_balance`;
CREATE TABLE `investment_trial_balance` (
`investment_id` int(11)
,`currency` varchar(5)
,`trial_balance` decimal(42,8)
);

-- --------------------------------------------------------

--
-- Table structure for table `mining_address`
--

DROP TABLE IF EXISTS `mining_address`;
CREATE TABLE `mining_address` (
  `address` varchar(256) NOT NULL,
  `investment_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `transaction`
--

DROP TABLE IF EXISTS `transaction`;
CREATE TABLE `transaction` (
  `transaction_id` int(6) UNSIGNED NOT NULL,
  `account_id` int(11) NOT NULL,
  `created_by` varchar(30) NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `transaction_type` varchar(50) NOT NULL,
  `memo` varchar(500) DEFAULT NULL,
  `amount` decimal(20,8) NOT NULL,
  `transaction_event_id` varchar(256) NOT NULL,
  `investment_id` int(11) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
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
  `affiliate` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure for view `investment_trial_balance`
--
DROP TABLE IF EXISTS `investment_trial_balance`;

CREATE ALGORITHM=UNDEFINED DEFINER=`ayesha`@`%` SQL SECURITY DEFINER VIEW `investment_trial_balance`  AS  select `investment`.`investment_id` AS `investment_id`,`investment`.`currency` AS `currency`,sum(`transaction`.`amount`) AS `trial_balance` from (`transaction` join `investment` on((`investment`.`investment_id` = `transaction`.`investment_id`))) group by `investment`.`investment_id`,`investment`.`currency` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`account_id`),
  ADD KEY `fk_account_user_idx` (`username`),
  ADD KEY `fk_account_investment_idx` (`investment_id`);

--
-- Indexes for table `control`
--
ALTER TABLE `control`
  ADD PRIMARY KEY (`investment_id`),
  ADD KEY `fk_control_investment_idx` (`investment_id`);

--
-- Indexes for table `exchange_rate`
--
ALTER TABLE `exchange_rate`
  ADD PRIMARY KEY (`rate_id`),
  ADD UNIQUE KEY `currency_code_UNIQUE` (`rate_id`);

--
-- Indexes for table `investment`
--
ALTER TABLE `investment`
  ADD PRIMARY KEY (`investment_id`),
  ADD UNIQUE KEY `investment_name_UNIQUE` (`investment_name`);

--
-- Indexes for table `mining_address`
--
ALTER TABLE `mining_address`
  ADD PRIMARY KEY (`address`),
  ADD KEY `fk_address_investment_idx` (`investment_id`);

--
-- Indexes for table `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `transaction_event` (`transaction_event_id`),
  ADD KEY `fk_transaction_account_idx` (`account_id`),
  ADD KEY `fk_transaction_investment_idx` (`investment_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account`
--
ALTER TABLE `account`
  MODIFY `account_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;
--
-- AUTO_INCREMENT for table `exchange_rate`
--
ALTER TABLE `exchange_rate`
  MODIFY `rate_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `investment`
--
ALTER TABLE `investment`
  MODIFY `investment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT for table `transaction`
--
ALTER TABLE `transaction`
  MODIFY `transaction_id` int(6) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `account`
--
ALTER TABLE `account`
  ADD CONSTRAINT `fk_account_investment` FOREIGN KEY (`investment_id`) REFERENCES `investment` (`investment_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_account_user` FOREIGN KEY (`username`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `control`
--
ALTER TABLE `control`
  ADD CONSTRAINT `fk_control_investment` FOREIGN KEY (`investment_id`) REFERENCES `investment` (`investment_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `mining_address`
--
ALTER TABLE `mining_address`
  ADD CONSTRAINT `fk_address_investment` FOREIGN KEY (`investment_id`) REFERENCES `investment` (`investment_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `transaction`
--
ALTER TABLE `transaction`
  ADD CONSTRAINT `fk_transaction_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_transaction_investment` FOREIGN KEY (`investment_id`) REFERENCES `investment` (`investment_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
