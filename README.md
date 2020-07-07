# Test it

```
sam local start-api
```

# Deploy

```
npm run build && npm run package && npm run deploy

rm -rf dist && tsc && 'cp' -rf dist/ /g/Source/zerotoheroes/firestone/core/node_modules/\@firestone-hs/simulate-bgs-battle/
rm -rf dist && tsc && npm publish
```

# Reference

Used this project as template: https://github.com/alukach/aws-sam-typescript-boilerplate

# TODO

Some things are not done yet:

-   Some edge cases about minions spawning order, which won't be tackled for now
-   There's no guide on how to use it (either as a standalone package or via an API). Ping me if you'd like to use it
