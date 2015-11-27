"use babel";

import {$} from 'atom-space-pen-views';
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
    this.DbManager.getDatabaseNames((names) => {
      for(var i = 0; i < names.length; i++) {
        var db = document.createElement('li');
        db.className = 'db expandable collapsed';
        db.addEventListener('click', e => this.toggleCollapsed(e));
        var div = document.createElement('div');
        div.classList.add('db-name');
        div.innerText = names[i];
        db.appendChild(div);
        this.dbList.appendChild(db);
      }
    });
  }

  buildParts(element, database) {
    var partsList = document.createElement('ol');
    partsList.className = 'parts-list list-tree';
    var parts = ['Functions', 'Sequences', 'Tables', 'Views'];
    for(var i = 0; i < parts.length; i++) {
      var li = document.createElement('li');
      li.className = parts[i].toLowerCase() + ' expandable collapsed list-nested-item';
      li.addEventListener('click', e => this.toggleCollapsed(e));
      var div = document.createElement('div');
      div.classList.add('part-name');
      div.innerText = parts[i];
      li.appendChild(div);
      partsList.appendChild(li);
    }
    element.appendChild(partsList);
  }

  buildTableList(element, database) {
    var tableList = document.createElement('ol');
    tableList.className = 'table-list list-tree';
    this.DbManager.getTableNames(database, 'BASE TABLE', (names) => {
      for(var i = 0; i < names.length; i++) {
        var tbl = document.createElement('li');
        tbl.className = 'tbl expandable collapsed list-nested-item';
        tbl.addEventListener('click', e => this.toggleCollapsed(e));
        var div = document.createElement('div');
        div.classList.add('table-name');
        div.innerText = names[i];
        tbl.appendChild(div);
        tableList.appendChild(tbl);
      }
    })
    element.appendChild(tableList);
  }

  buildTableDetails(element, table, database) {
    var columnList = document.createElement('ol');
    columnList.className = 'column-list list-tree';
    this.DbManager.getTableDetails(database, [table], (columns) => {
      for(var i = 0; i < columns.length; i++) {
        var col = document.createElement('li');
        col.className = 'col list-nested-item';
        if(columns[i].constraint === 'PRIMARY KEY') {
          col.classList.add('pkey');
          col.title = 'Primary Key';
        }
        else if(columns[i].constraint === 'FOREIGN KEY'){
          col.classList.add('fkey');
          col.title = 'Foreign Key';
        }
        var div = document.createElement('div');
        div.classList.add('column-name');
        div.innerText = columns[i].name;
        col.appendChild(div);
        columnList.appendChild(col);
      }
    })
    element.appendChild(columnList);
  }

  buildViewList(element, database) {
    var viewList = document.createElement('ol');
    viewList.className = 'view-list list-tree';
    this.DbManager.getTableNames(database, 'VIEW', (names) => {
      for(var i = 0; i < names.length; i++) {
        var view = document.createElement('li');
        view.className = 'view expandable collapsed list-nested-item';
        view.addEventListener('click', e => this.toggleCollapsed(e));
        var div = document.createElement('div');
        div.classList.add('view-name');
        div.innerText = names[i];
        view.appendChild(div);
        viewList.appendChild(view);
      }
    })
    element.appendChild(viewList);
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

  getDatabaseName(target) {
    if(target.classList.contains('db'))
      return target.children[0].innerText;
    else
      return this.getDatabaseName(target.parentElement);
  }

  toggleCollapsed(e) {
    var target = e.target.tagName === 'LI' ? e.target : e.target.parentElement;
    if(!target.classList.contains('expandable')) {
      e.stopPropagation(); // Not sure why it was running twice
      return;
    }
    if(target.classList.contains('collapsed')) {
      if(target.children.length < 2) {
        switch(true) {
          case target.classList.contains('db'):
            this.buildParts(target, target.children[0].innerText);
            break;
          case target.classList.contains('tables'):
            this.buildTableList(target, this.getDatabaseName(target));
            break;
          case target.classList.contains('views'):
            this.buildViewList(target, this.getDatabaseName(target));
            break;
          case target.classList.contains('tbl') || target.classList.contains('view'):
            this.buildTableDetails(target, target.children[0].innerText, this.getDatabaseName(target));
            break;
          default:
            break;
        }
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
      var width = atom.getSize().width - e.pageX;
      this.element.style.width = width + 'px';
    }
    else
    {
      var width = e.pageX - this.element.offsetParent.offsetLeft;
      this.element.style.width = width + 'px';
    }
  }

  clear() {
    // clear results view and show things are happening
    //this.resultsView.clear();
  }
}
