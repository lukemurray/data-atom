"use babel";

import {$} from 'atom-space-pen-views';

module.exports =
class DataResultView {
  constructor() {
    this.createView();
  }

  createView() {
    this.element = document.createElement('div');
    this.element.className = 'scrollable';

    this.resultArea = document.createElement('div');
    this.resultArea.className = 'native-key-bindings';
    this.resultArea.setAttribute('tabindex', -1);
    this.element.appendChild(this.resultArea);

    this.message = document.createElement('span');
    this.message.className = 'native-key-bindings';
    this.message.setAttribute('tabindex', -1);
    this.element.appendChild(this.message);
  }

  getElement() {
    return this.element;
  }

  clear() {
    $(this.message).empty();
    $(this.resultArea).empty();
  }

  setResults(results) {
    $(this.message).hide();
    $(this.resultArea).show();
    $(this.resultArea).empty();

    if (!results)
      return;

    for (var i = 0; i < results.length; i++) {
      var result = results[i];
      if (result.message) {
        $(this.resultArea).append('<span class="text-selectable">' + result.message + '</span>');
        $(this.resultArea).append('<br />');
        $(this.resultArea).append('<br />');
      }
      else {
        var table = $(document.createElement('table'));
        var header = $(document.createElement('thead'));
        table.append(header);
        header.append('<th>&nbsp;</th>'); // row no.

        for (var j = 0; j < result.fields.length; j++) {
          var field = result.fields[j];
          header.append('<th>' + field.name + '</th>');
        }
        var cnt = 1;

        var body = $(document.createElement('tbody'));
        table.append(body);

        for (var k = 0; k < result.rows.length; k++) {
          var row = result.rows[k];
          var rowEle = $(document.createElement('tr'));
          rowEle.append('<td>' + cnt++ + '</td>');
          body.append(rowEle);
          for (var t = 0; t < row.length; t++) {
            var data = row[t];
            rowEle.append('<td class="text-selectable">' + data + '</td>');
          }
        }

        $(this.resultArea).append(table);
        $(this.resultArea).append('<br />');
      }
    }
  }

  setMessage(msg) {
    $(this.resultArea).hide();
    $(this.message).empty();
    $(this.message).show();
    $(this.message).append(msg);
  }
}
