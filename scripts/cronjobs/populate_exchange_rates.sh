#!/bin/bash


printf "logging new rates from scotiabank...\n"
curl -o -d '{"source":"scotiabank", "rates_for":["USD_CAD"]}' -H "Content-Type: application/json" -X POST http://localhost:3000/fx/update_exchange_rates

printf "\ndone...\n"

printf "\nlogging new rates from poloniex...\n"
curl -o -d '{"source":"poloniex", "rates_for":["CLAM_BTC"]}' -H "Content-Type: application/json" -X POST http://localhost:3000/fx/update_exchange_rates

printf "\ndone...\n"

printf "logging new rates from bitfinex...\n"
curl -o -d '{"source":"bitfinex", "rates_for":["BTC_USD"]}' -H "Content-Type: application/json" -X POST http://localhost:3000/fx/update_exchange_rates

printf "done...\n"
