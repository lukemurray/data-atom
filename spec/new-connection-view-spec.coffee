{WorkspaceView} = require 'atom'

NewConnectionView = require '../lib/new-connection-view'

describe "NewConnectionView", ->
   beforeEach ->
      atom.workspaceView = new WorkspaceView
      activationPromise = atom.packages.activatePackage('data-atom')

   describe "when calling show and close", ->
      it "shows then closes", ->
         view = new NewConnectionView(() =>)
         expect(atom.workspaceView.find('.connection-dialog')).not.toExist()
         view.show()
         expect(atom.workspaceView.find('.connection-dialog')).toExist()
         view.close()
         expect(atom.workspaceView.find('.connection-dialog')).not.toExist()

   describe "when modifying values other than URL", ->
      modifiedDelay = null
      view = null

      beforeEach ->
         view = new NewConnectionView(() =>)
         view.show()
         modifiedDelay = view.url.getEditor().getBuffer().stoppedChangingDelay

      it "reads the server value", ->
         view.dbServer.setText('my-server')
         advanceClock(modifiedDelay)
         expect(view.url.getText()).toEqual('postgresql://my-server/')

      it "reads the port value", ->
         view.dbServer.setText('my-server')
         view.dbPort.setText('1122')
         advanceClock(modifiedDelay)
         expect(view.url.getText()).toEqual('postgresql://my-server:1122/')

      it "reads the username & password value", ->
         view.dbServer.setText('my-server')
         view.dbUser.setText('admin')
         view.dbPassword.setText('badPass')
         advanceClock(modifiedDelay)
         expect(view.url.getText()).toEqual('postgresql://admin:badPass@my-server/')

      it "reads the db name value", ->
         view.dbServer.setText('my-server')
         view.dbName.setText('places')
         advanceClock(modifiedDelay)
         expect(view.url.getText()).toEqual('postgresql://my-server/places')
