"use babel";

var URL = require('url');

var _ = require('underscore');
var _s = require('underscore.string');

var DbFactory = require('./data-managers/db-factory');

module.exports =
class NewConnectionDialog {
  constructor(onConnect) {
    this.onConnectClicked = onConnect;

    this.createView();

    this.placeholderUrlPart = '://user:pass@localhost/db-name';

    this.dbUser.getModel().onDidChange(() => this.buildUrl());
    this.dbPassword.getModel().onDidChange(() => this.buildUrl());
    this.dbServer.getModel().onDidChange(() => this.buildUrl());
    this.dbPort.getModel().onDidChange(() => this.buildUrl());
    this.dbName.getModel().onDidChange(() => this.buildUrl());
    this.dbOptions.getModel().onDidChange(() => this.buildUrl());

    this.url.getModel().onDidChange(() => this.seperateUrl());

    var supportedDbs = DbFactory.getSupportedDatabases();
    for (var i = 0; i < supportedDbs.length; i++) {
      var type = supportedDbs[i];
      var opt = document.createElement('option');
      opt.innerText = type.name;
      opt.setAttribute('value', type.prefix);
      opt.setAttribute('data-port', type.port);
      this.dbType.appendChild(opt);
    }

    // set placeholder-text text to the first one
    this.urlProtocol = supportedDbs[0].prefix;
    this.url.getModel().setPlaceholderText(this.urlProtocol + this.placeholderUrlPart);
    this.dbPort.getModel().setPlaceholderText(supportedDbs[0].port);
    this.dbType.addEventListener('change', (e) => this.updateDbType(e));

    DbFactory.loadConnections((connections) => {
      for(var key in connections) {
        var connection = connections[key];
        var opt = document.createElement('option');
        opt.innerText = connection.name;
        opt.setAttribute('value', connection.url);
        this.connections.appendChild(opt);
      }
    });
    this.connections.addEventListener('change', (e) => this.connectionPicked(e));
  }

