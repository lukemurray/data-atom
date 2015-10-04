"use babel";

var {$} = require('atom-space-pen-views');
var {Workspace} = require('atom');

var DataAtomView = require('../lib/data-atom-view');

describe("DataAtomView", () => {
  var workspaceElement = null;
  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);
    workspaceElement = $(workspaceElement);
  });

  describe("when toggling view", () => {
    it("it sets isShowing", () => {
      var view = new DataAtomView();
      expect(workspaceElement.find('.data-atom-panel')).not.toExist();
      view.toggleView();
      expect(workspaceElement.find('.data-atom-panel')).toExist();
      view.toggleView();
      expect(workspaceElement.find('.data-atom-panel')).not.toExist();
    });
  });

  describe("when calling show()", () => {
    it("it sets isShowing true", () => {
      var view = new DataAtomView();
      expect(workspaceElement.find('.data-atom-panel')).not.toExist();
      view.show();
      expect(workspaceElement.find('.data-atom-panel')).toExist();
    });
  });

  describe("when calling hide()", () => {
    it("it sets isShowing false", () => {
      var view = new DataAtomView();
      expect(workspaceElement.find('.data-atom-panel')).not.toExist();
      view.show();
      expect(workspaceElement.find('.data-atom-panel')).toExist();
      view.hide();
      expect(workspaceElement.find('.data-atom-panel')).not.toExist();
    });
  });

  describe('When toggling query source', () => {
    var view;
    beforeEach(() => {
      view = new DataAtomView();
    });
    it('it shows the query input', () => {
      view.show();
      view.useEditorAsQuerySource(false);
      expect($(view.queryInput).css('display')).toEqual('block');
    });
    it('it hides the query input', () => {
      view.show();
      view.useEditorAsQuerySource(true);
      expect($(view.queryInput).css('display')).toEqual('none');
    });

    // not sure how to set up the active editor
    // it('it uses the editor text', () => {
    //   view.show();
    //   view.useEditorAsQuerySource(true);
    //   view.queryEditor.getModel().setText('test');
    //   expect(view.getQuery()).not.toEqual('test');
    // });
    it('it uses the query input text', () => {
      view.show();
      view.useEditorAsQuerySource(false);
      view.queryEditor.getModel().setText('test2');
      expect(view.getQuery()).toEqual('test2');
    });
  });
});
