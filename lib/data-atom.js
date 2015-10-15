"use babel";

import DataAtomController from './data-atom-controller';
import StatusBarManager from './status-bar-manager';

export default {
  config: {
    showDetailsViewOnRightSide: {
      type: 'boolean',
      default: true,
    },
    openDetailsViewWhenOpeningMainResultsView: {
      type: 'boolean',
      default: false,
    }
  },

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
