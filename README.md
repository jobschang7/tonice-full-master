# TonIce Clicker Game

## Overview
This is the first release of the full clicker app code. There will be some updates soon. Right now, I advise you to learn the code and set up the `.env` variables.

## Environment Variables
You will need the following 3 variables in your `.env` file:


DATABASE_URL="mongo db database url"
BOT_TOKEN="token of your telegram bot"  - you don't need this if you set BYPASS_TELEGRAM_AUTH to true
BYPASS_TELEGRAM_AUTH=true  - it's true during the tests

First of all you need to set up Mongo DB database and seed it with tasks ('/prisma/seed'). 
Check the 'utils/game-mechanics' to update game related values.
Wait for more detailed instructions and updates. Check the official website: https://nikandr.com/

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```