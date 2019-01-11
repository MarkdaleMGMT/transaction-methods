### Installation

Requires Node.JS and pm2 for handling the app.

First clone the repo and enter the repo:

```
$ git clone https://github.com/MarkdaleMGMT/transaction-methods.git
$ cd markdale_api 
```
Install pm2 with 
```
$ npm install pm2@latest -g
```
Install the dependencies.
```
$ npm install
```
Start the server:
```
$ pm2 start server.js
```
### To view logs:
```
$ pm2 status
```
Check what id our app is running on (the row that says index), typically it'll be 0
Then run:
```
$ pm2 log 0
```
### Updating local repo:
```
$ git pull
$ pm2 restart 0
```
