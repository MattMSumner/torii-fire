import Ember from "ember";
import {
  moduleFor,
  test
} from "ember-qunit";

moduleFor("torii-provider:firebase", {
  needs: ["adapter:application"]
});

test("it exists", function(assert) {
  let provider = this.subject();
  assert.ok(!!provider);
});

test("#firebase returns the firebase from ApplicationAdapter", function(assert) {
  let provider = this.subject();
  let adapter = provider.get("container").lookup("adapter:application");
  const firebaseMock = sinon.spy();
  adapter.set("firebase", firebaseMock);

  assert.equal(provider.get("firebase"), firebaseMock);
});

test("#open when firebase.authWithOAuthPopup errors", function(assert) {
  let provider = this.subject();
  let adapter = provider.get("container").lookup("adapter:application");
  let errorMock = sinon.spy();
  const firebaseMock = {
    authWithOAuthPopup: sinon.stub().yields(errorMock)
  };
  adapter.set("firebase", firebaseMock);

  Ember.run(function() {
    provider.open({authWith: "errorProvider"}).catch(function(error) {
      assert.ok(firebaseMock.authWithOAuthPopup.calledWith("errorProvider"));

      assert.equal(error, errorMock);
    });
  });
});

test("#open when firebase.authWithOAuthPopup returns authData", function(assert) {
  let provider = this.subject();
  let adapter = provider.get("container").lookup("adapter:application");
  let authDataMock = sinon.spy();
  const firebaseMock = {
    authWithOAuthPopup: sinon.stub().yields(null, authDataMock)
  };
  adapter.set("firebase", firebaseMock);

  Ember.run(function() {
    provider.open({authWith: "successProvider"}).then(function(authData) {
      assert.ok(firebaseMock.authWithOAuthPopup.calledWith("successProvider"));

      assert.equal(authData.authData, authDataMock);
    });
  });
});
