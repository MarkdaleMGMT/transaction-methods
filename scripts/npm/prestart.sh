#!/bin/bash

#Check if the environment variables are configured
read -r -p "Have you configured .env file? (Y/N) " input

case $input in
    [yY][eE][sS]|[yY])
 echo "Environment variables configuration ... done"
 ;;
    [nN][oO]|[nN])
 echo "Deployment will not continue until environment variables are set"
 exit 1
       ;;
    *)
 echo "Invalid input..."
 exit 1
 ;;
esac #end case
