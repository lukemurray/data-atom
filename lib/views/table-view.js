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
      dragSelectFunc: event => { this.dragSelect(event); }
    };
    etch.createElement(this);

    atom.commands.add(this.element, {
      'core:copy': () => {
        var str = this.state.selectedItems.map(ele => ele.innerText).join('\n');
        Clipboard.writeText(str);
      }
    })

    let listener = new DOMListener(this.element);
    listener.add('.result-cell', 'mousedown', event => this.cellDragStart(event));
    listener.add('.result-cell', 'mouseup', event => this.selectDragEnd(event));
    listener.add('.result-row', 'mousedown', event => this.rowDragStart(event));
    listener.add('.result-row', 'mouseup', event => this.selectDragEnd(event));
    // listener.destroy();
  }

  render() {
    // this.state.rows.slice(this.state.currentStart, this.state.currentEnd).map((row, cnt) =>
    return  <table ref='table' tabIndex='-1'>
              <thead>
                <th>&nbsp;</th>
                {this.state.columns.map(col => <th>{col.name}</th>)}
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
  dragSelect(e) {
    // remove all over selected items
    this.state.selectedItems.forEach(ele => { ele.classList.remove('result-selected'); });
    this.state.selectedItems = [];

    if (this.state.dragSelectRow) {
      var startRow = this.state.startItem.rowIndex; // select from here
      var endRow = e.target.parentElement.rowIndex; // to here

      for (var r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); ++r) {
        let tr = this.refs.table.getElementsByTagName('tr')[r];
        tr.classList.add('result-selected');
        this.state.selectedItems.push(tr);
      }
    }
    else if (this.state.dragSelectCell) {
      var startRow = this.state.startItem.parentElement.rowIndex; // select from here
      var endRow = e.target.parentElement.rowIndex; // to here
      var startCol = this.state.startItem.cellIndex;
      var endCol = e.target.cellIndex;

      for (var r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); ++r) {
        let tr = this.refs.table.getElementsByTagName('tr')[r];
        for (var c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); ++c) {
          let cell = tr.getElementsByTagName('td')[c];
          cell.classList.add('result-selected');
          this.state.selectedItems.push(cell);
        }
      }
    }
  }

  rowDragStart(e) {
    this.selectDragStart(e.target.parentElement);
    this.state.dragSelectRow = true;
  }

  cellDragStart(e) {
    this.selectDragStart(e.target);
    this.state.dragSelectCell = true;
  }

  selectDragStart(item) {
    this.refs.table.addEventListener('mouseover', this.state.dragSelectFunc);
    this.state.selectedItems.forEach(ele => { ele.classList.remove('result-selected'); });

    // select the current cell/row
    item.classList.add('result-selected');
    this.state.startItem = item;
    this.state.selectedItems = [item];
  }

  // clean up when cell/row drag select is done
  selectDragEnd(e) {
    this.refs.table.removeEventListener('mouseover', this.state.dragSelectFunc);
    this.state.dragSelectRow = false;
    this.state.dragSelectCell = false;
  }
}
