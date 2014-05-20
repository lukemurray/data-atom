var DataAtomView = require('./data-atom-view');
var DataManager = require('./data-manager');

var dataAtomView = null;

module.exports = {
   dataAtomView: null,

   activate: function(state) {
      dataAtomView = new DataAtomView(state.dataAtomViewState, new DataManager());
      console.log("DataAtom on");
   },

   deactivate: function() {
      dataAtomView.destroy();
      console.log("DataAtom off");
   },

   serialize: {
      dataAtomViewState: function() { dataAtomView.serialize(); }
   }
};
