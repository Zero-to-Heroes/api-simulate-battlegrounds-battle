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
