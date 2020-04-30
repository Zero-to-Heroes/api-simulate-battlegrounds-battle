# Test it

```
sam local start-api
```

# Deploy

```
npm run build && npm run package && npm run deploy

rm -rf dist/simulate-bgs-battle/ && tsc && npm publish
```

# Reference

Used this project as template: https://github.com/alukach/aws-sam-typescript-boilerplate

# TODO

Some things are not done yet:

-   There's a bug with the average damage, sometimes it spits something that is lower than the tavern tier. Maybe sometimes the tavern tier is simply not properly sent?
-   Some edge cases about minions spawning order, which won't be tackled for now
-   There's no guide on how to use it (either as a standalone package or via an API). Ping me if you'd like to use it
