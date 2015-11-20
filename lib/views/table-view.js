"use babel";
/** @jsx etch.dom */

import etch from 'etch';

export default class DataResultView {
  constructor({columns, rows}) {
    this.state = {
      columns: columns,
      rows: rows,
      currentStart: 0,
      currentEnd: 200
    };
    etch.createElement(this);
  }

  render() {
    return  <table>
              <thead>
                <th>&nbsp;</th>
                {this.state.columns.map(col => <th>{col.name}</th>)}
              </thead>
              <tbody>
              {this.state.rows.slice(this.state.currentStart, this.state.currentEnd).map((row, cnt) =>
                <tr>
                  <td>{cnt + 1}</td>
                  {row.map(data =>
                    <td className='text-selectable'>{typeof data === 'object' ? JSON.stringify(data) : data.toString()}</td>
                  )}
                </tr>
              )}
              </tbody>
            </table>;
  }

  getElement() {
    return this.element;
  }
}
