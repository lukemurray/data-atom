"use babel";
/** @jsx etch.dom */

import etch from 'etch';
import URL from 'url';

import _s from 'underscore.string';
import {CompositeDisposable} from 'atom';

import DbFactory from '../data-managers/db-factory';

module.exports =
class NewConnectionDialog {
  constructor(onConnect) {
    this.onConnectClicked = onConnect;

    this.loadedConnections = [];
    this.placeholderUrlPart = '://user:pass@localhost/db-name';
    this.supportedDbs = DbFactory.getSupportedDatabases();

    this.state = {
      connectionName: '',
      server: '',
      port: '',
      user: '',
      pass: '',
      databaseName: '',
      options: '',
      selectedProtocol: this.supportedDbs[0].prefix,
      defaultPort: this.supportedDbs[0].port
    };

    etch.createElement(this);

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add(this.element, {
      'core:close': () => { this.close(); },
      'core:cancel': () => { this.close(); }
    }));

    this.refs.dbUser.getModel().onDidChange(() => { this.state.user = this.refs.dbUser.getModel().getText(); etch.updateElement(this); });
    this.refs.dbPassword.getModel().onDidChange(() => { this.state.pass = this.refs.dbPassword.getModel().getText(); etch.updateElement(this); });
    this.refs.dbServer.getModel().onDidChange(() => { this.state.server = this.refs.dbServer.getModel().getText(); etch.updateElement(this); });
    this.refs.dbPort.getModel().onDidChange(() => { this.state.port = this.refs.dbPort.getModel().getText(); etch.updateElement(this); });
    this.refs.dbName.getModel().onDidChange(() => { this.state.databaseName = this.refs.dbName.getModel().getText(); etch.updateElement(this); });
    this.refs.dbOptions.getModel().onDidChange(() => { this.state.options = this.refs.dbOptions.getModel().getText(); etch.updateElement(this); });

    this.refs.url.getModel().onDidChange(() => this.seperateUrl());

    this.refs.connections.addEventListener('change', (e) => this.connectionPicked(e));
    this.refs.dbType.addEventListener('change', (e) => this.updateDbType(e));

    this.refs.btnConnect.addEventListener('click', () => this.connect());
    this.refs.btnSaveConnect.addEventListener('click', () => this.connectAndSave());
    this.refs.btnClose.addEventListener('click', () => this.close());

