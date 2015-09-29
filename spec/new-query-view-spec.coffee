{WorkspaceView} = require 'atom-space-pen-views'

NewConnectionDialog = require '../lib/new-query-dialog'

describe "NewQueryDialog", ->
   beforeEach ->
      atom.workspaceView = new WorkspaceView
      activationPromise = atom.packages.activatePackage('data-atom')

   describe "when calling show and close", ->
      it "shows then closes", ->
         view = new NewQueryDialog(() =>)
         expect(atom.workspaceView.find('.query-dialog')).not.toExist()
         view.show()
         expect(atom.workspaceView.find('.query-dialog')).toExist()
         view.close()
         expect(atom.workspaceView.find('.query-dialog')).not.toExist()
