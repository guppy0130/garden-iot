# Garden IoT

## Your garden, now with Google Assistant

### Stickers
[![Dependency Status](https://david-dm.org/guppy0130/garden-iot.svg)](https://david-dm.org/)
[![Build Status](https://travis-ci.org/guppy0130/garden-iot.svg?branch=master)](https://travis-ci.org/guppy0130/garden-iot)

## What is it?

Intermediary between Grafana and Google Assistant. When Grafana triggers an alert, send a webhook to this, which will parse the webhook and store the state contained in the hook. Actions on Google/Google Assistant can then query this service, which will return the stored state.

## Setup

You'll need to do the following:

* Setup Actions on Google with your own pot/plants setup - setup BASIC username/password auth here
* Setup/connect an existing Grafana + Grafana alert system - setup BASIC username/password auth here
* Setup Heroku and/or your own Node server to run this on - set environment variables here

## Testing/Deployment

```bash
git clone git@git{lab, hub}.com/guppy0130/garden-iot.git
cd garden-iot
npm test
```

1. Deploy to Heroku/other server of choice.
2. Point Actions on Google at it
3. Point Grafana alerts at it

Check `tests/test.js` to see sample usage/endpoints.

## Known Issues

* Grafana + OpenTSDB doesn't support tags in alerts as of 5.4, it always returns null (dunno why)! This means that you'll need to create an alert for each pot you want to monitor. The current syntax is `Water $tag_plant in $tag_pot pot!`
* Google doesn't have a "pot type" entity, and to use "glass pots" you'll need to make a custom entity so might as well put those together
* Google also doesn't have a "plant type" entity so you'll need to make your own too. Model it off of your Grafana tags and you should be fine