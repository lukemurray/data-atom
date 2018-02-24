"use babel";

import {Workspace} from 'atom';

import DataAtomView from '../lib/views/data-atom-view';

function findDataAtomPanel(workspace) {
  return workspace.querySelectorAll('.atom-dock-open .data-atom-panel');
}

describe("DataAtomView", () => {
  var workspaceElement = null;
  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);
  });

  describe("when toggling view", () => {
    it("it sets isShowing", testAsync(async () => {
      var view = new DataAtomView();
      expect(findDataAtomPanel(workspaceElement).length).toEqual(0);
      await view.toggleView();
      expect(findDataAtomPanel(workspaceElement).length).toEqual(1);
      await view.toggleView();
      expect(findDataAtomPanel(workspaceElement).length).toEqual(0);
    }));
  });

  describe("when calling show()", () => {
    it("it sets isShowing true", testAsync(async () => {
      var view = new DataAtomView();
      expect(findDataAtomPanel(workspaceElement).length).toEqual(0);
      await view.show();
      expect(findDataAtomPanel(workspaceElement).length).toEqual(1);
    }));
  });

  describe("when calling hide()", () => {
    it("it sets isShowing false", testAsync(async () => {
      var view = new DataAtomView();
      expect(findDataAtomPanel(workspaceElement).length).toEqual(0);
      await view.show();
      expect(findDataAtomPanel(workspaceElement).length).toEqual(1);
      await view.hide();
      expect(findDataAtomPanel(workspaceElement).length).toEqual(0);
    }));
  });

  describe('when toggling query source', () => {
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

  describe('when "useQueryAtCursor" option is "true"', () => {
    var view;
    beforeEach(() => {
      view = new DataAtomView();
      waitsForPromise(() => {
        return atom.workspace.open('test.sql');
      });
    });

    it('it only gets the query at the cursor', () => {
      var editor = atom.workspace.getActiveTextEditor();
      editor.insertText('select * from my_table;\nselect* from other_table;\nselect *\nfrom this_table\nwhere 1 = 1;');
      expect(view.getQuery(true, true)).toEqual('select *\nfrom this_table\nwhere 1 = 1;');
    });
  });
});

function testAsync(runAsync) {
  return (done) => {
    runAsync().then(done, e => { fail(e); done(); });
  };
}
