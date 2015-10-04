"use babel";

var {$} = require('atom-space-pen-views');

var NewConnectionDialog = require('../lib/new-connection-dialog');

describe('NewConnectionDialog', () => {
  beforeEach(() => {
    var workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);
    var activationPromise = atom.packages.activatePackage('data-atom');
  });

  describe('when calling show and close', () => {
    it("shows then closes", () => {
      var view = new NewConnectionDialog(() => {});
      expect($(document).find('.connection-dialog')).not.toExist();
      view.show();
      expect($(document).find('.connection-dialog')).toExist();
      view.close();
      expect($(document).find('.connection-dialog')).not.toExist();
    });
  });

  describe("when modifying the URL it updates the other fields", () => {
    var modifiedDelay = null;
    var view = null;

    beforeEach(() => {
      view = new NewConnectionDialog(() => {});
      view.show();
      view.url.isFocused = true; // hack!
      modifiedDelay = view.url.getModel().getBuffer().stoppedChangingDelay;
    });

    it("updates the server field", () => {
      expect(view.dbServer.getModel().getText()).toEqual('');
      view.url.getModel().setText('postgresql://localhost');
      advanceClock(modifiedDelay);
      expect(view.dbServer.getModel().getText()).toEqual('localhost');
    });

    it("updates the server field with full url", () => {
      expect(view.dbServer.getModel().getText()).toEqual('');
      view.url.getModel().setText('postgresql://user:password1@server:9873/awesomeDb');
      advanceClock(modifiedDelay);
      expect(view.dbServer.getModel().getText()).toEqual('server');
    });

    it("updates the port field with full url", () => {
      expect(view.dbPort.getModel().getText()).toEqual('');
      view.url.getModel().setText('postgresql://user:password1@server:9873/awesomeDb');
      advanceClock(modifiedDelay);
      expect(view.dbPort.getModel().getText()).toEqual('9873');
    });

    it("updates the db name field with full url", () => {
      expect(view.dbName.getModel().getText()).toEqual('');
      view.url.getModel().setText('postgresql://user:password1@server:9873/myDb');
      advanceClock(modifiedDelay);
      expect(view.dbName.getModel().getText()).toEqual('myDb');
    });

    it("updates the user & password field with full url", () => {
      expect(view.dbUser.getModel().getText()).toEqual('');
      expect(view.dbPassword.getModel().getText()).toEqual('');
      view.url.getModel().setText('postgresql://me:password1@server:9873/myDb');
      advanceClock(modifiedDelay);
      expect(view.dbUser.getModel().getText()).toEqual('me');
      expect(view.dbPassword.getModel().getText()).toEqual('password1');
    });

    it("updates the options from url", () => {
      expect(view.dbOptions.getModel().getText()).toEqual('');
      view.url.getModel().setText('postgresql://me:password1@server/myDb?o=v&hello=world');
      advanceClock(modifiedDelay);
      expect(view.dbOptions.getModel().getText()).toEqual('o=v, hello=world');
    });
  });

  describe("when modifying values other than URL", () => {
    var modifiedDelay = null;
    var view = null;

    beforeEach(() => {
      view = new NewConnectionDialog(() => {});
      view.show();
      modifiedDelay = view.url.getModel().getBuffer().stoppedChangingDelay + 10;
    });

    it("reads the server value", () => {
      view.dbServer.getModel().setText('my-server');
      advanceClock(modifiedDelay);
      expect(view.url.getModel().getText()).toEqual('postgresql://my-server/');
    });

    it("reads the port value", () => {
      view.dbServer.getModel().setText('my-server');
      view.dbPort.getModel().setText('1122');
      advanceClock(modifiedDelay);
      expect(view.url.getModel().getText()).toEqual('postgresql://my-server:1122/');
    });

    it("reads the username & password value", () => {
      view.dbServer.getModel().setText('my-server');
      view.dbUser.getModel().setText('admin');
      view.dbPassword.getModel().setText('badPass');
      advanceClock(modifiedDelay);
      expect(view.url.getModel().getText()).toEqual('postgresql://admin:badPass@my-server/');
    });

    it("reads the db name value", () => {
      view.dbServer.getModel().setText('my-server');
      view.dbName.getModel().setText('places');
      advanceClock(modifiedDelay);
      expect(view.url.getModel().getText()).toEqual('postgresql://my-server/places');
    });

    it("reads the options", () => {
      view.dbOptions.getModel().setText('ssl=true');
      view.dbServer.getModel().setText('places');
      advanceClock(modifiedDelay);
      expect(view.url.getModel().getText()).toEqual('postgresql://places/?ssl=true');
    });

    it("reads multiple options", () => {
      view.dbOptions.getModel().setText('ssl=true, option=val');
      view.dbServer.getModel().setText('places');
      advanceClock(modifiedDelay);
      expect(view.url.getModel().getText()).toEqual('postgresql://places/?ssl=true&option=val');
    });
  });
});
