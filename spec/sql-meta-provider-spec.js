'use babel';

import SQLMetaProvider from '../lib/sql-meta-provider';

describe('SQLMetaProvider', () => {
  describe('Get table names', () => {
    it('filters by prefix', () => {
      let editor = {
        dataAtomTables: [
          {
            name: 'test_table',
            schemaName: 'something',
            type: 'Table'
          },
          {
            name: 'other_table',
            schemaName: 'something',
            type: 'Table'
          },
          {
            name: 'test_table_2',
            schemaName: 'something',
            type: 'Table'
          }
      ]};
      let tables = SQLMetaProvider.getTableNames(editor, 'test', 'something');

      expect(tables).not.toContain({text: 'other_table', rightLabelHTML: '<span class="data-atom autocomplete autocomplete-tbl"></span>Table'});
      expect(tables).toContain({text: 'test_table', rightLabelHTML: '<span class="data-atom autocomplete autocomplete-tbl"></span>Table'});
      expect(tables).toContain({text: 'test_table_2', rightLabelHTML: '<span class="data-atom autocomplete autocomplete-tbl"></span>Table'});
      expect(tables.length).toEqual(2);
    });
  });

  describe('Get column names', () => {
    it('filters by prefix', () => {
      let editor = {
        dataAtomColumns: [
          {
            name: 'test_col',
            tableName: 'tbl',
            type: 'varchar'
          },
          {
            name: 'other_col',
            tableName: 'tbl',
            type: 'bool'
          }
        ]
      };
      let cols = SQLMetaProvider.getColumnNames(editor, 'test', 'tbl');
      expect(cols).toContain({text: 'test_col', rightLabelHTML: '<span class="data-atom autocomplete autocomplete-col"></span>Column', leftLabel: 'varchar'});
      expect(cols.length).toEqual(1);
    });
  });
})
