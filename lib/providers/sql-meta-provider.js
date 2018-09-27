'use babel';
import utils from '../utils';

class SQLMetaProvider {

  constructor() {
    this.selector = '.source.sql, .source.pgsql';
    this.disableForSelector = '.source.sql .string, .source.sql .comment'
    this.filterSuggestions = true;
    atom.config.observe( // called immediately and on update
      'autocomplete-plus.minimumWordLength',
      (newValue) => this.minimumWordLength = newValue
    )
  }

  getSchemaNames(editor, search) {
    let items = editor.dataAtomSchemata || [];
    if (items.length == 0)
      return [];
    return items.map((item) => {
      return {
        text: item.name,
        rightLabelHTML: `<span class="data-atom autocomplete"></span>${item.type}`
      };
    });
  }

  getTableNames(editor, tableSearch, schema) {
    let tables = editor.dataAtomTables || [];
    if (tables.length == 0)
      return [];

    let results = tables.filter((table) => {
      if (schema)
        return table.schemaName === schema;
      else
        return true;
    });

    return results.map((table) => {
      return {
        text: table.name,
        displayText: (schema || table.schemaName === editor.defaultSchema) ? table.name : table.schemaName + '.' + table.name,
        rightLabelHTML: `<span class="data-atom autocomplete autocomplete-tbl"></span>${table.type}`
      };
    });
  }

  getColumnNames(editor, columnSearch, objectName) {
    let columns = editor.dataAtomColumns || [];
    if (columns.length == 0)
      return [];

    let valid = columns.filter((col) => {
      if (objectName)
        return col.tableName === objectName;
      else
        return true;
    });
    return valid.map((col) => {
      return {
        text: col.name,
        rightLabelHTML: '<span class="data-atom autocomplete autocomplete-col"></span>Column',
        leftLabel: col.type || col.udt
      };
    });
  }

  getAliasedObject(editor, lastIdentifier) {
    let query = editor.getBuffer().getTextInRange(utils.getRangeForQueryAtCursor(editor));
    let matches = query.match(new RegExp('([\\w0-9]*)\\s*(?:AS)?\\s*' + lastIdentifier + '[\\s;]', 'i'));
    if (matches) {
      return matches[matches.length - 1];
    } else {
      return null;
    }
  }

  getPrefix(editor, bufferPosition) {
    let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
    let matches = line.match(/[\w\.]+$/);
    if (matches) {
      return matches[0] || '';
    } else {
      return '';
    }
  }

  getSuggestions({editor, bufferPosition, scopeDescriptor}) {
    return new Promise(resolve => {
      let prefix = this.getPrefix(editor, bufferPosition);
      let identifiers = prefix.split('.');
      let identsLength = identifiers.length;
      let results = [];

      let lastIdentifier = (identsLength > 1) && identifiers[identsLength - 2];
      let search = identifiers[identsLength - 1];
      if (search.length < this.minimumWordLength) return [];
      results = this.getColumnNames(editor, search, lastIdentifier).concat(this.getTableNames(editor, search, lastIdentifier));
      if (!lastIdentifier)
        results = results.concat(this.getSchemaNames(editor, search));
      // If there are no results, check for alias
      if (!results.length) {
        let tableName = this.getAliasedObject(editor, lastIdentifier);
        if (tableName) {
          // Get by matched alias table
          results = this.getColumnNames(editor, search, tableName);
        }
      }

      resolve(results);
    });
  }
}

export default new SQLMetaProvider();
