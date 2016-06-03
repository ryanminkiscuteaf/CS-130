# conjurer

If you've tried to run this project before, please delete the node_modules directory and run npm install again.


```
cd conjurer/
npm install
grunt build # might need: npm install -g grunt-cli
grunt serve
```

Your default browser should then open the app. It'll take some time to load, but check the console to see if it's still working.

ONLY edit things in the `/src` directory, not the generated `/dist` directory. Webpack will handle it all automatically. Hopefully.

You don't have to manually `grunt build` and `grunt serve` every time. Open two terminals in the `conjurer` directory, and run `grunt watch` in one and `grunt serve` in the other. The app will now automatically update with any changes you make.

Create a new file for each React module. Import them as needed.