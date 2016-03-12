'use babel';

import SQLMetaProvider from '../lib/sql-meta-provider';

describe('SQLMetaProvider', () => {
  describe('Get table names', () => {
    it('filters by prefix', () => {
      let editor = {
        dataAtomTables: [
          {
            name: 'test_table',
            schemaName: 'something'
          },
          {
            name: 'other_table',
            schemaName: 'something'
          },
          {
            name: 'test_table_2',
            schemaName: 'something'
          }
      ]};
      let tables = SQLMetaProvider.getTableNames(editor, 'test', 'something');

      expect(tables).not.toContain({text: 'other_table', rightLabel: 'Table'});
      expect(tables).toContain({text: 'test_table', rightLabel: 'Table'});
      expect(tables).toContain({text: 'test_table_2', rightLabel: 'Table'});
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
      expect(cols).toContain({text: 'test_col', rightLabel: 'Column', leftLabel: 'varchar'});
      expect(cols.length).toEqual(1);
    });
  });
})