  createView() {
    this.element = document.createElement('section');
    this.element.classList.add('connection-dialog');
    this.element.classList.add('dialog');

    var panelHeading = document.createElement('div');
    panelHeading.classList.add('heading');
    panelHeading.classList.add('section-heading');
    this.element.appendChild(panelHeading);

    this.header = document.createElement('span');
    this.header.innerText = 'New Connection...';
    panelHeading.appendChild(this.header);

    var panelBody = document.createElement('div');
    panelBody.classList.add('section-body');
    panelBody.classList.add('padded');
    panelBody.classList.add('controls');
    panelBody.classList.add('form-horizontal');
    this.element.appendChild(panelBody);

    var group = document.createElement('div');
    group.classList.add('form-group');
    panelBody.appendChild(group);
    label = document.createElement('label');
    label.classList.add('col-md-2');
    label.classList.add('control-label');
    label.innerText = 'Load Connection';
    group.appendChild(label);
    div = document.createElement('div');
    div.classList.add('col-md-4');
    group.appendChild(div);
    this.connections = document.createElement('select');
    this.connections.classList.add('form-control');
    var opt = document.createElement('option');
    opt.innerText = '';
    opt.setAttribute('value', '');
    this.connections.appendChild(opt);
    div.appendChild(this.connections);

    group = document.createElement('div');
    group.classList.add('form-group');
    panelBody.appendChild(group);
    var label = document.createElement('label');
    label.classList.add('col-md-2');
    label.classList.add('control-label');
    label.innerText = 'URL';
    group.appendChild(label);
    var div = document.createElement('div');
    div.classList.add('col-md-10');
    group.appendChild(div);
    this.url = document.createElement('atom-text-editor');
    this.url.setAttribute('mini', '');
    div.appendChild(this.url);

    group = document.createElement('div');
    group.classList.add('form-group');
    panelBody.appendChild(group);
    label = document.createElement('label');
    label.classList.add('col-md-2');
    label.classList.add('control-label');
    label.innerText = 'DB Type';
    group.appendChild(label);
    div = document.createElement('div');
    div.classList.add('col-md-4');
    group.appendChild(div);
    this.dbType = document.createElement('select');
    this.dbType.classList.add('form-control');
    div.appendChild(this.dbType);

    group = document.createElement('div');
    group.classList.add('form-group');
    panelBody.appendChild(group);
    label = document.createElement('label');
    label.classList.add('col-md-2');
    label.classList.add('control-label');
    label.innerText = 'Server';
    group.appendChild(label);
    div = document.createElement('div');
    div.classList.add('col-md-5');
    group.appendChild(div);
    this.dbServer = document.createElement('atom-text-editor');
    this.dbServer.setAttribute('mini', '');
    this.dbServer.setAttribute('placeholder-text', 'localhost');
    div.appendChild(this.dbServer);

    label = document.createElement('label');
    label.classList.add('col-md-2');
    label.classList.add('control-label');
    label.innerText = 'Port';
    group.appendChild(label);
    div = document.createElement('div');
    div.classList.add('col-md-3');
    group.appendChild(div);
    this.dbPort = document.createElement('atom-text-editor');
    this.dbPort.setAttribute('mini', '');
    div.appendChild(this.dbPort);

    group = document.createElement('div');
    group.classList.add('form-group');
    panelBody.appendChild(group);
    label = document.createElement('label');
    label.classList.add('col-md-2');
    label.classList.add('control-label');
    label.innerText = 'Auth';
    group.appendChild(label);
    div = document.createElement('div');
    div.classList.add('col-md-5');
    group.appendChild(div);
    this.dbUser = document.createElement('atom-text-editor');
    this.dbUser.setAttribute('mini', '');
    this.dbUser.setAttribute('placeholder-text', 'username');
    div.appendChild(this.dbUser);

    div = document.createElement('div');
    div.classList.add('col-md-5');
    group.appendChild(div);
    this.dbPassword = document.createElement('atom-text-editor');
    this.dbPassword.setAttribute('mini', '');
    this.dbPassword.setAttribute('placeholder-text', 'password');
    div.appendChild(this.dbPassword);

    group = document.createElement('div');
    group.classList.add('form-group');
    panelBody.appendChild(group);
    label = document.createElement('label');
    label.classList.add('col-md-2');
    label.classList.add('control-label');
    label.innerText = 'Database';
    group.appendChild(label);
    div = document.createElement('div');
    div.classList.add('col-md-10');
    group.appendChild(div);
    this.dbName = document.createElement('atom-text-editor');
    this.dbName.setAttribute('mini', '');
    this.dbName.setAttribute('placeholder-text', 'database-name');
    div.appendChild(this.dbName);

    group = document.createElement('div');
    group.classList.add('form-group');
    panelBody.appendChild(group);
    label = document.createElement('label');
    label.classList.add('col-md-2');
    label.classList.add('control-label');
    label.innerText = 'Options';
    group.appendChild(label);
    div = document.createElement('div');
    div.classList.add('col-md-10');
    group.appendChild(div);
    this.dbOptions = document.createElement('atom-text-editor');
    this.dbOptions.setAttribute('mini', '');
    this.dbOptions.setAttribute('placeholder-text', 'option=value,ssl=true');
    div.appendChild(this.dbOptions);

    div = document.createElement('div');
    div.classList.add('buttons');
    this.element.appendChild(div);

    var btn = document.createElement('button');
    btn.classList.add('btn');
    btn.classList.add('btn-default');
    btn.innerText = 'Connect';
    div.appendChild(btn);
    btn.addEventListener('click', () => this.connect());

    btn = document.createElement('button');
    btn.classList.add('btn');
    btn.classList.add('btn-default');
    btn.classList.add('btn-padding-left');
    btn.innerText = 'Close';
    div.appendChild(btn);
    btn.addEventListener('click', () => this.close());
  }

  getElement() {
    return this.element;
  }

