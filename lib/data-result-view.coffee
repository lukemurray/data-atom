{$, View} = require 'atom'

module.exports =
class DataResultView extends View
   @content: ->
      @div class: 'scrollable', =>
         @table outlet: 'resultTable', =>
            @thead =>
               @tr outlet: 'header'
            @tbody outlet: 'resultBody'
         @span outlet: 'message'

   initialize: ->

   updateHeight: (height) =>
      @height(height)

   setResults: (results) ->
      if results.command != 'SELECT'
         @setMessage(@buildMessage(results))
      else
         @buildResultGrid(results)

   buildMessage: (results) ->
      switch results.command
         when 'UPDATE' then results.rowCount + ' rows updated.'
         when 'DELETE' then results.rowCount + ' rows deleted.'
         else results

   buildResultGrid: (results) ->
      @message.hide()
      @resultTable.show()

      @header.empty()
      @resultBody.empty()

      @header.append('<th>&nbsp;</th>') # row no.

      for field in results.fields
         @header.append('<th>' + field.name + '</th>')
      cnt = 1
      for row in results.rows
         rowEle = $(document.createElement('tr'))
         rowEle.append('<td>' + cnt++ + '</td>')
         @resultBody.append(rowEle)
         for data in row
            rowEle.append('<td>' + data + '</td>')
         #@resultBody.append('</tr>')

   setMessage: (msg) ->
      @resultTable.hide()
      @message.show()
      @message.empty()
      @message.append(msg)
