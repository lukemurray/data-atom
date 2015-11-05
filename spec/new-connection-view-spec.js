"use babel";

import {$} from 'atom-space-pen-views';

import NewConnectionDialog from '../lib/views/new-connection-dialog';

describe('NewConnectionDialog', () => {
  beforeEach(() => {
    var workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);
  });

  describe('when calling show and close', () => {
    it("shows then closes", () => {
      var view = new NewConnectionDialog(() => {});
      expect($(document).find('.data-atom.dialog')).not.toExist();
      view.show();
      expect($(document).find('.data-atom.dialog')).toExist();
      view.close();
      expect($(document).find('.data-atom.dialog')).not.toExist();
    });
  });

  describe("when modifying the URL it updates the other fields", () => {
    var modifiedDelay = null;
    var view = null;

    beforeEach(() => {
      view = new NewConnectionDialog(() => {});
      view.show();
      view.refs.url.focus();
      modifiedDelay = view.refs.url.getModel().getBuffer().stoppedChangingDelay;
    });

    it("updates the server field", () => {
      expect(view.refs.dbServer.getModel().getText()).toEqual('');
      view.refs.url.getModel().setText('postgresql://localhost');
      advanceClock(modifiedDelay);
      expect(view.refs.dbServer.getModel().getText()).toEqual('localhost');
    });

    it("updates the server field with full url", () => {
      expect(view.refs.dbServer.getModel().getText()).toEqual('');
      view.refs.url.getModel().setText('postgresql://user:password1@server:9873/awesomeDb');
      advanceClock(modifiedDelay);
      expect(view.refs.dbServer.getModel().getText()).toEqual('server');
    });

    it("updates the port field with full url", () => {
      expect(view.refs.dbPort.getModel().getText()).toEqual('');
      view.refs.url.getModel().setText('postgresql://user:password1@server:9873/awesomeDb');
      advanceClock(modifiedDelay);
      expect(view.refs.dbPort.getModel().getText()).toEqual('9873');
    });

    it("updates the db name field with full url", () => {
      expect(view.refs.dbName.getModel().getText()).toEqual('');
      view.refs.url.getModel().setText('postgresql://user:password1@server:9873/myDb');
      advanceClock(modifiedDelay);
      expect(view.refs.dbName.getModel().getText()).toEqual('myDb');
    });

    it("updates the user & password field with full url", () => {
      expect(view.refs.dbUser.getModel().getText()).toEqual('');
      expect(view.refs.dbPassword.getModel().getText()).toEqual('');
      view.refs.url.getModel().setText('postgresql://me:password1@server:9873/myDb');
      advanceClock(modifiedDelay);
      expect(view.refs.dbUser.getModel().getText()).toEqual('me');
      expect(view.refs.dbPassword.getModel().getText()).toEqual('password1');
    });

    it("updates the options from url", () => {
      expect(view.refs.dbOptions.getModel().getText()).toEqual('');
      view.refs.url.getModel().setText('postgresql://me:password1@server/myDb?o=v&hello=world');
      advanceClock(modifiedDelay);
      expect(view.refs.dbOptions.getModel().getText()).toEqual('o=v, hello=world');
    });
  });

  describe("when modifying values other than URL", () => {
    var view = null;

    beforeEach(() => {
      view = new NewConnectionDialog(() => {});
      view.show();
    });

    it("reads the server value", () => {
      view.refs.dbServer.focus();
      view.refs.dbServer.getModel().setText('my-server');
      expect(view.refs.url.getModel().getText()).toEqual('postgresql://my-server');
    });

    it("reads the port value", () => {
      view.refs.dbServer.focus();
      view.refs.dbServer.getModel().setText('my-server');
      view.refs.dbPort.getModel().setText('1122');
      expect(view.refs.url.getModel().getText()).toEqual('postgresql://my-server:1122');
    });

    it("reads the username & password value", () => {
      view.refs.dbServer.focus();
      view.refs.dbServer.getModel().setText('my-server');
      view.refs.dbUser.getModel().setText('admin');
      view.refs.dbPassword.getModel().setText('badPass');
      expect(view.refs.url.getModel().getText()).toEqual('postgresql://admin:badPass@my-server');
    });

    it("reads the db name value", () => {
      view.refs.dbServer.focus();
      view.refs.dbServer.getModel().setText('my-server');
      view.refs.dbName.getModel().setText('places');
      expect(view.refs.url.getModel().getText()).toEqual('postgresql://my-server/places');
    });

    it("reads the options", () => {
      view.refs.dbServer.focus();
      view.refs.dbOptions.getModel().setText('ssl=true');
      view.refs.dbServer.getModel().setText('places');
      expect(view.refs.url.getModel().getText()).toEqual('postgresql://places/?ssl%3Dtrue');
    });

    it("reads multiple options", () => {
      view.refs.dbServer.focus();
      view.refs.dbOptions.getModel().setText('ssl=true, option=val');
      view.refs.dbServer.getModel().setText('places');
      expect(view.refs.url.getModel().getText()).toEqual('postgresql://places/?ssl%3Dtrue&option%3Dval');
    });
  });
});
