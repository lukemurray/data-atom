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
      selectedCell: null
    };
    etch.createElement(this);

    atom.commands.add(this.element, {
      'core:copy': () => {
        if (this.state.selectedCell) {
          Clipboard.writeText(this.state.selectedCell.innerText);
        }
      }
    })

    let listener = new DOMListener(this.element);
    listener.add('.result-cell', 'click', event => this.cellClicked(event));
    listener.add('.result-row', 'click', event => this.rowClicked(event));
    // listener.destroy();
  }

  render() {
    // {this.state.rows.slice(this.state.currentStart, this.state.currentEnd).map((row, cnt) =>
    return  <table tabIndex='-1'>
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

  getElement() {
    return this.element;
  }

  rowClicked(e) {
    if (this.state.selectedCell) {
      this.state.selectedCell.classList.remove('result-selected');
    }
    this.state.selectedCell = e.target.parentElement;
    this.state.selectedCell.classList.add('result-selected');
  }

  cellClicked(e) {
    if (this.state.selectedCell) {
      this.state.selectedCell.classList.remove('result-selected');
    }
    e.target.classList.add('result-selected');
    this.state.selectedCell = e.target;
  }
}
