# Test it

```
npm install
npm run singleFile 'full-test.test'
```

Then you can just modify the `test/full-game/game3.json` file to change the boards initial compositions.

## Get a board state from the app

Look for the `MainWindow.html.log` file located in `%localappdata%\Overwolf\Log\Apps\Firestone`. Do a search for `[bgs-simulation] battle simulation request prepared`, and this line should log the full JSON that you can use as an input (typically, this is what you put in the `game3.json` file referenced above).

## Check a simulation output

You first need to download, build and run a local instance of [Coliseum](https://github.com/Zero-to-Heroes/coliseum)

Then, at the end of the test (e.g. `full-test.test` mentioned above), add / uncomment these lines:

```
const sample = simulationResult.outcomeSamples.lost[0];
const base64 = encode(JSON.stringify(sample));
```

(using `won` or `tied` instead of `lost` if that's what you're looking for).

A big base64 string will be output to the console.

Copy it, and open a new tab in your navigator at the following URL: `file:///<path_to_your_coliseum_repo>/dist/index.html?bgsSimulation=<the_big_base64_string`. It will then replay the simulation.

# Deploy

```
npm run build && npm run package && npm run deploy

rm -rf dist && tsc && rm -rf dist/node_modules && 'cp' -rf dist/ /e/Source/zerotoheroes/firestone/node_modules/\@firestone-hs/simulate-bgs-battle/
rm -rf dist && tsc && rm -rf dist/node_modules && 'cp' -rf dist/ /e/Source/zerotoheroes/coliseum/node_modules/\@firestone-hs/simulate-bgs-battle/
rm -rf dist && tsc && rm -rf dist/node_modules && 'cp' -rf dist/ /e/Source/zerotoheroes/firestone-libs/node_modules/\@firestone-hs/simulate-bgs-battle/
rm -rf dist && tsc && rm -rf dist/node_modules && npm publish
```

# Profiling

To profile a Node.js application using Chrome's DevTools, you can use the `--inspect` and `--inspect-brk` flags when running your script. Here's how you can do it:

1. Run your script with the `--inspect-brk` flag. This will start the inspector and pause execution until you connect with the debugger.

```bash
node --inspect-brk -r ts-node/register full-test.ts
```

2. Open Chrome and navigate to `chrome://inspect`.
3. Click on the "Open dedicated DevTools for Node" link. This will open a new DevTools window.
4. In the DevTools window, click on the "Profiler" tab.
5. Click on the "Start" button to start profiling.
6. Go back to your terminal and press `Enter` to continue script execution.
7. Once your script finishes executing, go back to the DevTools window and click on the "Stop" button to stop profiling.
8. You can now analyze the CPU profile in the DevTools window.

Remember to replace `node` with `npx ts-node` if you're using TypeScript without compiling to JavaScript first.

# Reference

Used this project as template: https://github.com/alukach/aws-sam-typescript-boilerplate

# TODO

Some things are not done yet:

-   Some edge cases about minions spawning order, which won't be tackled for now
-   There's no guide on how to use it (either as a standalone package or via an API). Ping me if you'd like to use it
