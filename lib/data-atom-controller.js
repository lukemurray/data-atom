"use babel";

var fs = require('fs');
var DataAtomView = require('./data-atom-view');
var DataResultView = require('./data-result-view');
var NewConnectionDialog = require('./new-connection-dialog');
var DbFactory = require('./data-managers/db-factory');

function elapsedTime(start) {
  var precision = 2; // 3 decimal places
  var elapsed = (process.hrtime(start)[0] * 1000) + (process.hrtime(start)[1] / 1000000); // divide by a million to get nano to milli
  elapsed = elapsed.toFixed(precision);
  return elapsed >= 10000 ? (elapsed/1000).toFixed(precision) + ' s' : elapsed + ' ms';
}

/*
  The main entry and controller for Data Atom.
  - A single DataAtomView is used, shown or hidden based on the state of a editor
  - Each file gets an object holding state against it, we tell the view to render that. State is height, results, selected connection/db, etc.
  - This gives the feeling that each editor has their view  but we only have 1 view and many states
  Not sure yet if it'll be quicker/better swaping out the whole view at an element or this way
*/
module.exports =
class DataAtomController {
  constructor(serializeState, statusBarManager) {
    // Holds a mapping from editor ID to the DataResultView and some options for that editor view
    this.viewToEditor = {};
    this.statusBarManager = statusBarManager;

    this.mainView = new DataAtomView();
    this.mainView.onConnectionChanged(() => this.onConnectionChanged());
    atom.commands.add('atom-workspace', 'data-atom:new-connection', () => this.createNewConnection());
    atom.commands.add('atom-workspace', 'data-atom:disconnect', () => this.onDisconnect());
    atom.commands.add('atom-workspace', 'data-atom:new-query', () => this.newQuery());
    atom.commands.add('atom-workspace', 'data-atom:execute', () => this.execute());
    atom.commands.add('atom-workspace', 'data-atom:toggle-results-view', () => this.toggleView());
    atom.commands.add('atom-workspace', 'data-atom:toggle-query-source', () => this.toggleQuerySource());
    atom.commands.add('atom-workspace', 'data-atom:edit-connections', () => this.editConnections());
    atom.workspace.onDidChangeActivePaneItem(() => this.onActivePaneChanged());
  }
  // show the results view for the selected editor
  onActivePaneChanged() {
    this.mainView.hide();
    if (atom.workspace.getActiveTextEditor() && atom.workspace.getActiveTextEditor().id) {
      var currentViewState = this.getOrCreateCurrentResultView();
      if (currentViewState && currentViewState.isShowing) {
        this.showResultsView();
      }
    }
  }

  destroy() {
  }

  serialize() {}

  // Gets or creates the ResultView state for the current editor
  getOrCreateCurrentResultView() {
    var editor = atom.workspace.getActiveTextEditor();

    if (!this.viewToEditor[editor.id]) {
      this.viewToEditor[editor.id] = {
        results: [], // no results yet
        isShowing: false,
        dataManager: null, // manages connection/db selection
        useEditorAsQuery: (/p?sql$/).test(editor.getTitle()) ? true : false
      };
    }

    return this.viewToEditor[editor.id];
  }

  showResultsView() {
    var currentViewState = this.getOrCreateCurrentResultView();
    this.mainView.setResults(currentViewState.results);
    // set the selected connection/db too
    if (currentViewState.dataManager) {
      currentViewState.dataManager.getDatabaseNames(names => this.mainView.setState(currentViewState.dataManager.getConnectionName(), names, currentViewState.dataManager.activeDatabase, currentViewState.useEditorAsQuery));
    }
    else {
      this.mainView.setState('0', [], '', currentViewState.useEditorAsQuery);
    }

    this.mainView.show();
    currentViewState.isShowing = true;
  }

  toggleView() {
    if (this.mainView.isShowing)
      this.mainView.hide();
    else
      this.showResultsView();
    this.getOrCreateCurrentResultView().isShowing = this.mainView.isShowing;
  }

