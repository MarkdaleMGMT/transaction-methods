#!/bin/bash

#Check if the environment variables are configured
read -r -p "Have you configured .env file? (Y/N) " input

case $input in
    [yY][eE][sS]|[yY])
 printf "Environment variables configuration ... done"
 ;;
    [nN][oO]|[nN])
 printf "ERROR!!!:\nDeployment will not continue until environment variables are set. \nRename 'sample.env' to '.env' and update the configurations"
 exit 1
       ;;
    *)
 printf "Invalid input..."
 exit 1
 ;;
esac #end case
