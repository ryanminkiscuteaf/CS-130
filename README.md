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

***

PartsBin 

Please look at src/js/SampleItems.js to see the format of data the PartsBin accepts.

You can pass a generic object with any size because the parts bin will automatically resize it AS LONG AS at least one of the shapes has "top = 0" and another one has "left = 0". The parts bin needs these two constraints to correctly calculate the size of the generic objects.

The parts bin listens to three events:
1. PARTS_BIN_ADD_ITEM_EVENT (Look at src/js/Conjurer.js for example on this)
2. PARTS_BIN_REMOVE_ITEM_EVENT
3. PARTS_BIN_REPLACE_ITEM_EVENT

REMEMBER to use the global event emitter in src/js/event/EventEmitter.js and use the event names in src/js/event/EventNames.js.

IMPORTANT: 
- Currently parts bin uses Draggable Generic so don't drag the object out of the parts bin.- Click on the object to clone it. 
- Click anywhere on the screen to add a new object to the parts bin.