"use babel";

var $ = require('atom-space-pen-views');

var DataAtomView = require('./data-atom-view');
var DataResultView = require('./data-result-view');
var NewConnectionDialog = require('./new-connection-dialog');
var DbFactory = require('./data-managers/db-factory');

/*
  The main entry and controller for Data Atom.
  - A single DataAtomView is used, shown or hidden based on the state of a editor
  - A DataResultView is kept for each editor and swapped in/out of the DataAtomView as required
  - This gives the feeling that each editor has their own results but we only have 1 single toolbar for connections etc.
*/
module.exports =
class DataAtomController {
  constructor(serializeState) {
    // Holds a mapping from editor ID to the DataResultView and some options for that editor view
    this.viewToEditor = {};

    this.mainView = new DataAtomView();
    atom.commands.add('atom-workspace', 'data-atom:new-connection', () => this.createNewConnection());
    atom.commands.add('atom-workspace', 'data-atom:disconnect', () => this.onDisconnect());
    atom.commands.add('atom-workspace', 'data-atom:connection-changed', () => this.onConnectionChanged());
    atom.commands.add('atom-workspace', 'data-atom:result-view-height-changed', (e) => this.currentViewState.height = $(e.target).height());

    atom.commands.add('atom-workspace', 'data-atom:execute', () => this.execute());
    atom.commands.add('atom-workspace', 'data-atom:toggle-results-view', () => this.toggleView());

    atom.workspace.onDidChangeActivePaneItem(() => this.onActivePaneChanged());
  }
  // show the results view for the selected editor
  onActivePaneChanged() {
    this.mainView.hide();
    this.currentViewState = null;
    if (atom.workspace.getActiveTextEditor() && atom.workspace.getActiveTextEditor().id) {
      this.currentViewState = this.viewToEditor[atom.workspace.getActiveTextEditor().id];
      if (this.currentViewState && this.currentViewState.isShowing) {
        this.showResultsView();
      }
    }
  }

  destroy() {
    //this.mainView.off('data-atom:new-connection');
    this.currentViewState = null;
  }

  serialize() {}

  // Gets or creates the ResultView state for the current editor
  getOrCreateCurrentResultView() {
    if (!this.currentViewState && !this.viewToEditor[atom.workspace.getActiveTextEditor().id]) {
      this.viewToEditor[atom.workspace.getActiveTextEditor().id] = {view: new DataResultView(), isShowing: false, dataManager: null, height: 200};
    }

    this.currentViewState = this.viewToEditor[atom.workspace.getActiveTextEditor().id];
    return this.currentViewState;
  }

  showResultsView() {
    this.mainView.setResultView(this.getOrCreateCurrentResultView().view);
    // set the selected connection too
    if (this.currentViewState.dataManager)
      this.mainView.headerView.setConnection(this.currentViewState.dataManager.getConnectionName());
    else
      this.mainView.headerView.setConnection('0');

    this.mainView.show();
    this.mainView.height(this.currentViewState.height);
    this.currentViewState.isShowing = true;
  }

  toggleView() {
    if (this.mainView.isShowing)
      this.mainView.hide();
    else
      this.showResultsView();
    this.getOrCreateCurrentResultView().isShowing = this.mainView.isShowing;
  }

  onConnectionChanged() {
    var selectedName = this.mainView.headerView.getSelectedConnection();
    for (var key in this.viewToEditor) {
      var value = this.viewToEditor[key];
      if (value.dataManager && value.dataManager.getConnectionName() == selectedName) {
        this.currentViewState.dataManager = value.dataManager;
        break;
      }
    }
  }

  onDisconnect() {
    var disconnectingDataManager = this.currentViewState.dataManager;
    // remove from all views that have it as an active connection
    for (var key in this.viewToEditor) {
      var value = this.viewToEditor[key];
      if (value.dataManager && value.dataManager.getConnectionName() == disconnectingDataManager.getConnectionName())
        value.dataManager = null;
    }
    disconnectingDataManager.destroy();
    this.currentViewState.dataManager = null;
  }

  createNewConnection(thenDo) {
    // prompt for a connection
    if (!this.newConnectionDialog)
    this.newConnectionDialog = new NewConnectionDialog( (url) => {
      var dbManager = DbFactory.createDataManagerForUrl(url)
      this.getOrCreateCurrentResultView().dataManager = dbManager;

      dbManager.getDatabaseNames(names => {
        // tell the view so it can list them in the drop down
        this.mainView.headerView.addConnection(dbManager.getConnectionName());
        this.mainView.headerView.addDbNames(names);
      });

      if (thenDo)
        thenDo();
    });
    this.newConnectionDialog.show();
  }

  /**
   * The Execute command. If no current connections it will prompt for a connect and then execute. Otherwise it'll execute the statement(s) on the current connection
   */
  execute() {
    if (!this.currentViewState || !this.currentViewState.dataManager)
      this.createNewConnection(() => this.actuallyExecute(this.currentViewState));
    else
      this.actuallyExecute(this.currentViewState);
  }

  actuallyExecute(executingViewState) {
    // make sure it's showing the results view
    this.showResultsView();
    executingViewState.view.clear();

    var editor = atom.workspace.getActiveTextEditor();
    var query = editor.getSelectedText() ? editor.getSelectedText() : editor.getText();

    executingViewState.dataManager.execute(query,
      results => executingViewState.view.setResults(results),
      err => executingViewState.view.setMessage(err));
  }
}
