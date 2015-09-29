"use babel";

var _ = require('underscore');
var _s = require('underscore.string');

module.exports =
class NewQueryDialog {
  constructor(onExecute) {
    this.onExecuteClicked = onExecute;

    this.createView(this);

    this.placeholderQuery = "select [Columns] from [Table];";

    this.query.getModel().setPlaceholderText(this.placeholderQuery);
  }

  createView() {
    this.element = document.createElement('section');
    this.element.classList.add('dialog');

    var panelHeading = document.createElement('div');
    panelHeading.classList.add('heading');
    panelHeading.classList.add('section-heading');
    this.element.appendChild(panelHeading);

    this.header = document.createElement('span');
    this.header.innerText = 'New Query...';
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
    var label = document.createElement('label');
    label.classList.add('col-md-2');
    label.classList.add('control-label');
    label.innerText = 'Query';
    group.appendChild(label);
    var div = document.createElement('div');
    div.classList.add('col-md-10');
    group.appendChild(div);
    this.query = document.createElement('atom-text-editor');
    this.query.setAttribute('mini', '');
    div.appendChild(this.query);

    div = document.createElement('div');
    div.classList.add('buttons');
    this.element.appendChild(div);

    var btn = document.createElement('button');
    btn.classList.add('btn');
    btn.classList.add('btn-default');
    btn.innerText = 'Execute';
    div.appendChild(btn);
    btn.addEventListener('click', () => this.execute());

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
    this.query.focus();
  }

  close() {
    if (this.dialogPanel) {
      this.dialogPanel.hide();
    }
  }

  execute() {
    if (this.onExecuteClicked && this.query.getModel().getText() !== '') {
      this.onExecuteClicked(this.query.getModel().getText());
      this.close();
    }
  }
}
