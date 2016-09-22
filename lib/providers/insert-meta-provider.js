'use babel';
import utils from '../utils';

class InsertMetaProvider {

  constructor() {
    this.selector = '*';
    this.disableForSelector = '.source.sql .string, .source.sql .comment';
    this.labelHTML = `<span class="data-atom autocomplete autocomplete-col"></span>Column`;
  }

  getTableColumnNames(editor, tableName, existingColumns) {
    let columns = editor.dataAtomColumns || [];
    let valid = columns.filter(col => col.tableName === tableName && existingColumns.indexOf(col.name) < 0);
    let labels = valid.map(col => {
      return {
        text: col.name,
        rightLabelHTML: this.labelHTML,
        leftLabel: col.type || col.udt
      };
    });
    if (!existingColumns.length && labels.length) {
      let cols = [];
      let vals = [];
      valid.forEach((col, i) => {
          let nameText = col.type === 'character varying' ? `'${col.name}'` : col.name;
          vals.push(`\${${(i + 1).toString()}:${nameText}}`);
          cols.push(col.name);
      });
      labels.unshift({
        snippet: `(${cols.join(', ')})\nvalues(${vals.join(', ')})`,
        displayText: 'Insert snippet…',
        rightLabelHTML: this.labelHTML,
        leftLabel: 'All'
      });
    }
    return labels;
  }

  getMatch(editor, bufferPosition) {
    let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
    let matches = line.match(/insert\s+into\s+([\w\.]+)\s\(?(.*)\)?$/i);
    let match = {
        schema: '',
        tableName: '',
        existingColumns: []
    }
    if (matches) {
      let tableQualified = matches[1] || '';
      let tableWithSchema = tableQualified.split('.');

      match.tableName = tableWithSchema.pop();
      if (tableWithSchema.length) {
          match.schema = tableWithSchema.pop();
      }
      if (matches.length > 2 && matches[2]) {
        match.existingColumns = matches[2].split(/,\s?/g)
      }

    }
    return match;
  }

  getSuggestions({editor, bufferPosition, scopeDescriptor}) {
    return new Promise(resolve => {
      let match = this.getMatch(editor, bufferPosition);
      if (match.tableName) {
        resolve(this.getTableColumnNames(editor, match.tableName, match.existingColumns));
      } else {
        resolve([]);
      }
    });
  }
}

export default new InsertMetaProvider();
