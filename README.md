# Heroku app: phantom-password-resetter

A simple [NodeJS][] Heroku application that uses [SpookyJS][] to control a headless browser ([PhantomJS][] with [CasperJS][]) to submit password reset forms.

## Using the Service

The server responds to GET requests made to the url: https://password-resetter.herokuapp.com/resetpassword/:email

For example, a request to https://password-resetter.herokuapp.com/resetpassword/test@example.com will attempt to reset the password for all sites for the email test@example.com

## Contributing

Passwords are reset by using using a headless browser to navigate to the reset form, fill in the email, and submit the form. The websites are encoded in a simple JSON object in the web.js file as shown below. The three required values are the url for the form and the css selectors needed to find the form that will be submitted and the input that should be filled out. This may change to accomodate more complicated forms in the future.

```
var websites = {
    dropbox: {
        url: 'https://www.dropbox.com/forgot',
        form: 'form.password-reset-form',
        input: "input[name='email']"
    }, ifttt: {
        url: 'https://ifttt.com/forgot',
        form: "form[action='/forgot']",
        input: "input[name='user[email]']"
    }
};
```

## More info

This application uses [buildpack-multi][] to cascade [buildpack-casperjs][] and [buildpack-nodejs][].

```bash
$ cat .buildpacks 
https://github.com/leesei/heroku-buildpack-casperjs.git
https://github.com/heroku/heroku-buildpack-nodejs
```

[PhantomJS][] is also available from `buildpack-casperjs`, you may as well drive it from Node.

[buildpack-casperjs]: https://github.com/leesei/heroku-buildpack-casperjs
[buildpack-multi]: https://github.com/ddollar/heroku-buildpack-multi
[buildpack-nodejs]: https://github.com/heroku/heroku-buildpack-nodejs
[CasperJS]: http://casperjs.org/
[NodeJS]: http://nodejs.org/
[PhantomJS]: http://www.phantomjs.org/
[SpookyJS]: https://github.com/WaterfallEngineering/SpookyJS
