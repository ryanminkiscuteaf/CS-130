/**
 * Created by lowellbander on 4/12/16.
 */

var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/js'));

var port = process.env.PORT || 5000;
console.log('Listening on port ', port);
app.listen(port);
