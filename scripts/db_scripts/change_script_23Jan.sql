ALTER TABLE `transaction`
ADD COLUMN `transaction_event_id` VARCHAR(36) NOT NULL AFTER `amount`;
