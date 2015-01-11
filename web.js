#!/usr/bin/env node

var express = require("express");
var app = express();
var Spooky = require('spooky');

// adoped from Heroku's [Getting Started][] and [Spooky][]'s sample
// [Getting Started]: https://devcenter.heroku.com/articles/getting-started-with-nodejs
// [Spooky]: https://github.com/WaterfallEngineering/SpookyJS

var spooky = new Spooky({
        child: {
            transport: 'http'
        },
        casper: {
            logLevel: 'debug',
            verbose: true
        }
    }, function (err) {
        if (err) {
            e = new Error('Failed to initialize SpookyJS');
            e.details = err;
            throw e;
        }
    });

spooky.on('error', function (e, stack) {
    console.error(e);

    if (stack) {
        console.log(stack);
    }
});

function spookyTest() {
    console.log('In spooky test');
    spooky.start('https://ifttt.com/forgot');
    spooky.then(function () {
         this.fill('form[action="/forgot"]', { 'user[email': 'login@codyhoover.com' }, true);
    });
    spooky.then(function () {
      this.echo(this.getPageContent());
      this.echo(this.getCurrentUrl());
    });
    spooky.run();
    console.log('Spooky.run called');
}

/*
// Uncomment this block to see all of the things Casper has to say.
// There are a lot.
// He has opinions.
spooky.on('console', function (line) {
    console.log(line);
});
*/
var gGreeting = 'Hello World';

spooky.on('hello', function (greeting) {
    console.log(greeting);
    gGreeting = greeting;
});

spooky.on('log', function (log) {
    if (log.space === 'remote') {
        console.log(log.message.replace(/ \- .*/, ''));
    }
});


app.use(express.logger());
app.get('/', function(request, response) {
    spookyTest();
    response.send('ok');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});