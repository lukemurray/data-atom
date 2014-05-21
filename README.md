# Data Atom package

Data Atom allows you to build and run queries against your favourite databases and visualise the results, all from within Atom. The plan is to build it out with more data management support.

Note: This is a super early version of what I'm hoping it becomes... Feel free to open issues or pull requests!

![A screenshot of your spankin' package](https://f.cloud.github.com/assets/69169/2290250/c35d867a-a017-11e3-86be-cd7c5bf3ff9b.gif)

##Features
- Connects to
   - PostgreSQL
- See query results in a grid view
- Not much else yet :)

##Todo
- Replace grid with something better
- Connection dialog
   - DB type in connection dialog should show supported 'engines'
   - ESC should close it
   - Should be modal
- Show feedback that queries are executing
- Results per file
- Manage connections
   - multiple connections
   - able to disconnect
   - show connection errors on connection dialog
   - On execute if connections exist allow them to choose or create a new one
- Add support other DBs
    - MySql
    - MS Sql Server
    - Mongo DB
    - others?
 - Tree view for seeing tables columns etc.