  toggleQuerySource() {
    var currentState = this.getOrCreateCurrentResultView();
    currentState.useEditorAsQuery = !currentState.useEditorAsQuery;
    if (this.mainView.isShowing)
      this.mainView.useEditorAsQuerySource(currentState.useEditorAsQuery);
  }

  /**
   * Called when the user changes the connection (or database)
   */
  onConnectionChanged() {
    var selectedName = this.mainView.headerView.getSelectedConnection();
    for (var key in this.viewToEditor) {
      var value = this.viewToEditor[key];
      // find the view that has this connection to 'copy' it
      if (value.dataManager && value.dataManager.getConnectionName() == selectedName) {
        var currentViewState = this.getOrCreateCurrentResultView();

        // each view gets their own DataManager
        var newDataManager = DbFactory.createDataManagerForUrl(value.dataManager.getUrl())
        currentViewState.dataManager = newDataManager;
        //currentViewState.dataManager.activeDatabase = this.mainView.headerView.getSelectedDatabase();
        currentViewState.dataManager.getDatabaseNames(names => this.mainView.setState(selectedName, names, currentViewState.dataManager.activeDatabase, currentViewState.height));
        break;
      }
    }
  }

  onDisconnect() {
    var currentViewState = this.getOrCreateCurrentResultView();
    var disconnectingDataManager = currentViewState.dataManager;
    // Each view has their own DataManager, 'close' this view's
    disconnectingDataManager.destroy();
    currentViewState.dataManager = null;
  }

  createNewConnection(thenDo) {
    // prompt for a connection
    if (!this.newConnectionDialog) {
      this.newConnectionDialog = new NewConnectionDialog( (url) => {
        var dbManager = DbFactory.createDataManagerForUrl(url);
        this.getOrCreateCurrentResultView().dataManager = dbManager;

        this.mainView.addConnection(dbManager.getConnectionName());
        dbManager.getDatabaseNames(names => this.mainView.setState(dbManager.getConnectionName(), names, dbManager.activeDatabase, this.getOrCreateCurrentResultView().height));

        if (thenDo)
          thenDo();
      });
    }
    this.newConnectionDialog.show();
  }

  newQuery() {
    if (!this.mainView.isShowing)
      this.showResultsView();
    this.mainView.useEditorAsQuerySource(false);
    this.mainView.focusQueryInput();
    this.mainView.show();
  }

  /**
   * Save connections feature
   */
  editConnections() {
    fs.exists(DbFactory.file(), (exists) => {
      if (exists) {
        atom.workspace.open(DbFactory.file());
      } else {
        DbFactory.writeFile([], () => atom.workspace.open(DbFactory.file()));
      }
    });
  }

  /**
   * The Execute command. If no current connections it will prompt for a connect and then execute. Otherwise it'll execute the statement(s) on the current connection
   */
  execute() {
    var currentViewState = this.getOrCreateCurrentResultView();
    var editor = atom.workspace.getActiveTextEditor();
    // the toggle in the main view tells us where to get the query from
    var query = this.mainView.getQuery();
    if (!currentViewState || !currentViewState.dataManager)
      this.createNewConnection(() => {
          this.actuallyExecute(currentViewState, query);
      });
    else {
        this.actuallyExecute(currentViewState, query);
    }
  }

  actuallyExecute(executingViewState, query) {
    // make sure it's showing the results view
    this.showResultsView();
    executingViewState.results = [];

    var start = process.hrtime();
    var seconds = 0;
    this.statusBarManager.update('executing', seconds + ' s');
    var executingTimer = setInterval(() => this.statusBarManager.update('executing', (++seconds) + ' s'), 1000);

    executingViewState.dataManager.execute(query,
      results => {
        this.updateStatusBar(executingTimer, start)
        executingViewState.results = results;
        this.mainView.setResults(results);
      },
      err => {
        this.updateStatusBar(executingTimer, start)
        this.mainView.setMessage(err)
      });
  }

  // private
  updateStatusBar(executingTimer, start) {
    clearInterval(executingTimer);
    var elapsed = elapsedTime(start);
    this.statusBarManager.update('completed', elapsed);
  }
}
