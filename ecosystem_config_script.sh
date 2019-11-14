#!/bin/bash

#Prompt credentials
echo -n "Enter server ip address: "
read ip_address

echo -n "Enter password for mysql user 'app': " 
read password


#Insert database credentials
sed -i "/DB_USER/c\      DB_USER:'app',"  ./ecosystem.config.js
sed -i "/DB_HOST/c\      DB_HOST:'$ip_address'," ./ecosystem.config.js
sed -i "/DB_PASS/c\      DB_PASS:'$password'," ./ecosystem.config.js
sed -i "/DB_DATABASE/c\      DB_DATABASE:'live'," ./ecosystem.config.js
sed -i "/INVESTMENT_ACNT/c\      INVESTMENT_ACNT:'investment_user'," ./ecosystem.config.js
sed -i "/RAKE_ACNT/c\      RAKE_ACNT:'rake_user'" ./ecosystem.config.js
