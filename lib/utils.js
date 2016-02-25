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
  },

  getRangeForQueryAtCursor: function(editor) {
    let queryEndRegex = /^.*\;$/;
    let currentCursorRow = editor.getCursorBufferPosition().row;
    let range = [[0], [editor.getLastBufferRow() + 1]];
    editor.scanInBufferRange(queryEndRegex, [[currentCursorRow], [editor.getLastBufferRow() + 1]],
      function(endMatch) {
        range[1] = [endMatch.range.start.row + 1];
        return endMatch.stop();
    });
    editor.backwardsScanInBufferRange(queryEndRegex, [[0], [currentCursorRow]],
      function(startMatch) {
        range[0] = [startMatch.range.start.row + 1];
        return startMatch.stop();
    });
    return range;
  }
};
