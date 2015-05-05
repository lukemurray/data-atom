"use babel";

var URL = require('url');

var TextEditorView = require('atom-space-pen-views').TextEditorView;

var _ = require('underscore');
var _s = require('underscore.string');

var DbFactory = require('./data-managers/db-factory');

module.exports =
class NewConnectionView {
  constructor() {
    this.createView(this);

    this.placeholderUrlPart = '://user:passthis.server/db-name';

    this.dbUser.addEventListener('contents-modified', () => this.buildUrl());
    this.dbPassword.addEventListener('contents-modified', () => this.buildUrl());
    this.dbServer.addEventListener('contents-modified', () => this.buildUrl());
    this.dbPort.addEventListener('contents-modified', () => this.buildUrl());
    this.dbName.addEventListener('contents-modified', () => this.buildUrl());
    this.dbOptions.addEventListener('contents-modified', () => this.buildUrl());

    this.url.addEventListener('contents-modified', () => this.seperateUrl());

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
    this.urlPrefix = supportedDbs[0].prefix;
    this.url.setAttribute('placeholder-text', this.urlPrefix + this.placeholderUrlPart);
    this.dbPort.setAttribute('placeholder-text', supportedDbs[0].port);
    this.dbType.addEventListener('change', (e) => this.updateDbType(e));
    //atom.commands.add('core:cancel core:close', () => this.close);
  }

  createView() {
    this.element = document.createElement('atom-panel');
    this.element.classList.add('connection-dialog');
    this.element.classList.add('overlay');
    this.element.classList.add('model');
    this.element.classList.add('from-top');
    //this.element.classList.add('padded');

    var panel = document.createElement('div');
    panel.classList.add('inset-panel');
    this.element.appendChild(panel);

    var panelHeading = document.createElement('div');
    panelHeading.classList.add('panel-heading');
    panelHeading.classList.add('heading');
    panelHeading.classList.add('header-view');
    panel.appendChild(panelHeading);

    this.header = document.createElement('span');
    this.header.classList.add('heading-title');
    panelHeading.appendChild(this.header);

    var panelBody = document.createElement('div');
    panelBody.classList.add('panel-body');
    panelBody.classList.add('padded');
    panelBody.classList.add('form-horizontal');
    panel.appendChild(panelBody);

    var group = document.createElement('div');
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
    // on-change

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

    var btn = document.createElement('button');
    btn.classList.add('btn');
    btn.classList.add('btn-default');
    btn.innerText = 'Connect';
    this.element.appendChild(btn);
    btn.addEventListener('click', () => this.connect());

    btn = document.createElement('button');
    btn.classList.add('btn');
    btn.classList.add('btn-default');
    btn.classList.add('btn-padding-left');
    btn.innerText = 'Close';
    this.element.appendChild(btn);
    btn.addEventListener('click', () => this.close());
  }

  getElement() {
    return this.element;
  }

  show() {
    atom.workspace.addTopPanel({item:this.element});
    //this.url.focus();
  }

  close() {
    this.element.remove();
  }

  seperateUrl() {
    if (!this.url.isFocused())
      return;
    urlObj = URL.parse(this.url.getText(), true);
    if (urlObj) {
      if (urlObj.query)
        this.dbOptions.setText(urlObj.query.replace('&', ', '));

      if (urlObj.hostname)
        this.dbServer.setText(urlObj.hostname);

      if (urlObj.port)
        this.dbPort.setText(urlObj.port);

      this.dbName.setText(_s.ltrim(urlObj.pathname, '/'));
      if (urlObj.auth) {
        auth = urlObj.auth.split(':');
        if (auth) {
          this.dbUser.setText(auth[0]);
          if (auth.length != 1) {
            this.dbPassword.setText(auth[1]);
          }
        }
      }
    }
  }

  buildUrl() {
    if (this.url.isFocused())
      return;

    // just use postgres for now
    urlStr = this.urlPrefix + '://';

    userPass = this.dbUser.getText() + ':' + this.dbPassword.getText();
    if (userPass != ':')
       urlStr += userPass + 'this.';

    urlStr += this.dbServer.getText();
    if (this.dbPort.getText() != '')
       urlStr += ':' + this.dbPort.getText();
    urlStr += '/' + this.dbName.getText();
    if (this.dbOptions.getText())
       urlStr += '?';
       _.each(this.dbOptions.getText().split(','), (s) => urlStr += _s.trim(s) + '&');
       urlStr = _s.rtrim(urlStr, '&');

    this.url.setText(urlStr);
  }

  updateDbType(e) {
    for (var n in this.dbType.children()) {
      if (n.selected) {
        this.urlPrefix = $(n).attr('value');
        this.dbPort.setPlaceholderText($(n).attr('data-port'));
        this.url.setPlaceholderText(this.urlPrefix + this.placeholderUrlPart);
        return;
      }
    }
  }

  connect() {
    if (this.onConnectClicked()) {
      this.onConnectClicked(this.url.getText());
    }
    this.close();
  }
}
