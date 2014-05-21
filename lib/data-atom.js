var DataAtomView = require('./data-atom-view');

var dataAtomView = null;

module.exports = {
   dataAtomView: null,

   activate: function(state) {
      dataAtomView = new DataAtomView(state.dataAtomViewState);
   },

   deactivate: function() {
      dataAtomView.destroy();
      console.log("Data Atom off");
   },

   serialize: {
      dataAtomViewState: function() { dataAtomView.serialize(); }
   }
};
