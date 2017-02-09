'use babel';

import DbConnectionConfig from '../lib/db-connection-config';

const test_url = 'deebee://dzamo:his pwd@localhost:1234/instance_name/db_name?domain=dom&requestTimeout=9999';

describe('DbConnectionConfig', function() {
  describe('when constructed', function() {
    it('sets the properties of its config object', function() {
      dbConfig = new DbConnectionConfig(test_url);
      console.debug('parsed db config from URL: ' + JSON.stringify(dbConfig));

      expect(dbConfig.protocol).toBe('deebee');
      expect(dbConfig.user).toBe('dzamo');
      expect(dbConfig.password).toBe('his pwd'); // check for URL decoding
      expect(dbConfig.server).toBe('localhost');
      expect(dbConfig.port).toBe('1234');
      expect(dbConfig.instance).toBe('instance_name');
      expect(dbConfig.dbName).toBe('db_name');
      expect(dbConfig.options).toBe('domain=dom&requestTimeout=9999');
    });
  });

  describe('getConnectionName', function() {
    it('returns a connection name of user@server', function() {
      dbConfig = new DbConnectionConfig(test_url);

      expect(dbConfig.getConnectionName()).toBe('dzamo@localhost');
    });
  });

  describe('getUrl', function() {
    it('returns a URL matching the one it was constructed from', function() {
      dbConfig = new DbConnectionConfig(test_url);

      expect(dbConfig.getUrl()).toBe(test_url);
    });

  });

  describe('getUrlWithDb', function() {
    it('returns a URL matching the one it was constructed from but with different DB', function() {
      dbConfig = new DbConnectionConfig(test_url);

      expect(dbConfig.getUrlWithDb('another_db_name')).toBe(test_url.replace('db_name', 'another_db_name'));
    });
  });

});