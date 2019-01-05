//change scripts
ALTER TABLE `live`.`transaction`
DROP COLUMN `credit_debit`;

ALTER TABLE `live`.`user`
DROP COLUMN `id`,
ADD COLUMN `account_type` VARCHAR(6) NOT NULL AFTER `email_verify_flag`,
ADD COLUMN `ledger_account` VARCHAR(10) NOT NULL AFTER `account_type`,
ADD COLUMN `sub_account1` VARCHAR(20) NULL AFTER `ledger_account`,
ADD COLUMN `sub_account2` VARCHAR(20) NULL AFTER `sub_account1`,
DROP PRIMARY KEY,
ADD PRIMARY KEY (`username`),
ADD UNIQUE INDEX `username_UNIQUE` (`username` ASC);
;
