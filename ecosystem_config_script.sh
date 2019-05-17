#!/bin/bash

#Prompt credentials
echo -n "Enter server IP: "
read ip_address

echo -n "Enter mysql database user: "
read  user_name

echo -n "Enter password: " 
read password


#Insert database credentials
sed -i "/DB_USER/c\      DB_USER:'$user_name',"  ./ecosystem.config.js
sed -i "/DB_HOST/c\      DB_HOST:'$ip_address'," ./ecosystem.config.js
sed -i "/DB_PASS/c\      DB_PASS:'$password'," ./ecosystem.config.js
sed -i "/DB_DATABASE/c\      DB_DATABASE:'live'," ./ecosystem.config.js
sed -i "/INVESTMENT_ACNT/c\      INVESTMENT_ACNT:'investment_user'," ./ecosystem.config.js
sed -i "/RAKE_ACNT/c\      RAKE_ACNT:'rake_user'" ./ecosystem.config.js
