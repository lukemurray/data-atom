"use babel";
import _s from 'underscore.string';

module.exports = {
  buildEscapeDbOptions: function(dbOptions) {
    var optionsStr = '';
    dbOptions.split(',').map(s => optionsStr += encodeURIComponent(s.trim()) + '&');
    optionsStr = _s.rtrim(optionsStr, '&');
    return optionsStr;
  },

  buildDbOptions: function(dbOptions) {
    var optionsStr = '';
    dbOptions.split(',').map(s => optionsStr += s.trim() + '&');
    optionsStr = _s.rtrim(optionsStr, '&');
    return optionsStr;
  }
}
