'use babel';
/** @jsx etch.dom */

import etch from 'etch';
import Clipboard from 'clipboard';
import DOMListener from 'dom-listener';

export default class DataResultView {
  constructor({columns, rows}) {
    this.state = {
      columns: columns,
      rows: rows,
      currentStart: 0,
      currentEnd: 200,
      selectedItems: [],
      dragSelectRow: false,
      dragSelectCell: false,
      dragSelectFunc: event => { this.dragSelect(event); }
    };
    etch.createElement(this);

    atom.commands.add(this.element, {
      'core:copy': () => {
        let str = this.state.selectedItems.map(ele => ele.innerText).join('\n');
        Clipboard.writeText(str);
      }
    })

    let listener = new DOMListener(this.element);
    listener.add('.result-cell', 'mousedown', event => this.cellDragStart(event));
    listener.add('.result-cell', 'mouseup', event => this.selectDragEnd(event));
    listener.add('.result-row', 'mousedown', event => this.rowDragStart(event));
    listener.add('th', 'mouseup', event => this.selectDragEnd(event));
    listener.add('tr', 'mouseup', event => this.selectDragEnd(event));
    // listener.add('.col-header', 'mouseover', event => this.columnResizeCheck(event));
    this.refs.tableHeader.addEventListener('click', () => this.selectTable());
  }

  render() {
    // this.state.rows.slice(this.state.currentStart, this.state.currentEnd).map((row, cnt) =>
    return  <table ref='table' tabIndex='-1'>
              <thead>
                <tr>
                  <th ref='tableHeader'>&nbsp;</th>
                  {this.state.columns.map(col => <th className='col-header'>{col.name}</th>)}
                </tr>
              </thead>
              <tbody>
              {this.state.rows.map((row, cnt) =>
                <tr>
                  <td className='result-row'>{cnt + 1}</td>
                  {row.map((data, col) =>
                    <td className='result-cell'>{typeof data === 'object' ? JSON.stringify(data) : data.toString()}</td>
                  )}
                </tr>
              )}
              </tbody>
            </table>;
  }

  // Select the rows or cells we are dragging over
  dragSelect(event) {
    // remove all over selected items
    this.state.selectedItems.forEach(ele => { ele.classList.remove('result-selected'); });
    this.state.selectedItems = [];

    let allRows = this.refs.table.getElementsByTagName('tr');

    if (this.state.dragSelectRow) {
      var startRow = this.state.startItem.rowIndex; // select from here
      var endRow = event.target.parentElement.rowIndex; // to here

      for (var r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); ++r) {
        let tr = allRows[r];
        tr.classList.add('result-selected');
        this.state.selectedItems.push(tr);
      }
    }
    else if (this.state.dragSelectCell) {
      var startRow = this.state.startItem.parentElement.rowIndex; // select from here
      var endRow = event.target.parentElement.rowIndex; // to here
      var startCol = this.state.startItem.cellIndex;
      var endCol = event.target.cellIndex;

      for (var r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); ++r) {
        let tr = allRows[r];
        let rowColumns = r == 0 ? tr.getElementsByTagName('th') : tr.getElementsByTagName('td');
        for (var c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); ++c) {
          let cell = rowColumns[c];
          cell.classList.add('result-selected');
          this.state.selectedItems.push(cell);
        }
      }
    }
  }

  rowDragStart(event) {
    this.state.dragSelectRow = true;
    this.selectDragStart(event.target.parentElement);
  }

  cellDragStart(event) {
    this.state.dragSelectCell = true;
    this.selectDragStart(event.target);
  }

  selectDragStart(item) {
    this.state.selectedItems.forEach(ele => { ele.classList.remove('result-selected'); });
    this.refs.table.addEventListener('mouseover', this.state.dragSelectFunc);

    // select the current cell/row
    item.classList.add('result-selected');
    this.state.startItem = item;
    this.state.selectedItems = [item];
  }

  // clean up when cell/row drag select is done
  selectDragEnd(event) {
    this.refs.table.removeEventListener('mouseover', this.state.dragSelectFunc);
    this.state.dragSelectRow = false;
    this.state.dragSelectCell = false;
    this.state.startItem = null;
  }

  selectTable() {
    this.state.selectedItems.forEach(ele => { ele.classList.remove('result-selected'); });
    let tableRows = [].slice.call(this.refs.table.getElementsByTagName('tr'));
    tableRows.forEach(ele => { ele.classList.add('result-selected'); });
    this.state.selectedItems = [].concat(tableRows);
  }

  columnResizeCheck(event) {

  }
}
