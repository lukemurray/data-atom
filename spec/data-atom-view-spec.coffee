{WorkspaceView} = require 'atom-space-pen-views'

DataAtomView = require '../lib/data-atom-view'

describe "DataAtomView", ->
   beforeEach ->
      atom.workspaceView = new WorkspaceView

   describe "when toggling view", ->
      it "it sets isShowing", ->
         view = new DataAtomView()
         expect(atom.workspaceView.find('.data-atom')).not.toExist()
         view.toggleView()
         expect(atom.workspaceView.find('.data-atom')).toExist()
         view.toggleView()
         expect(atom.workspaceView.find('.data-atom')).not.toExist()

   describe "when calling show()", ->
      it "it sets isShowing true", ->
         view = new DataAtomView()
         expect(atom.workspaceView.find('.data-atom')).not.toExist()
         view.show()
         expect(atom.workspaceView.find('.data-atom')).toExist()

   describe "when calling hide()", ->
      it "it sets isShowing false", ->
         view = new DataAtomView()
         expect(atom.workspaceView.find('.data-atom')).not.toExist()
         view.show()
         expect(atom.workspaceView.find('.data-atom')).toExist()
         view.hide()
         expect(atom.workspaceView.find('.data-atom')).not.toExist()
