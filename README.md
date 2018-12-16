# Garden IoT

## Your garden, now with Google Assistant

### Build status
[![Build Status](https://travis-ci.org/guppy0130/garden-iot.svg?branch=master)](https://travis-ci.org/guppy0130/garden-iot)

## What is it?

Intermediary between Grafana and Google Assistant. When Grafana triggers an alert, send a webhook to this, which will parse the webhook and store the state contained in the hook. Actions on Google/Google Assistant can then query this service, which will return the stored state.

## Testing/Deployment

```bash
git clone git@git{lab, hub}.com/guppy0130/garden-iot.git
cd garden-iot
npm test
```


1. Deploy to Heroku/other server of choice.
2. Point Actions on Google at it
3. Point Grafana at it

## Known Issues

* Grafana doesn't support tags in alerts! This means that you'll need to create an alert for each pot you want to monitor. The current syntax is `Water $tag_plant in $tag_pot pot!`