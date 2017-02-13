"use babel";
/** @jsx etch.dom */

import etch, {getScheduler} from 'etch';
import URL from 'url';

import _s from 'underscore.string';
import {CompositeDisposable} from 'atom';

import DbFactory from '../data-managers/db-factory';
import Utils from '../utils.js';
import DbConnectionConfig from '../db-connection-config.js';

module.exports =
class NewConnectionDialog {
  constructor(onConnect) {
    this.onConnectClicked = onConnect;

    this.loadedConnections = [];
    this.placeholderUrlPart = '://user:pass@localhost/db-name';
    this.supportedDbs = DbFactory.getSupportedDatabases();

    this.state = {
      selectedProtocol: this.supportedDbs[0].prefix,
      defaultPort: this.supportedDbs[0].port
    };

    etch.initialize(this);
    this.registerListeners();

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add(this.element, {
      'core:close': () => { this.close(); },
      'core:cancel': () => { this.close(); }
    }));

    DbFactory.loadConnections().then(connections => {
      this.loadedConnections = connections;
      etch.update(this);
    });
  }

  update(props, children) {
    return etch.update(this);
  }

  registerListeners() {
    this.refs.dbUser.getModel().onDidChange(() => this.buildUrl());
    this.refs.dbPassword.getModel().onDidChange(() => this.buildUrl());
    this.refs.dbServer.getModel().onDidChange(() => this.buildUrl());
    this.refs.dbPort.getModel().onDidChange(() => this.buildUrl());
    this.refs.dbName.getModel().onDidChange(() => this.buildUrl());
    this.refs.dbOptions.getModel().onDidChange(() => this.buildUrl());

    this.refs.url.getModel().onDidChange(() => this.separateUrl());

    this.refs.connections.addEventListener('change', (e) => this.connectionPicked(e));
    this.refs.dbType.addEventListener('change', (e) => this.updateDbType(e));

    this.refs.btnConnect.addEventListener('click', () => this.connect());
    this.refs.btnSaveConnect.addEventListener('click', () => this.connectAndSave());
    this.refs.btnClose.addEventListener('click', () => this.close());
  }

  render() {
    return (
      <section className='data-atom dialog'>
        <div className='heading section-heading'>New Connection...</div>
        <section className="row row-centered">
          <label className='control-label'>Connection</label>
          <div className='row-item-flex'>
            <select className='form-control' tabindex='0' ref='connections'>
              <option value=''>Load connection...</option>
              {this.loadedConnections.map(con =>
                <option value={con.url}>{con.name}</option>
              )}
            </select>
          </div>
          <label className='label-or'>Or</label>
          <div className='row-item-flex'>
            <atom-text-editor ref='connectionName' attributes={{mini: true, tabindex:1, 'placeholder-text':'Connection name'}}></atom-text-editor>
          </div>
        </section>

        <section className="row row-centered">
          <label className='control-label'>URL</label>
          <div className='row-item-flex'>
            <atom-text-editor ref='url' attributes={{mini: true, tabindex:2}}></atom-text-editor>
          </div>
        </section>
        <section className="row row-centered">
          <label className='control-label'>DB Type</label>
          <div className='row-item'>
            <select className='form-control' tabindex='3' ref='dbType'>
              {this.supportedDbs.map(type =>
                <option value={type.prefix} data-port={type.port}>{type.name}</option>
              )}
            </select>
          </div>
        </section>

        <section className="row row-centered">
          <label className='control-label'>Server</label>
          <div className='row-item-flex'>
            <atom-text-editor ref='dbServer' attributes={{mini: true, tabindex:4, 'placeholder-text':'localhost'}}></atom-text-editor>
          </div>
          <label className='control-port'>Port</label>
          <div className='row-item-flex'>
            <atom-text-editor ref='dbPort' attributes={{mini: true, tabindex:5, 'placeholder-text':this.state.defaultPort}}></atom-text-editor>
          </div>
        </section>

        <section className="row row-centered">
          <label className='control-label'>Auth</label>
          <div className='row-item-flex row-item-pad-right'>
            <atom-text-editor ref='dbUser' attributes={{mini: true, tabindex:6, 'placeholder-text':'user'}}></atom-text-editor>
          </div>
          <div className='row-item-flex row-item-pad-left'>
            <atom-text-editor ref='dbPassword' attributes={{mini: true, tabindex:7, 'placeholder-text':'password'}}></atom-text-editor>
          </div>
        </section>

        <section className="row row-centered">
          <label className='control-label'>Database</label>
          <div className='row-item-flex'>
            <atom-text-editor ref='dbName' attributes={{mini: true, tabindex:8, 'placeholder-text':'database-name'}}></atom-text-editor>
          </div>
        </section>

        <section className="row row-centered">
          <label className='control-label'>Options</label>
          <div className='row-item-flex'>
            <atom-text-editor ref='dbOptions' attributes={{mini: true, tabindex:9, 'placeholder-text':'option=value,ssl=true'}}></atom-text-editor>
          </div>
        </section>
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

  // if the user modifies the URL we'll try to break it into the separate parameters
  separateUrl() {
    if (!this.refs.url.hasFocus())
      return;

    // clear inputs
    this.refs.dbOptions.getModel().setText('');
    this.refs.dbServer.getModel().setText('');
    this.refs.dbPort.getModel().setText('');
    this.refs.dbName.getModel().setText('');
    this.refs.dbUser.getModel().setText('');
    this.refs.dbPassword.getModel().setText('');

    // we update the view, a combination of setting the atomTextEditor model and using Etch's updateElement (for non-atomTextEditor)
    // #'s in passwords etc screw up the URL.parse
    this.state.escapedUrl = this.refs.url.getModel().getText().replace(/#/g, '%23');
    var dbConfig = new DbConnectionConfig(this.state.escapedUrl);

    this.state.selectedProtocol = Utils.nullToEmpty(dbConfig.protocol);
    this.refs.dbOptions.getModel().setText(Utils.nullToEmpty(dbConfig.options));
    this.refs.dbServer.getModel().setText(Utils.nullToEmpty(dbConfig.server) + (dbConfig.instance ? '\\' + dbConfig.instance : ''));
    this.refs.dbPort.getModel().setText(Utils.nullToEmpty(dbConfig.port));
    this.refs.dbName.getModel().setText(Utils.nullToEmpty(dbConfig.dbName));
    this.refs.dbUser.getModel().setText(Utils.nullToEmpty(dbConfig.user));
    this.refs.dbPassword.getModel().setText(Utils.nullToEmpty(dbConfig.password));

    etch.update(this);
  }

  buildUrl() {
    if (this.refs.url.hasFocus())
      return;

    var dbConfig = new DbConnectionConfig(
      {
        'protocol' : this.state.selectedProtocol,
        'user' : this.refs.dbUser.getModel().getText(),
        'password' : this.refs.dbPassword.getModel().getText(),
        'serverInstance' : this.refs.dbServer.getModel().getText(), // this is server\instance in general
        'port' : this.refs.dbPort.getModel().getText(),
        'dbName' : this.refs.dbName.getModel().getText(),
        'options' : this.refs.dbOptions.getModel().getText(),
      }
    );

    var url = dbConfig.getUrl();
    this.state.escapedUrl = url;
    this.refs.url.getModel().setText(url);
    return url;
  }

  updateDbType(e) {
    for (var i = 0; i < this.refs.dbType.childNodes.length; i++) {
      var n = this.refs.dbType.childNodes[i];
      if (n.selected) {
        this.state.selectedProtocol = n.getAttribute('value');
        this.state.defaultPort = n.getAttribute('data-port');
        etch.update(this);
        this.buildUrl();
        return;
      }
    }
  }

  connectionPicked(e) {
    for (var i = 0; i < this.refs.connections.childNodes.length; i++) {
      var n = this.refs.connections.childNodes[i];
      if (n.selected) {
        this.refs.connectionName.getModel().setText(n.innerText);
        this.refs.url.focus();

        this.refs.btnSaveConnect.disabled = (n.value !== '')
        if (n.value === '') {
          this.refs.url.getModel().setText('');
          this.refs.connectionName.getModel().setText('');
          this.refs.dbOptions.getModel().setText('');
          this.refs.dbServer.getModel().setText('');
          this.refs.dbPort.getModel().setText('');
          this.refs.dbUser.getModel().setText('');
          this.refs.dbPassword.getModel().setText('');
          this.refs.dbName.getModel().setText('');
        }
        else {
          this.refs.url.getModel().setText(n.value);
          this.separateUrl();
        }
        return;
      }
    }
  }

  // Called when the user clicks the save and connect button.
  connectAndSave() {
    var connection = {
      name: this.refs.connectionName.getModel().getText() !== '' ? this.refs.connectionName.getModel().getText() : this.refs.dbName.getModel().getText(),
      protocol: this.state.selectedProtocol,
      user: this.refs.dbUser.getModel().getText(),
      password: this.refs.dbPassword.getModel().getText(),
      server: this.refs.dbServer.getModel().getText(),
      database: this.refs.dbName.getModel().getText(),
      options: this.refs.dbOptions.getModel().getText()
    };
    if (this.refs.dbPort.getModel().getText() !== '')
      connection.port = this.refs.dbPort.getModel().getText();
    DbFactory.saveConnection(connection).then(() => {
      this.loadedConnections.push(connection);
      this.onConnectClicked(this.buildUrl());
      this.close();
    });
  }

  // Called when the user clicks the connect button. Triggers a callback for the controller to
  // create a connection with the given parameters
  connect() {
    var url = this.buildUrl();
    console.debug("attempting to connect with url " + url);

    if (this.onConnectClicked && url !== '') {
      this.onConnectClicked(url);
      this.close();
    }
  }
}
