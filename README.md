# Torii-fire

This addon adds a [torii-provider] for authenticating firebase applications. It
requires that you also have the firebase adapter, [emberfire], and [torii]
addons.

Here's an [example-app] showing how to use torii-fire in your application.

[torii-provider]: https://github.com/Vestorly/torii/#providers-in-torii
[emberfire]: https://github.com/firebase/emberfire
[torii]: https://github.com/Vestorly/torii
[example-app]: https://github.com/MattMSumner/chattr

## Installation using ember-cli

```bash
ember install torii-fire
```

## Torii sessions

Torii has great [session management] if you require it. What follows is a quick
guide to getting started using torii sessions with torii-fire.

First, install torii, emberfire and torii-fire:

```bash
ember install:addon torii
ember install:addon emberfire
ember install:addon torii-fire
```

You must tell torii that you'd like session management enabled and setup your
emberfire url:

```js
// config/environment.js
/* ... */
    firebase: 'https://YOUR-FIREBASE-NAME.firebaseio.com/',
    torii: {
      // a 'session' property will be injected on routes and controllers
      sessionServiceName: 'session'
    }
/* ... */
```

Next let's setup our application route, run `ember g route application` and make
the following changes to the template and route:

```handlebars
// app/templates/application.hbs
<h2 id="title">Welcome to torii-fire!</h2>

{{#if session.isAuthenticated}}
  {{outlet}}
{{else}}
  <button {{action "signIn" "github"}}>Sign in with github</button>
  <button {{action "signIn" "facebook"}}>Sign in with facebook</button>
  <button {{action "signIn" "twitter"}}>Sign in with twitter</button>
  <button {{action "signIn" "google"}}>Sign in with google</button>
{{/if}}
```

```js
// app/routes/application.js
import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    this.get("session").fetch().catch(function() {});
  },

  actions: {
    signIn: function(authWith) {
      this.get("session").open("firebase", { authWith: authWith});
    },

    logout: function() {
      this.get("session").close();
    }
  }
});
```

Now that we have our route setup calling `open`, `fetch` and `close` we'll need
to create our torii adapter to define those behaviours:

```js
import Ember from "ember";

export default Ember.Object.extend({
  open: function(authorization) {
    // This is what should be done after authentication. As an example, I'm
    // finding current user here.
    let store = this.get("container").lookup("store:main");

    return new Ember.RSVP.Promise((resolve) => {
      return store.find("user", authorization.uid).then(function(user){
        Ember.run.bind(null, resolve({currentUser: user}));
      }, () => {
        let newUser = store.createRecord("user", {
          id: authorization.uid,
          handle: this._handleFor(authorization)
        });

        newUser.save().then(function(user) {
          Ember.run.bind(null, resolve({currentUser: user}));
        });
      });
    });
  },

  fetch: function() {
    // This is what should be done to determin how to fetch a session. Here I am
    // retrieving the auth from firebase and checking if I have a user for that
    // auth. If so, I set currentUser.
    let firebase = this.get("container").lookup("adapter:application").firebase;
    let authData = firebase.getAuth();
    let store = this.get("container").lookup("store:main");

    return new Ember.RSVP.Promise(function(resolve, reject) {
      if(authData) {
        store.find("user", authData.uid).then(function(user) {
          Ember.run.bind(null, resolve({currentUser: user}));
        }, function() {
          Ember.run.bind(null, reject("no session"));
        });
      } else {
        Ember.run.bind(null, reject("no session"));
      }
    });
  },

  close: function() {
    // This is what should be done to teardown a session. Here I am unloading my
    // models and setting currentUser to null.
    let firebase = this.get("container").lookup("adapter:application").firebase;
    let store = this.get("container").lookup("store:main");

    return new Ember.RSVP.Promise(function(resolve) {
      store.unloadAll("user");
      store.unloadAll("message");
      firebase.unauth();
      resolve({currentUser: null});
    });
  },

  _handleFor: function(authorization) {
    if(authorization.github) {
      return authorization.github.username;
    } else if(authorization.facebook) {
      return authorization.facebook.displayName;
    } else if(authorization.twitter) {
      return authorization.twitter.displayName;
    } else if(authorization.google) {
      return authorization.google.displayName;
    } else {
      throw new Error("couldn't find a username!");
    }
  }
});
```

The above code assumes user and message models are defined.

[session management]: https://github.com/Vestorly/torii#session-management-in-torii

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
