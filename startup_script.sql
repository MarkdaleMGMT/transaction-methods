INSERT INTO user
(username, password, level, email, email_verify_key, email_verify_flag, affiliate)
VALUES
('admin', '$2b$10$IuWpARdQuMBJHu2cnDIfdede0bZy428ViuvbK5MME4v4OOAWocNCW', 0, NULL, '', 1, NULL),
('investment_user', '$2b$10$IuWpARdQuMBJHu2cnDIfdede0bZy428ViuvbK5MME4v4OOAWocNCW', 0, NULL, '', 1, NULL),
('rake_user', '$2b$10$IuWpARdQuMBJHu2cnDIfdede0bZy428ViuvbK5MME4v4OOAWocNCW', 0, NULL, '', 1, NULL),
('fx_user', '$2b$10$IuWpARdQuMBJHu2cnDIfdede0bZy428ViuvbK5MME4v4OOAWocNCW', 0, NULL, '', 1, NULL),
('withdrawal_user','$2b$10$IuWpARdQuMBJHu2cnDIfdede0bZy428ViuvbK5MME4v4OOAWocNCW', 0, NULL, '', 1, NULL);



INSERT INTO global_config
(param, value)
VALUES
('bitcoin_change_address', ''),
('bitcoin_cold_storage', ''),
('bitcoin_tx_fee', ''),
('bitcoin_withdrawal_fee_percent', ''),
('clamcoin_change_address', ''),
('clamcoin_cold_storage', ''),
('clamcoin_tx_fee', ''),
('clamcoin_withdrawal_fee_percent', ''),
('quote_pct', '');
