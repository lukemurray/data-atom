DataAtomView = require('./data-atom-view')

dataAtomView = null

module.exports =
   dataAtomView: null

   activate: (state) ->
      dataAtomView = new DataAtomView()

   deactivate: ->
      dataAtomView.destroy()
      console.log("Data Atom off")

   serialize: ->
      dataAtomViewState: dataAtomView.serialize()