  show() {
    if (!this.dialogPanel)
      this.dialogPanel = atom.workspace.addModalPanel({item:this.element});
    this.dialogPanel.show();
    this.url.focus();
  }

  close() {
    if (this.dialogPanel) {
      this.dialogPanel.hide();
      this.element.remove();
      this.dialogPanel = null;
    }
  }

  // if the user modifies the URL we'll try to break it into the seperate parameters
  seperateUrl() {
    if (!this.url.hasFocus())
      return;

    var urlObj = URL.parse(this.url.getModel().getText(), true);
    if (urlObj) {
      if (urlObj.protocol) {
        this.urlProtocol = urlObj.protocol.substring(0, urlObj.protocol.length - 1);
        this.selectDbType(this.urlProtocol);
      }
      if (urlObj.search) {
        this.dbOptions.getModel().setText(urlObj.search.replace('?', '').replace('&', ', '));
      }
      if (urlObj.hostname) {
        this.dbServer.getModel().setText(urlObj.hostname);
      }
      if (urlObj.port) {
        this.dbPort.getModel().setText(urlObj.port);
      }
      this.dbName.getModel().setText(_s.ltrim(urlObj.pathname, '/'));
      if (urlObj.auth) {
        var auth = urlObj.auth.split(':');
        if (auth) {
          this.dbUser.getModel().setText(auth[0]);
          if (auth.length != 1) {
            this.dbPassword.getModel().setText(auth[1]);
          }
        }
      }
    }
  }

  buildUrl() {
    if (this.url.hasFocus())
      return;

    var urlStr = this.urlProtocol + '://';

    var userPass = encodeURIComponent(this.dbUser.getModel().getText()) + ':' + encodeURIComponent(this.dbPassword.getModel().getText());
    if (userPass != ':')
       urlStr += userPass + '@';

    urlStr += this.dbServer.getModel().getText();
    if (this.dbPort.getModel().getText() != '')
       urlStr += ':' + this.dbPort.getModel().getText();
    urlStr += '/' + encodeURIComponent(this.dbName.getModel().getText());
    if (this.dbOptions.getModel().getText()) {
       urlStr += '?';
       _.each(this.dbOptions.getModel().getText().split(','), (s) => urlStr += encodeURIComponent(_s.trim(s)) + '&');
       urlStr = _s.rtrim(urlStr, '&');
    }

    this.url.getModel().setText(urlStr);
  }

  updateDbType(e) {
    for (var i = 0; i < this.dbType.childNodes.length; i++) {
      var n = this.dbType.childNodes[i];
      if (n.selected) {
        this.urlProtocol = n.getAttribute('value');
        this.dbPort.getModel().setPlaceholderText(n.getAttribute('data-port'));
        this.url.getModel().setPlaceholderText(this.urlProtocol + this.placeholderUrlPart);
        return;
      }
    }
  }

  connectionPicked(e) {
    for (var i = 0; i < this.connections.childNodes.length; i++) {
      var n = this.connections.childNodes[i];
      if (n.selected) {
        this.url.getModel().setText(n.value);
        this.url.focus();
        if(n.value === '') {
          this.dbOptions.getModel().setText('');
          this.dbServer.getModel().setText('');
          this.dbPort.getModel().setText('');
          this.dbUser.getModel().setText('');
          this.dbPassword.getModel().setText('');
          this.dbName.getModel().setText('');
        } else {
          this.seperateUrl();
        }
        return;
      }
    }
  }

  selectDbType(type) {
    for (var i = 0; i < this.dbType.childNodes.length; i++) {
      var n = this.dbType.childNodes[i];
      if (n.getAttribute('value').toLowerCase() == type.toLowerCase()) {
        n.selected = true;
        return;
      }
    }
  }

  // Called when the user clicks the connect button. Triggers a callback for the controller to
  // create a connection with the given parameters
  connect() {
    if (this.onConnectClicked && this.url.getModel().getText() !== '') {
      this.onConnectClicked(this.url.getModel().getText());
      this.close();
    }
  }
}
