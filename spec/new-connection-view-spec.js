"use babel";

import NewConnectionDialog from '../lib/views/new-connection-dialog';

function findDataAtomDialog(workspace) {
  return [].slice.call(workspace.getElementsByTagName('section')).filter(i => i.classList.contains('data-atom') && i.classList.contains('dialog'));
}

describe('NewConnectionDialog', () => {
  beforeEach(() => {
    var workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);
  });

  describe('when calling show and close', () => {
    it("shows then closes", () => {
      var view = new NewConnectionDialog(() => {});
      expect(findDataAtomDialog(document).length).toEqual(0);
      view.show();
      expect(findDataAtomDialog(document).length).toEqual(1);
      view.close();
      expect(findDataAtomDialog(document).length).toEqual(0);
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

    it("works with hash in pass", () => {
      expect(view.refs.dbOptions.getModel().getText()).toEqual('');
      view.refs.url.getModel().setText('postgresql://me:pass#word1@server/myDb');
      advanceClock(modifiedDelay);
      expect(view.refs.dbPassword.getModel().getText()).toEqual('pass#word1');
      expect(view.state.escapedUrl).toEqual('postgresql://me:pass%23word1@server/myDb');
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
      expect(view.refs.url.getModel().getText()).toEqual('postgresql://my-server/');
    });

    it("reads the port value", () => {
      view.refs.dbServer.focus();
      view.refs.dbServer.getModel().setText('my-server');
      view.refs.dbPort.getModel().setText('1122');
      expect(view.refs.url.getModel().getText()).toEqual('postgresql://my-server:1122/');
    });

    it("reads the username & password value", () => {
      view.refs.dbServer.focus();
      view.refs.dbServer.getModel().setText('my-server');
      view.refs.dbUser.getModel().setText('admin');
      view.refs.dbPassword.getModel().setText('badPass');
      expect(view.refs.url.getModel().getText()).toEqual('postgresql://admin:badPass@my-server/');
    });

    it("works with hash in pass", () => {
      view.refs.dbServer.focus();
      view.refs.dbServer.getModel().setText('my-server');
      view.refs.dbUser.getModel().setText('admin');
      view.refs.dbPassword.getModel().setText('bad#Pass');
      expect(view.refs.url.getModel().getText()).toEqual('postgresql://admin:bad%23Pass@my-server/');
      expect(view.state.escapedUrl).toEqual('postgresql://admin:bad%23Pass@my-server/');
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
      expect(view.refs.url.getModel().getText()).toEqual('postgresql://places/?ssl=true');
    });

    it("reads multiple options", () => {
      view.refs.dbServer.focus();
      view.refs.dbOptions.getModel().setText('ssl=true, option=val');
      view.refs.dbServer.getModel().setText('places');
      expect(view.refs.url.getModel().getText()).toEqual('postgresql://places/?ssl=true&option=val');
    });
  });
});
