#!/bin/bash

# Comment out cert and key file
sed -i '/smtpd_tls_cert_file/s/^/#/' /etc/postfix/main.cf
sed -i '/smtpd_tls_key_file/s/^/#/' /etc/postfix/main.cf

# check for TLS parameters and append if not found
sed -i '/smtpd_use_tls/c\smtpd_use_tls=yes' /etc/postfix/main.cf
grep -q '/smtp_sasl_auth_enable = yes' /etc/postfix/main.cf || sed -i '/smtp_tls_session_cache_database/a smtp_sasl_auth_enable = yes' /etc/postfix/main.cf
grep -q '/smtp_sasl_security_options = noanonymous' /etc/postfix/main.cf || sed -i '/smtp_tls_session_cache_database/a smtp_sasl_security_options = noanonymous' /etc/postfix/main.cf
grep -q '/smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd' /etc/postfix/main.cf || sed -i '/smtp_tls_session_cache_database/a smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd' /etc/postfix/main.cf
grep -q '/smtp_tls_security_level = encrypt' /etc/postfix/main.cf || sed -i '/smtp_tls_session_cache_database/a smtp_tls_security_level = encrypt' /etc/postfix/main.cf
grep -q '/smtp_tls_CAfile = /etc/ssl/certs/ca-certificates.crt' /etc/postfix/main.cf || sed -i '/smtp_tls_session_cache_database/a smtp_tls_CAfile = /etc/ssl/certs/ca-certificates.crt' /etc/postfix/main.cf

sed -i '/relayhost/c\relayhost = [smtp.gmail.com]:587' /etc/postfix/main.cf
sed -i '/inet_interfaces/c\inet_interfaces = all' /etc/postfix/main.cf
sed -i '/inet_protocols/c\inet_protocols = ipv4' /etc/postfix/main.cf

echo "Configuration complete. Verify that the configuration is correct"

