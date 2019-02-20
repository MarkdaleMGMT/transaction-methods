#!/bin/bash

#config paramters ----> update this
mysql_username="app"
mysql_password="3b391ec5"
db_name="live"

#end config

#get the current path
dir=$(pwd)
### make all the sh files in the current directory executable
find $dir -type f -iname "*.sh" -exec chmod +x {} \;

escapedEntry=$(printf '%s\n' "$entry" | sed 's:[][\/.^$*]:\\&:g')
cur=$(crontab -l)
job1="0 0 * * * $dir/db_backup.sh $mysql_username $mysql_password $db_name" #backup the live db
job2="0 0 * * * $dir/scrape_address_balances.sh"

jobs=(job1,job2)

for job in "${jobs[@]}"
do
  if [[ $(crontab -l | egrep -v '^(#|$)' | grep -q "$escapedEntry"; echo $job) == 1 ]] # from: https://unix.stackexchange.com/a/297377/320236
  then
      printf "all clear; pattern was not already present; adding command to crontab hourly:\n$job\n\n"
      (crontab -l ; printf "$job\n\n") | crontab -
  else
      printf "pattern already present; no action taken\n\n"
  fi

  echo "$cur$job" | crontab -
done


### End of script ####
