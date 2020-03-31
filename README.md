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

rm -rf dist/simulate-bgs-battle/ && npm run build && npm publish dist/simulate-bgs-battle --access public

# TODO

Some things are not done yet:

-   Poisonous
-   Hero powers (Deathwing, Lich King, etc)
-   New cards since (and including) 16.4
-   There's a bug with the average damage (maybe it doesn't take tavern tier into account? I haven't looked into it yet)
-   Some edge cases about minions spawning order, which won't be tackled for now
-   There's no guide on how to use it (either as a standalone package or via an API). Ping me if you'd like to use it
