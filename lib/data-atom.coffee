DataAtomController = require('./data-atom-controller')

dataAtomController = null

module.exports =
   dataAtomController: null

   activate: (state) ->
      dataAtomController = new DataAtomController(state)

   deactivate: ->
      dataAtomController.destroy()
      console.log("Data Atom off")

   serialize: ->
      dataAtomConrtollerState: dataAtomController.serialize()
