"use babel";

var DataAtomController = require('./data-atom-controller');

var dataAtomController = null;

module.exports = {
  dataAtomController: null,

  activate: function(state) {
    dataAtomController = new DataAtomController(state);
  },

  deactivate: function() {
    dataAtomController.destroy();
    console.log("Data Atom off");
  },

  serialize: function() {
    dataAtomConrtollerState: dataAtomController.serialize();
  }
};
