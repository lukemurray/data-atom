"use babel";

import {Emitter} from 'atom';

// The header view for the results view, allowing you to add/change connections or change the DB
export default class DataDetailsView {
  constructor() {
    this.emitter = new Emitter();
    this.createView();
    this.isShowing = false;
    this.DbManager = null;
    this.resizeHandle.addEventListener('mousedown', e => this.resizeStarted(e));
  }

  getPosition() {
    return atom.config.get('data-atom.showDetailsViewOnRightSide') ? 'right' : 'left';
  }

  createView() {
    this.element = document.createElement('section');
    this.element.className = 'data-details-panel tool-panel panel panel-left padding';

    this.resizeHandle = document.createElement('div');
    this.resizeHandle.classList.add('resize-handle');
    this.element.appendChild(this.resizeHandle);

    this.noConnection = document.createElement('div');
    this.noConnection.classList.add('no-connection');
    this.noConnection.innerText = "No Connection";
    this.element.appendChild(this.noConnection);

    this.dbListContainer = document.createElement('div');
    this.dbListContainer.classList.add('details-container');
    this.element.appendChild(this.dbListContainer);

    this.dbList = document.createElement('ol');
    this.dbList.className = 'tree-view db-list';
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
        div.innerText = tables[i].name;
        tbl.appendChild(div);
        tableList.appendChild(tbl);
      }
    });
    element.appendChild(tableList);
  }

  buildTableDetails(element, table, database) {
    var columnList = document.createElement('ol');
    columnList.className = 'column-list list-tree';
    this.DbManager.getTableDetails(database, [{name: table}]).then(columns => {
      for(var i = 0; i < columns.length; i++) {
        var col = document.createElement('li');
        col.className = 'col list-nested-item';
        var div = document.createElement('div');
        div.classList.add('column-name');
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

  show() {
    if (!this.isShowing)
      this.toggleView();
  }

  hide() {
    if (this.isShowing)
      this.toggleView();
  }

  toggleView() {
    if (this.isShowing) {
      this.element.parentNode.removeChild(this.element);
      this.isShowing = false;
      this.viewPanel.destroy();
      this.viewPanel = null;
    }
    else {
      if (this.getPosition() === 'right') {
        this.resizeHandle.classList.add('right');
        this.viewPanel = atom.workspace.addRightPanel({item:this.element});
      }
      else {
        this.resizeHandle.classList.remove('right');
        this.viewPanel = atom.workspace.addLeftPanel({item:this.element});
      }
      this.isShowing = true;
    }
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

  resizeStarted() {
    var self = this;
    this.moveHandler = function(e) { self.resizeDetailsView(e); };
    document.body.addEventListener('mousemove', this.moveHandler);
    this.stopHandler = function() { self.resizeStopped(); };
    document.body.addEventListener('mouseup', this.stopHandler);
  }

  resizeStopped() {
    document.body.removeEventListener('mousemove', this.moveHandler);
    document.body.removeEventListener('mouseup', this.stopHandler);
  }

  resizeDetailsView(e) {
    if(this.getPosition() === 'right') {
      let width = atom.getSize().width - e.pageX;
      this.element.style.width = width + 'px';
    }
    else
    {
      let width = e.pageX - this.element.offsetParent.offsetLeft;
      this.element.style.width = width + 'px';
    }
  }

  clear() {
    // clear results view and show things are happening
    //this.resultsView.clear();
  }
}
