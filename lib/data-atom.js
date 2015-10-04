"use babel";

var DataAtomController = require('./data-atom-controller');
var StatusBarManager = require('./status-bar-manager');

module.exports = {
  activate: function(state) {
    this.statusBarManager = new StatusBarManager();
    this.dataAtomController = new DataAtomController(state, this.statusBarManager);
  },

  deactivate: function() {
    this.dataAtomController.destroy();
    this.statusBarManager.detach();
  },

  serialize: function() {
    dataAtomConrtollerState: this.dataAtomController.serialize();
  },

  consumeStatusBar: function(statusBar) {
    this.statusBarManager.attachTo(statusBar);
  }
};
