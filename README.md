
# Changenow Bot

[Flow description](./FLOW.md)

## Description

@ChangeNOW_officialbot helps you to exchange cryptocurrency securely and anonymously. No ID, no registration. Just crypto exchange

## Requirements

- node `11.2.0`
- redis `5.0.3`
- mongodb `4.0.4`

## Description of .env config parameters:

`NODE_ENV` - mode in which production or development application is launched

`CN_API_URL` - URL for API ChahgeNOW usage, by default: https://changenow.io/api/v1  

`CN_API_KEY` - API key provided by ChangeNOW

`REDIRECT_URL` - URL to redirect the user to the exchange Terms of Use and Privacy Policy page

`CN_EMAIL` - E-mail displayed in support message

`API_BOT_KEY` - Bot's key (token) in Telegram

`APP_PORT` - Port on which express application is launched

`APP_HOST` - Host on which express application is launched 

`APP_EXTERNAL_HOST` - Your domain for external URLs and webhook link  

`APP_USE_CERTIFICATE` - Sets up the application to use SSL certificate, accepts value `true/false`

`DB_HOST` - Host on which MongoDB database is running  

`DB_PORT` - Port on which MongoDB database is running  

`DB_NAME` - Database name, by default: changenow_bot

`DB_USERNAME` - Database username
 
`DB_PASS` - Database user password 

`DB_REDIS_HOST` - Host on which Redis is running

`DB_REDIS_PORT` - Port on which Redis is running

`SSL_CERTIFICATE_PATH` - Path to cert.pem on server, e.g. /etc/letsencrypt/live/yourdomain/cert.pem

## How to start

To start Exchange, just visit [Telegram](http://t.me/changeNOW_officialbot_) and press /start!

## Server setup

1. Setup domain with SSL-certificate to let webhooks work
2. git clone https://github.com/EvercodeLab/changenow-bot.git
3. cd changenow-bot
4. Install RedisDB (https://redis.io/) and insert parameters to .env
5. npm install
6. create _.env_ file and enter fields from .env.example
7. npm run serve

## Database setup
1. Install [mongodb](https://docs.mongodb.com/v4.0/administration/install-on-linux/)
2. Set db name in DB_NAME .env parameter
3. Create user and password in this db name (`db.createUser()`)
4. Set DB_USERNAME and DB_PASS parameters
5. MongoDB should use ssl connection

## Development setup

1. git clone https://github.com/EvercodeLab/changenow-bot.git
2. cd changenow-bot
3. install [mongodb](https://docs.mongodb.com/v4.0/administration/install-on-linux/)
4. npm install
5. create _.env_ file and enter fields from .env.example
6. Install RedisDB and run with parameters from .env.example
7. if you need build and run app `npm run dev` only run `npm start`

Tip: Use `dev` branch for testing environment!
