'use babel';

import SQLMetaProvider from '../lib/sql-meta-provider';

describe('SQLMetaProvider', () => {
  describe('Get table names', () => {
    it('filters by prefix', () => {
      let editor = {
        dataAtomTables: ['test_table', 'other_table', 'test_table_2']
      }
      let tables = SQLMetaProvider.getTableNames(editor, 'test');

      expect(tables).not.toContain({text: 'other_table', rightLabel: 'Table'});
      expect(tables).toContain({text: 'test_table', rightLabel: 'Table'});
      expect(tables).toContain({text: 'test_table_2', rightLabel: 'Table'});
      expect(tables.length).toEqual(2);
    });
  });

  describe('Get column names', () => {
    it('filters by prefix', () => {
      let editor = {
        dataAtomColumns: {
          'test_col': 'varchar',
          'other_col': 'bool'
        }
      };
      let cols = SQLMetaProvider.getColumnNames(editor, 'test');
      expect(cols).toContain({text: 'test_col', rightLabel: 'Column', leftLabel: 'varchar'});
      expect(cols.length).toEqual(1);
    });
  });
})
