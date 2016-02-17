"use babel";

import DataAtomController from './data-atom-controller';
import StatusBarManager from './status-bar-manager';
import SQLMetaProvider from './sql-meta-provider';

export default {
  provide: function() {
    return SQLMetaProvider;
  },

  config: {
    showDetailsViewOnRightSide: {
      type: 'boolean',
      default: true,
    },
    openDetailsViewWhenOpeningMainResultsView: {
      type: 'boolean',
      default: false,
    },
    useQueryAtCursor: {
      type: 'boolean',
      default: false,
      description: 'If checked, only execute the query at the active cursor; otherwise, use the entire buffer\'s text.'
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
