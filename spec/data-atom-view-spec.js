"use babel";

import {Workspace} from 'atom';

import DataAtomView from '../lib/views/data-atom-view';

function findDataAtomPanel(workspace) {
  [].slice.call(workspace.getElementsByTagName('section')).forEach(i => console.log(i.className));
  return [].slice.call(workspace.getElementsByTagName('section')).filter(i => i.classList.contains('data-atom-panel'));
}

describe("DataAtomView", () => {
  var workspaceElement = null;
  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);
  });

  describe("when toggling view", () => {
    it("it sets isShowing", () => {
      var view = new DataAtomView();
      expect(findDataAtomPanel(workspaceElement).length).toEqual(0);
      view.toggleView();
      expect(findDataAtomPanel(workspaceElement).length).toEqual(1);
      view.toggleView();
      expect(findDataAtomPanel(workspaceElement).length).toEqual(0);
    });
  });

  describe("when calling show()", () => {
    it("it sets isShowing true", () => {
      var view = new DataAtomView();
      expect(findDataAtomPanel(workspaceElement).length).toEqual(0);
      view.show();
      expect(findDataAtomPanel(workspaceElement).length).toEqual(1);
    });
  });

  describe("when calling hide()", () => {
    it("it sets isShowing false", () => {
      var view = new DataAtomView();
      expect(findDataAtomPanel(workspaceElement).length).toEqual(0);
      view.show();
      expect(findDataAtomPanel(workspaceElement).length).toEqual(1);
      view.hide();
      expect(findDataAtomPanel(workspaceElement).length).toEqual(0);
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
      expect(view.querySection.style.display).toEqual('block');
    });
    it('it hides the query input', () => {
      view.show();
      view.useEditorAsQuerySource(true);
      expect(view.querySection.style.display).toEqual('none');
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
