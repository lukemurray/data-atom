# Data Atom package

Data Atom allows you to build and run queries against your favorite databases and visualize the results, all from within Atom. The plan is to build it out with more data management support.

Note: This is a super early version of what I'm hoping it becomes... Feel free to open issues or make pull requests!

![A screenshot of your spankin' package](https://f.cloud.github.com/assets/69169/2290250/c35d867a-a017-11e3-86be-cd7c5bf3ff9b.gif)

##Features
- Supports
  - PostgreSQL
  - Early support for MS SQL Server
- See query results below the executed query
  - Separate results for each file
  - Different connections per editor view
- Easily change the database to execute against
- Slowly working on more...

##Usage
- `F5` or 'Data Atom: Execute' command
  - Executes the current editor against the current connection. It will prompt if there is no current connection
  - Only executes the selected text if there is any
- `CMD`+`ALT`+`R` or 'Data Atom: Toggle Results View' command
  - Toggle results view
- Check the execution time in the right of the status bar

##Todo
- Replace grid with something better
- Manage connections
  - if connection fails don't keep it around
  - On execute if connections exist allow them to choose or create a new one
  - don't allow the same connection
- Add support other DBs
  - MySql
  - Mongo DB
  - better MS SQL Server
  - others?
- Tree view for exploring tables columns etc. ?
