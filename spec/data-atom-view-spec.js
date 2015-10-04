"use babel";

var {$} = require('atom-space-pen-views');

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
});
