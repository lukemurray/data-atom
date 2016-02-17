"use babel";
var SQLMetaProvider = {
  selector: '*',

  getTableNames(editor, prefix) {
    let tables = editor.dataAtomTables || [];
    let valid = tables.filter((x) => x.startsWith(prefix));
    return valid.map((table) => {
      return {
        text: table,
        rightLabel: 'Table'
      };
    });
  },

  getColumnNames(editor, prefix) {
    let columns = Object.keys(editor.dataAtomColumns || {});
    let valid = columns.filter((x) => x.startsWith(prefix));
    return valid.map((column) => {
      return {
        text: column,
        rightLabel: 'Column',
        leftLabel: editor.dataAtomColumns[column]
      };
    });
  },

  getSuggestions: function({editor, bufferPosition, scopeDescriptor, prefix, activatedManually}) {
    return this.getTableNames(editor, prefix).concat(this.getColumnNames(editor, prefix));
  }
};

export default SQLMetaProvider;