    DbFactory.loadConnections(connections => {
      this.loadedConnections = connections;
      etch.updateElement(this);
    });
  }

  render() {
    this.state.builtUrl = this.buildUrl();
    console.log(this.state.builtUrl);
    return (
      <section className='data-atom dialog'>
      <input value={this.state.builtUrl} />
        <div className='heading section-heading'>
          <span>New Connection...</span>
        </div>
        <div className='section-body padded controls form-horizontal'>
          <div className='form-group'>
            <label className='col-md-2 control-label'>Connection</label>
            <div className='col-md-5'>
              <select className='form-control' tabindex='0' ref='connections'>
                <option value=''>Load connection...</option>
                {this.loadedConnections.map(con =>
                  <option value={con.url}>{con.name}</option>
                )}
              </select>
            </div>
            <div className='col-md-5'>
              <label className='col-md-1 control-label label-or'>Or</label>
              <atom-text-editor attributes={{mini: true, tabindex:1, 'placeholder-text':'Connection name'}}>{this.state.connectionName}</atom-text-editor>
            </div>
          </div>

          <div className='form-group'>
            <label className='col-md-2 control-label'>URL</label>
            <div className='col-md-10'>
              {this.buildUrl()}
              <atom-text-editor ref='url' attributes={{mini: true, tabindex:2}}>{this.state.builtUrl}</atom-text-editor>
            </div>
          </div>
          <div className='form-group'>
            <label className='col-md-2 control-label'>DB Type</label>
            <div className='col-md-4'>
              <select className='form-control' tabindex='3' ref='dbType'>
                {this.supportedDbs.map(type =>
                  <option value={type.prefix} data-port={type.port}>{type.name}</option>
                )}
              </select>
            </div>
          </div>

          <div className='form-group'>
            <label className='col-md-2 control-label'>Server</label>
            <div className='col-md-5'>
              <atom-text-editor ref='dbServer' attributes={{mini: true, tabindex:4, 'placeholder-text':'localhost'}}>{this.state.server}</atom-text-editor>
            </div>
            <label className='col-md-2 control-label'>Port</label>
            <div className='col-md-3'>
              <atom-text-editor ref='dbPort' attributes={{mini: true, tabindex:5, 'placeholder-text':this.state.defaultPort}}>{this.state.port}</atom-text-editor>
            </div>
          </div>

          <div className='form-group'>
            <label className='col-md-2 control-label'>Auth</label>
            <div className='col-md-5'>
              <atom-text-editor ref='dbUser' attributes={{mini: true, tabindex:6, 'placeholder-text':'user'}}>{this.state.user}</atom-text-editor>
            </div>
            <div className='col-md-5'>
              <atom-text-editor ref='dbPassword' attributes={{mini: true, tabindex:7, 'placeholder-text':'password'}}>{this.state.pass}</atom-text-editor>
            </div>
          </div>

          <div className='form-group'>
            <label className='col-md-2 control-label'>Database</label>
            <div className='col-md-10'>
              <atom-text-editor ref='dbName' attributes={{mini: true, tabindex:8, 'placeholder-text':'database-name'}}>{this.state.databaseName}</atom-text-editor>
            </div>
          </div>

          <div className='form-group'>
            <label className='col-md-2 control-label'>Options</label>
            <div className='col-md-10'>
              <atom-text-editor ref='dbOptions' attributes={{mini: true, tabindex:9, 'placeholder-text':'option=value,ssl=true'}}>{this.state.options}</atom-text-editor>
            </div>
          </div>
        </div>
        <div className='buttons'>
          <button tabindex='10' className='btn btn-default' ref='btnConnect'>Connect</button>
          <button tabindex='11' className='btn btn-default btn-padding-left' ref='btnSaveConnect'>Save and Connect</button>
          <button tabindex='12' className='btn btn-default btn-padding-left' ref='btnClose'>Close</button>
        </div>
      </section>
    );
  }

  show() {
    if (!this.dialogPanel)
      this.dialogPanel = atom.workspace.addModalPanel({item:this.element});
    etch.updateElement(this);
    this.refs.url.focus();
  }

  close() {
    if (this.dialogPanel) {
      this.dialogPanel.hide();
      this.element.remove();
      this.dialogPanel.destroy();
      this.dialogPanel = null;
    }
  }

  // if the user modifies the URL we'll try to break it into the seperate parameters
  seperateUrl() {
    if (!this.refs.url.hasFocus())
      return;

    var urlObj = URL.parse(this.refs.url.getModel().getText(), true);
    if (urlObj) {
      if (urlObj.protocol) {
        this.state.selectedProtocol = urlObj.protocol.substring(0, urlObj.protocol.length - 1);
      }
      if (urlObj.search) {
        this.refs.dbOptions.getModel().setText(urlObj.search.replace('?', '').replace('&', ', '));
      }
      if (urlObj.hostname) {
        this.refs.dbServer.getModel().setText(urlObj.hostname);
      }
      if (urlObj.port) {
        this.refs.dbPort.getModel().setText(urlObj.port);
      }
      this.refs.dbName.getModel().setText(_s.ltrim(urlObj.pathname, '/'));
      if (urlObj.auth) {
        var auth = urlObj.auth.split(':');
        if (auth) {
          this.refs.dbUser.getModel().setText(auth[0]);
          if (auth.length != 1) {
            this.refs.dbPassword.getModel().setText(auth[1]);
          }
        }
      }
      etch.updateElement(this);
    }
  }

  buildUrl() {
    var urlStr = this.state.selectedProtocol + '://';

    var userPass = encodeURIComponent(this.state.user) + ':' + encodeURIComponent(this.state.pass);
    if (userPass != ':')
      urlStr += userPass + '@';

    urlStr += this.state.server;
    if (this.state.port != '') {
      urlStr += ':' + this.state.port;
    }
    if (this.state.databaseName) {
      urlStr += '/' + encodeURIComponent(this.state.databaseName);
    }
    if (this.state.options) {
      urlStr += '?';
      this.state.options.split(',').map(s => urlStr += encodeURIComponent(_s.trim(s)) + '&');
      urlStr = _s.rtrim(urlStr, '&');
    }
    this.state.builtUrl = urlStr;
    return urlStr;
  }

  updateDbType(e) {
    for (var i = 0; i < this.refs.dbType.childNodes.length; i++) {
      var n = this.refs.dbType.childNodes[i];
      if (n.selected) {
        this.state.selectedProtocol = n.getAttribute('value');
        this.state.defaultPort = n.getAttribute('data-port');
        this.refs.dbPort.getModel().setPlaceholderText(this.state.defaultPort);
        return;
      }
    }
  }

  connectionPicked(e) {
    for (var i = 0; i < this.refs.connections.childNodes.length; i++) {
      var n = this.refs.connections.childNodes[i];
      if (n.selected) {
        this.refs.name.getModel().setText(n.innerText);
        this.refs.url.focus();
        this.saveAndConnectBtn.disabled = (n.value !== '')
        if(n.value === '') {
          this.refs.name.getModel().setText('');
          this.refs.dbOptions.getModel().setText('');
          this.refs.dbServer.getModel().setText('');
          this.refs.dbPort.getModel().setText('');
          this.refs.dbUser.getModel().setText('');
          this.refs.dbPassword.getModel().setText('');
          this.refs.dbName.getModel().setText('');
        } else {
          this.seperateUrl();
        }
        return;
      }
    }
  }

  // Called when the user clicks the save and connect button.
  connectAndSave() {
    var connection = {
      name: this.state.connectionName !== '' ? this.state.connectionName : this.state.databaseName,
      protocol: this.state.selectedProtocol,
      user: this.state.user,
      password: this.state.pass,
      server: this.state.server,
      database: this.state.databaseName,
      options: this.state.options
    };
    if (this.state.port !== '')
      connection.port = this.state.port;
    DbFactory.saveConnection(connection, () => {
      this.loadedConnections.push(connection);
      this.onConnectClicked(this.buildUrl());
      this.close();
    });
  }

  // Called when the user clicks the connect button. Triggers a callback for the controller to
  // create a connection with the given parameters
  connect() {
    var url = this.buildUrl();
    if (this.onConnectClicked && url !== '') {
      this.onConnectClicked(url);
      this.close();
    }
  }
}
