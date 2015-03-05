#!/usr/bin/env node

var express = require("express");
var app = express();
var cors = require('cors')
var Spooky = require('spooky');

// adoped from Heroku's [Getting Started][] and [Spooky][]'s sample
// [Getting Started]: https://devcenter.heroku.com/articles/getting-started-with-nodejs
// [Spooky]: https://github.com/WaterfallEngineering/SpookyJS

// To Test:
// - Hackernews
// - MySpace
var websites = {
    "dropbox": {
        "url": "https://www.dropbox.com/forgot",
        "form": "form.password-reset-form",
        "input": "input[name='email']"
    }, "github": {
        "url": "https://github.com/password_reset",
        "form": "form[action='/password_reset']",
        "input": "input[name='email']"
    }, "heroku": {
        "url": "https://id.heroku.com/account/password/reset",
        "form": "form[method='post']",
        "input": "input[name='email']"
    }, "ifttt": {
        "url": "https://ifttt.com/forgot",
        "form": "form[action='/forgot']",
        "input": "input[name='user[email]']"
    }, "imgur": {
        "url": "https://imgur.com/signin/forgotpassword",
        "form": "#form",
        "input": "input[name='username_email']"
    }, "myspace": {
        "url": "https://myspace.com/forgotpassword",
        "form": "form[action='/ajax/account/forgotpassword']",
        "input": "input[name='email']"
    }, "pinterest": {
        "url": "https://www.pinterest.com/password/reset/",
        "form": "form.standardForm",
        "input": "input[name='email']"
    }, "stackoverflow": {
        "url": "https://stackoverflow.com/users/account-recovery",
        "form": "form[action='/users/account-recovery']",
        "input": "input[name='email']"
    }, "tumblr": {
        "url": "https://www.tumblr.com/forgot_password",
        "form": "form[action='/forgot_password']",
        "input": "input[name='email']"
    }
};

function resetAllWebsites (email) {
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

        spooky.start();
        var keys = Object.keys(websites);
        for (var i=keys.length; i--;) {
            addWebsiteStep(spooky, email, websites[keys[i]]);
        }
        spooky.run();
    });

    spooky.on('error', function (e, stack) {
        console.error(e);

        if (stack) {
            console.log(stack);
        }
    });

    spooky.on('log', function (log) {
        if (log.space === 'remote') {
            console.log(log.message.replace(/ \- .*/, ''));
        }
    });
}

function resetWebsite(email, website) {
    console.log("Reset " + email + ": " + JSON.stringify(website));
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

        spooky.start();
        addWebsiteStep(spooky, email, website);
        spooky.run();
    });

    spooky.on('error', function (e, stack) {
        console.error(e);

        if (stack) {
            console.log(stack);
        }
    });

    spooky.on('log', function (log) {
        if (log.space === 'remote') {
            console.log(log.message.replace(/ \- .*/, ''));
        }
    });

    // Uncomment this block to see all of the things Casper has to say.
    // There are a lot.
    // He has opinions.
    spooky.on('console', function (line) {
       console.log(line);
    });    
}

function addWebsiteStep(spooky, email, website) {
    var data = {};
    data[website.input] = email;
    console.log('addWebsiteStep for ' + email + " - " + website.url + " - " + JSON.stringify(data));    
    spooky.thenOpen(website.url);
    spooky.then([{        
        form: website.form,
        data: data,
    }, function() {        
        this.fillSelectors(form, data, true);
    }]);
    spooky.then(function () {
      this.echo(this.getCurrentUrl());
    });
}

// EXPRESS REQUEST HANDLERS
app.use(express.logger());

var whitelist = ['http://example1.com', 'http://example2.com'];
var corsOptions = {
  origin: function(origin, callback){
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  }
};

var whitelist = ['http://perfectpass.org', 'http://localhost:4000'];
var corsOptions = {
	origin: function(origin, callback){
		var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
		callback(null, originIsWhitelisted);
	}
};

// Web Server Method Block
app.get('/', function(reques, response) {  
    response.send('Hello. Use the endpoint /resetpassword/:email to reset emails');
});

// Web Server TEST Method Block
app.get('/resetpassword/test/', cors(corsOptions), function(req, response, next) {  
    var resetEmail = req.param('email');
    var testSite = req.param('site');
    console.log('TEST: Resetting password for ' + resetEmail + " for " + testSite);
    if (websites[testSite]) {
    	resetWebsite(resetEmail, websites[testSite]);
    	response.json({message: "Resetting password for " + resetEmail + " at the site " + testSite});
	} else {
		response.json({error: "Site not supported."});
	}
});

app.get('/resetpassword/:email', cors(corsOptions), function(request, response, next) {
    resetEmail = request.param('email');
    console.log('Resetting all passwords for: ' + resetEmail);
    resetAllWebsites(resetEmail);
    response.send('Resetting all passwords for: ' + resetEmail);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
