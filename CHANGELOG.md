##  -
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
* ESC will close the new conncetion dialog

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
