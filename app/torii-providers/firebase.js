import Ember from "ember";

export default Ember.Object.extend({
  firebase: function() {
    return this.container.lookup("adapter:application").get("firebase");
  }.property(),

  open: function(options) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.get("firebase").authWithOAuthPopup(options.authWith, function(error, authData) {
        if (error) {
          reject(error);
        } else {
          resolve(authData);
        }
      });
    });
  }
});
