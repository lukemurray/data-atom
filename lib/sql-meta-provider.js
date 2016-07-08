'use babel';
import utils from './utils';

var SQLMetaProvider = {
  selector: '*',
  disableForSelector: '.source.sql .string, .source.sql .comment',

  getTableNames(editor, tablePrefix, schema) {
    let tables = editor.dataAtomTables || [];
    let valid = tables.filter((table) => {
      if (schema) {
        return table.schemaName === schema && table.name.startsWith(tablePrefix);
      } else if (tablePrefix) {
        return table.name.startsWith(tablePrefix) || table.schemaName.startsWith(tablePrefix);
      }
    });
    return valid.map((table) => {
      return {
        text: (schema || table.schemaName === 'public') ? table.name : table.schemaName + '.' + table.name,
        rightLabelHTML: `<span class="data-atom autocomplete autocomplete-tbl"></span>${table.type}`
      };
    });
  },

  getColumnNames(editor, columnPrefix, objectName) {
    let columns = editor.dataAtomColumns || [];
    let valid = columns.filter((col) => {
      if (objectName) {
        return col.tableName === objectName && col.name.startsWith(columnPrefix);
      } else if (columnPrefix) {
        return col.name.startsWith(columnPrefix);
      }
    });
    return valid.map((col) => {
      return {
        text: col.name,
        rightLabelHTML: `<span class="data-atom autocomplete autocomplete-col"></span>Column`,
        leftLabel: col.type || col.udt
      };
    });
  },

  getAliasedObject(editor, lastIdentifier) {
    let query = editor.getBuffer().getTextInRange(utils.getRangeForQueryAtCursor(editor));
    let matches = query.match(new RegExp('([\\w0-9]*)\\s*(?:AS)?\\s*' + lastIdentifier + '[\\s;]', 'i'));
    if (matches) {
      return matches[matches.length - 1];
    } else {
      return null;
    }
  },

  getPrefix(editor, bufferPosition) {
    let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
    let matches = line.match(/[\w\.]+$/);
    if (matches) {
      return matches[0] || '';
    } else {
      return '';
    }
  },

  getSuggestions({editor, bufferPosition, scopeDescriptor}) {
    let prefix = this.getPrefix(editor, bufferPosition);
    let identifiers = prefix.split('.');
    let identsLength = identifiers.length;
    let results = [];

    if (identsLength) {
      let lastIdentifier = (identsLength > 1) && identifiers[identsLength - 2];
      let search = identifiers[identsLength - 1];
      results = this.getColumnNames(editor, search, lastIdentifier).concat(this.getTableNames(editor, search, lastIdentifier));
      // If there are no results, check for alias
      if (!results.length) {
        let tableName = this.getAliasedObject(editor, lastIdentifier);
        if (tableName) {
          // Get by matched alias table
          results = this.getColumnNames(editor, search, tableName);
        }
      }
    }

    if (prefix && !results.length) {
      results = this.getTableNames(editor, prefix, null).concat(this.getColumnNames(editor, prefix, null));
    }

    return results;
  }
};

export default SQLMetaProvider;
