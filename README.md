# Data Atom package
[![Build Status](https://travis-ci.org/lukemurray/data-atom.svg?branch=master)](https://travis-ci.org/lukemurray/data-atom)

Data Atom allows you to write and execute queries against your favorite databases (PostgreSQL, MS SQL Server, MySQL) and visualize the results, all from within Atom. It supports autocomplete and exploring database information (tables, columns, views, etc.). The plan is to build it out with more data management functionality.

Feel free to open issues or make pull requests!

![Data Atom](https://cloud.githubusercontent.com/assets/156625/15249612/ccd377b0-1963-11e6-88ad-42eee914fc38.gif)

## Features
- Supports
  - PostgreSQL
  - Microsoft SQL Server
  - MySQL (Beta support, see issues for known problems)
  - [Metabase](http://www.metabase.com/) (Beta support)
- Execute custom queries or a whole file
  - Separate results for each file/editor view
  - Different connections per editor view
- Autocomplete for table and column names
- Easily change the database/connection to execute against
- View meta information (tables, columns, views, etc.) for the connected database
- Check the execution time in the right of the status bar
- Save connections for easily connecting later

## Usage
- `F5` or 'Data Atom: Execute' command
  - Executes the current query source (see below) against the current connection. It will prompt if there is no current connection
  - Only executes the selected text if there is any
- `CMD`+`ALT`+`R` (Mac), `ALT`+`SHIFT`+`R` (Windows, Linux) or the 'Data Atom: Toggle Results View' command
  - Toggle results view
- `ALT`+`SHIFT`+`D` or the 'Data Atom: Toggle Details View' command
  - Toggle the database details view, showing table, column, view, etc. information

### Other commands
- 'Data Atom: Toggle Query Source' or the button right of 'Execute' on the toolbar
  - Toggle the source of the query to execute between the active editor content and Data Atom's own query editor
  - Allows you to easily work with SQL files in the main editor or quickly execute queries while working in any file type
- 'Data Atom: New Query'
  - Switch to use Data Atom's query input and focus to the keyboard there
- 'Data Atom: New Connection'
  - Launch the new connection dialog to add a new connection
- 'Data Atom: Toggle Query Source'
  - Toggle the source of the query between the active editor content (or selection) and Data Atom's own query input
- 'Data Atom: Edit Connections'
  - Open the saved connections file for editing

## SQL Server specifics
- To use Windows authentication, include the option `domain=DOMAIN`.
- To connect to a named SQL Server instance use the format `SERVER\INSTANCE` to specify the server.
- See the complete listing of `node-mssql` driver options available to you at https://github.com/patriksimek/node-mssql.

## Contributing
Please do :)
- It is written in ES6 using Babel (provided by Atom)
- I am slowing moving callbacks I control to `Promise`s
- Looking at implementing support for your favorite DB?
  - Check out `data-manager.js` for what you need to implement
  - See `postgres-manager.js` for the most complete example

## The Random TODO list
- Replace grid with something better to allow row selection, column selection etc.
- Manage saved connections
- Add support for other database systems. Submit an issue or comment on one already there so we know the priorities
- More database information and visualisation e.g.
  - Exploring relations, views, etc.
