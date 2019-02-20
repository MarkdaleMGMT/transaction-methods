#!/bin/bash

fetch_balance1="curl 'http://khashier.com/chain/Clam/q/addressbalance/xNvJFG4T7Fun5AfANznHXmVvoErexh5WT2'"
balance1= eval $fetch_balance1
printf '\n'

fetch_balance2="curl 'http://khashier.com/chain/Clam/q/addressbalance/xLKv8vGuey7sRjxCu8w23bh9GGdYrRc1QU'"
balance2= eval $fetch_balance2
printf '\n'

total_balance=$((balance1+balance2))
printf "total balance: $total_balance\n"

printf "attempting to execute global update with $total_balance\n"
curl -d '{"amount":"'$total_balance'"}' -H "Content-Type: application/json" -X POST http://localhost:3000/transactions/global_update
