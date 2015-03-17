{WorkspaceView} = require 'atom-space-pen-views'

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

   describe "when modifying the URL it updates the other fields", ->
      modifiedDelay = null
      view = null

      beforeEach ->
         view = new NewConnectionView(() =>)
         view.show()
         view.url.isFocused = true # hack!
         modifiedDelay = view.url.getEditor().getBuffer().stoppedChangingDelay

      it "updates the server field", ->
         expect(view.dbServer.getText()).toEqual('')
         view.url.setText('postgresql://localhost')
         advanceClock(modifiedDelay)
         expect(view.dbServer.getText()).toEqual('localhost')

      it "updates the server field with full url", ->
         expect(view.dbServer.getText()).toEqual('')
         view.url.setText('postgresql://user:password1@server:9873/awesomeDb')
         advanceClock(modifiedDelay)
         expect(view.dbServer.getText()).toEqual('server')

      it "updates the port field with full url", ->
         expect(view.dbPort.getText()).toEqual('')
         view.url.setText('postgresql://user:password1@server:9873/awesomeDb')
         advanceClock(modifiedDelay)
         expect(view.dbPort.getText()).toEqual('9873')

      it "updates the db name field with full url", ->
         expect(view.dbName.getText()).toEqual('')
         view.url.setText('postgresql://user:password1@server:9873/myDb')
         advanceClock(modifiedDelay)
         expect(view.dbName.getText()).toEqual('myDb')

      it "updates the user & password field with full url", ->
         expect(view.dbUser.getText()).toEqual('')
         expect(view.dbPassword.getText()).toEqual('')
         view.url.setText('postgresql://me:password1@server:9873/myDb')
         advanceClock(modifiedDelay)
         expect(view.dbUser.getText()).toEqual('me')
         expect(view.dbPassword.getText()).toEqual('password1')

      it "updates the options from url", ->
         expect(view.dbOptions.getText()).toEqual('')
         view.url.setText('postgresql://me:password1@server/myDb?o=v&hello=world')
         advanceClock(modifiedDelay)
         expect(view.dbOptions.getText()).toEqual('o=v, hello=world')

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

      it "reads the options", ->
         view.dbOptions.setText('ssl=true')
         view.dbServer.setText('places')
         advanceClock(modifiedDelay)
         expect(view.url.getText()).toEqual('postgresql://places/?ssl=true')

      it "reads multiple options", ->
         view.dbOptions.setText('ssl=true, option=val')
         view.dbServer.setText('places')
         advanceClock(modifiedDelay)
         expect(view.url.getText()).toEqual('postgresql://places/?ssl=true&option=val')
