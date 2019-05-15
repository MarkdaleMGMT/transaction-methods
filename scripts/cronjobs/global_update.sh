#!/bin/bash
username=$1
password=$2


printf "attempting to run auto global update\n"
curl -o -d '{"username":"'$username'", "password":"'$password'"}' -H "Content-Type: application/json" -X POST http://localhost:3000/transactions/auto_global_update
