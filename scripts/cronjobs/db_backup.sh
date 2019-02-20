#!/bin/bash

################################################################
##
##   MySQL Database Backup Script
##   Written By: Rahul Kumar
##   URL: https://tecadmin.net/bash-script-mysql-database-backup/
##   Last Update: Jan 05, 2019
##
################################################################

export PATH=/bin:/usr/bin:/usr/local/bin
TODAY=`date +"%d%b%Y"`

################################################################
################## Update below values  ########################

DB_BACKUP_PATH='/backup/db_backup'
MYSQL_HOST='localhost'
MYSQL_PORT='3306'
MYSQL_USER=$1
MYSQL_PASSWORD=$2
DATABASE_NAME=$3
BACKUP_RETAIN_DAYS=30   ## Number of days to keep local backup copy
BACKUPMAIL='ayesha.h@live.com'

#################################################################

mkdir -p ${DB_BACKUP_PATH}/${TODAY}
echo "Backup started for database - ${DATABASE_NAME}"


mysqldump -h ${MYSQL_HOST} \
   -P ${MYSQL_PORT} \
   -u ${MYSQL_USER} \
   -p${MYSQL_PASSWORD} \
   --single-transaction \
   --default-character-set=utf8 \
   ${DATABASE_NAME} | gzip > ${DB_BACKUP_PATH}/${TODAY}/${DATABASE_NAME}-${TODAY}.sql.gz
echo "Attached is the db backup" | mail -s "MySQL DB ${DATABASE_NAME} for ${TODAY}" ${BACKUPMAIL} -A ${DB_BACKUP_PATH}/${TODAY}/${DATABASE_NAME}-${TODAY}.sql.gz 

if [ $? -eq 0 ]; then
  echo "Database backup successfully completed - ${TODAY}"
else
  echo "Error found during backup - ${TODAY}"
fi


##### Remove backups older than {BACKUP_RETAIN_DAYS} days  #####

DBDELDATE=`date +"%d%b%Y" --date="${BACKUP_RETAIN_DAYS} days ago"`

if [ ! -z ${DB_BACKUP_PATH} ]; then
      cd ${DB_BACKUP_PATH}
      if [ ! -z ${DBDELDATE} ] && [ -d ${DBDELDATE} ]; then
            rm -rf ${DBDELDATE}
      fi
fi

### End of script ####
