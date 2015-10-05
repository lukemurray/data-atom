{$, View} = require 'atom-space-pen-views'

module.exports =
class DataResultView extends View
   @content: ->
      @div class: 'scrollable', =>
         @div class: 'native-key-bindings', outlet: 'resultArea'
         @span class: 'native-key-bindings', outlet: 'message'

   initialize: ->
     @resultArea.attr('tabindex', -1)
     @message.attr('tabindex', -1)

   clear: ->
      @message.empty()
      @resultArea.empty()

   setResults: (results) ->
      @message.hide()
      @resultArea.show()

      @resultArea.empty()

      if (!results)
        return;

      for result in results
        if result.message
          @resultArea.append('<span class="text-selectable">' + result.message + '</span>')
          @resultArea.append('<br />')
          @resultArea.append('<br />')
        else
          table = $(document.createElement('table'))
          header = $(document.createElement('thead'))
          table.append(header);
          header.append('<th>&nbsp;</th>') # row no.

          for field in result.fields
            header.append('<th>' + field.name + '</th>')
          cnt = 1

          body = $(document.createElement('tbody'))
          table.append(body)

          for row in result.rows
            rowEle = $(document.createElement('tr'))
            rowEle.append('<td>' + cnt++ + '</td>')
            body.append(rowEle)
            for data in row
              rowEle.append('<td class="text-selectable">' + data + '</td>')
          @resultArea.append(table)
          @resultArea.append('<br />')

   setMessage: (msg) ->
      @resultArea.hide()
      @message.empty()
      @message.show()
      @message.append(msg)
