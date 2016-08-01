## 0.22.0
* Resolve occasional of out-of-sync results state (PR #82)
* Fix #78 Handle empty DB list
* Fix #79 handling error in MySQL
* 

## 0.21.0
* Refactored some code to use Promises
* Better comments about how to add DB support
* Fix #65 MySql error is not a string
* Now uses atom styled tooltips
* Added icons for autocomplete (#77)

## 0.20.4
* Support 'postgres' as well for a PostgreSQL url protocol
* Show a notification to the user is protocol is unsupported (instead of an uncaught error)

## 0.20.3
* Fix more MySql issues

## 0.20.2
* Fix #60 disconnecting MySql connection throws an error

## 0.20.1
* Fix possible MySql error processing error message

## 0.20.0
* Better error messages for PostgreSQL
* Include Views in autocomplete
* Change results view to scroll the whole pane instead of individual results. This is a better horizontal scroll experience

## 0.19.0
* Add option to execute query at the current cursor
* Autocomplete now handles table schemata and columns better
* Fix(53) - Make sure we URL encode the passwords

## 0.18.1
* fix(#50) Upgrade mssql package to 3.0 as previous version was unpublished from npm

## 0.18.0
* You can now resize columns in the results view
* Upgraded MS SQL and MySql libraries
* fix(#47) load DB options in saved connections

## 0.17.2
* Prevent an error when using data atom commands in a non code editor tab (issue #30)

## 0.17.1
* Can select whole result table to copy by clicking the top left most cell
* Fix error when drag select cells into the header

## 0.17.0
* Can now drag select rows (from the row number) or cells in the results table to copy contents

## 0.16.0
* Fixed copying of text
* Clicking a cell now selects that cell and you can copy it's contents
* Clicking the row number cell will select the whole row allowing you copy the entire row

## 0.15.2
* Fix issue where you could not use a # in a password or other URL parts

## 0.15.1
* Moving to Etch broke some rendering of columns values in results

## 0.15.0
* Table results scroll horizontally independent of each other
* Beta support for MySQL - See issues for known problems
* Clear the results view when executing

## 0.14.0
* Update autocomplete meta-information when the selected databased changes
* Stringify objects returned by the DB (PostgreSQL JSON objects)

## 0.13.0
* Support autocomplete for table and column names for both MS SQL Server and PostgreSQL
* Removed some default keyboard, the user can add their own. Also updated keyboard shortcuts for non mac users
* Some views have been rewritten using Etch - let me know if there is anything broken

## 0.12.0
* Fix(#30) exception when you open a data view or execute outside of an editor
* Added a details view for the active connection. Currently it lists out the tables and columns
  * Can be configured to open with the main results view
* Removed 'Data Atom: Disconnect' command as you had no context of what you were disconnecting. Use the disconnect button in the data atom view

## 0.11.1
* Fix issue with fetching table names with SQL Server

## 0.11.0
* Add the ability to save the connection from the new connection dialog
* Clean up all element when closing new connection dialog

## 0.10.0 -
* Add the ability to cancel a running query
* If the file is unsaved but has SQL syntax it will be used as the query source instead of the data atom query
* Do not create view state for editors that we may not need it for
* Clean up view states on editor close

## 0.9.3 -
* Fix(#22, #23) a few issues with changing connections and selecting the active database
* Fix: disable controls while executing

## 0.9.2 -
* Fix: new connection dialog tab order
* Fix: Remove resize from command list - it is not a command
* Fix(#20): Smarter layout of results and scroll bars are now seen
* fix: issue where query source toggle doesn't work the first time

## 0.9.1 -
* Handle error if not authentication details provided in connection

## 0.9.0 -
* `CMD`+`CTRL`+`Q` will open a query editor within Data Atom allowing you execute queries from any active editor
* New connection and disconnect buttons moved to the right and changed to icons
* New option in the toolbar to toggle between executing the active editor's content or Data Atom's own query content
* New command to edit you list of saved connections
* You can now load a saved connection in the new connection dialog
* ESC will close the new connection dialog

## 0.8.3 -
* You can now select results for copying

## 0.8.2 -
* Fix issue where DB type would not change on URI change
* Fix issue where you could not use '@' in a password (or any part of the URI)
* DB Port is now correctly used if it differs from the default

## 0.8.1 -
* Fix a reference to node-postgres library

## 0.8.0 -
* Upgrade MS SQL Server library
* Fix various issues connecting and executing queries against MS SQL Server

## 0.7.0 -
* Multiple queries will now show each result data or message separately in the result view instead of a weird merged table (PostgreSQL only currently)
* You can now select the database to execute against after adding a connection
* Execution status and time displayed in the right of the status bar
* Fix focus bug in new connection dialog
* Height of results view now correctly remembered across views

## 0.6.1 -
* Upgraded node-postgres to v4.3.0
* Small style changes to the drop-down control in the results view
* Fix issue that allowed user to connect when no connection data was entered

## 0.6.0 -
* Fixed warnings on deprecated Atom API calls
* Now works with Atom 0.196
