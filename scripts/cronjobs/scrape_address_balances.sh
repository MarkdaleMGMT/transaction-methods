#!/bin/bash


balance1=$(curl 'http://khashier.com/chain/Clam/q/addressbalance/xNvJFG4T7Fun5AfANznHXmVvoErexh5WT2')


balance2=$(curl 'http://khashier.com/chain/Clam/q/addressbalance/xLKv8vGuey7sRjxCu8w23bh9GGdYrRc1QU')
printf "\n\n -------balance1: $balance1"
printf "\n\n -------balance2: $balance2"



total_balance=$(echo "$balance1 + $balance2" | bc -l)
printf "\n\ntotal balance: $total_balance\n"

printf "attempting to execute global update with $total_balance\n"
curl -d '{"amount":"'$total_balance'"}' -H "Content-Type: application/json" -X POST http://localhost:3000/transactions/global_update

