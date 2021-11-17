"use babel";

import {Emitter} from 'atom';

// The header view for the results view, allowing you to add/change connections or change the DB
export default class DataDetailsView {
  constructor() {
    this.emitter = new Emitter();
    this.createView();
    this.workspaceItem = {
        element: this.element,
        getTitle: () => 'Database Info',
        getIconName: () => 'database',
        getURI: () => "atom://data-atom/details-view",
        getDefaultLocation: () => 'right',
    };
    this.isShowing = false;
    this.DbManager = null;
  }

  getPosition() {
    return atom.config.get('data-atom.showDetailsViewOnRightSide') ? 'right' : 'left';
  }

  createView() {
    this.element = document.createElement('section');
    this.element.className = 'data-details-panel tool-panel panel panel-left padding';

    this.noConnection = document.createElement('div');
    this.noConnection.classList.add('no-connection');
    this.noConnection.innerText = "No Connection";
    this.element.appendChild(this.noConnection);

    this.dbListContainer = document.createElement('div');
    this.dbListContainer.classList.add('details-container');
    this.element.appendChild(this.dbListContainer);

    this.dbList = document.createElement('ol');
    this.dbList.className = 'db-list';
    this.dbListContainer.appendChild(this.dbList);
  }

  setDbManager(DbManager) {
    this.DbManager = DbManager;
    this.refreshView();
  }

  clearDbManager() {
    this.DbManager = null;
    this.noConnection.classList.remove('hidden');
    this.dbListContainer.classList.add('hidden');
    while(this.dbList.firstChild) this.dbList.removeChild(this.dbList.firstChild);
  }

  refreshView() {
    this.noConnection.classList.add('hidden');
    this.dbListContainer.classList.remove('hidden');
    while(this.dbList.firstChild) this.dbList.removeChild(this.dbList.firstChild);
    this.DbManager.getDatabaseNames().then(names => {
      if (!names)
        return;

      for(var i = 0; i < names.length; i++) {
        var db = document.createElement('li');
        db.classList.add('db');
        db.classList.add('collapsed');
        db.addEventListener('click', e => this.toggleCollapsed(e));
        var div = document.createElement('div');
        div.classList.add('db-name');
        div.innerText = names[i];
        db.appendChild(div);
        this.dbList.appendChild(db);
      }
  });
  }

  buildTableList(element, database) {
    var addToEditor = function (item) {
        atom.workspace.getActiveTextEditor().insertText(item.srcElement.innerText + ' ');
    };

    var tableList = document.createElement('ol');
    tableList.className = 'table-list list-tree';
    this.DbManager.getTables(database).then(tables => {
      for(var i = 0; i < tables.length; i++) {
        var tbl = document.createElement('li');
        tbl.className = 'tbl collapsed list-nested-item';
        tbl.title = tables[i].schemaName;
        tbl.addEventListener('click', e => this.toggleCollapsed(e));
        var div = document.createElement('div');
        div.classList.add('table-name');
        div.ondblclick = addToEditor;
        div.innerText = tables[i].name;
        tbl.appendChild(div);
        tableList.appendChild(tbl);
      }
    });
    element.appendChild(tableList);
  }

  buildTableDetails(element, table, database) {
    var addToEditor = function (item) {
        atom.workspace.getActiveTextEditor().insertText(item.srcElement.innerText + ' ');
    };

    var columnList = document.createElement('ol');
    columnList.className = 'column-list list-tree';
    this.DbManager.getTableDetails(database, [{name: table}]).then(columns => {
      for(var i = 0; i < columns.length; i++) {
        var col = document.createElement('li');
        col.className = 'col list-nested-item';
        var div = document.createElement('div');
        div.classList.add('column-name');
        div.ondblclick = addToEditor;
        /*var text = columns[i].name + ' ' + columns[i].udt;
        if (columns[i].size !== '')
          text += '(' + columns[i].size + ')';*/
        div.innerText = columns[i].name;
        col.appendChild(div);
        columnList.appendChild(col);
      }
    });
    element.appendChild(columnList);
  }

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  get isShowing() {
      for (let dock of [atom.workspace.getBottomDock(), atom.workspace.getLeftDock(), atom.workspace.getRightDock()]) {
          if (dock.paneContainer.activePane.activeItem == this.workspaceItem) {
              return true;
          }
      }
      return false;
  }

  show() {
    if (!this.isShowing)
      this.toggleView();
  }

  hide() {
    if (this.isShowing)
      this.toggleView();
  }

  toggleView() {
    atom.workspace.toggle(this.workspaceItem);
  }

  toggleCollapsed(e) {
    var target = e.target.tagName === 'LI' ? e.target : e.target.parentElement;
    if(target.classList.contains('collapsed')) {
      if(target.children.length < 2) {
        if(target.classList.contains('db'))
          this.buildTableList(target, target.children[0].innerText);
        else
          this.buildTableDetails(target, target.children[0].innerText, target.parentElement.parentElement.children[0].innerText);
      }
      target.classList.remove('collapsed');
      target.classList.add('expanded');
    } else {
      target.classList.remove('expanded');
      target.classList.add('collapsed');
    }
    e.stopPropagation(); // Not sure why it was running twice
  }

  clear() {
    // clear results view and show things are happening
    //this.resultsView.clear();
  }
}
