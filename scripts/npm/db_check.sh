#!/bin/bash
read -p "Enter database username: " MYSQL_USER
read -p "Enter database password: " MYSQL_PASSWORD
read -p "Enter database name: " DATABASE_NAME


MYSQL_HOST='localhost'
MYSQL_PORT='3306'
# MYSQL_USER=$1
# MYSQL_PASSWORD=$2
# DATABASE_NAME=$3


#create an empty directory tmp
mkdir -p tmp
rm tmp/*

#take the database backup
mysqldump --no-data -h ${MYSQL_HOST} \
   -P ${MYSQL_PORT} \
   -u ${MYSQL_USER} \
   -p${MYSQL_PASSWORD} \
   --single-transaction \
   --default-character-set=utf8 \
   ${DATABASE_NAME} > tmp/from.sql

#show the differences
# php-mysql-diff diff from.sql target.sql


#create a migration script
php-mysql-diff migrate tmp/from.sql target.sql -o tmp/migrate.sql
#cat tmp/migrate.sql

#prompt user that the migration script has been created
if [ ! -f tmp/migrate.sql ]; then
    echo "Database is up to date. No migration script created!"
else
    echo "Migration script has been created: tmp/migrate.sql"
fi

#run the script from the user (later)
