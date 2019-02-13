ALTER TABLE `transaction` CHANGE `transaction_event_id` `transaction_event_id` VARCHAR(36) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL;

ALTER TABLE `user`
ADD COLUMN `email` VARCHAR(100) NOT NULL AFTER `last_login`,
ADD COLUMN `affiliate` VARCHAR(30) NOT NULL AFTER `sub_account2`;

ALTER TABLE `user` CHANGE `password` `password` VARCHAR(100) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL;
