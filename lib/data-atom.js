var DataAtomView = require('./data-atom-view');
var DataManager = require('./data-manager');

var dataAtomView = null;

module.exports = {
   dataAtomView: null,

   activate: function(state) {
      dataAtomView = new DataAtomView(state.dataAtomViewState, new DataManager());
   },

   deactivate: function() {
      dataAtomView.destroy();
      console.log("Data Atom off");
   },

   serialize: {
      dataAtomViewState: function() { dataAtomView.serialize(); }
   }
};
