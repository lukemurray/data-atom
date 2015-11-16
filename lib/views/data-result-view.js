"use babel";
/** @jsx etch.dom */

import etch from 'etch';

function escapeHtml(unsafe) {
  return typeof unsafe != 'string' ? unsafe.toString() : unsafe.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
 }

export default class DataResultView {
  constructor() {
    this.state = {
      message: null,
      results: []
    };
    etch.createElement(this);
  }

  render() {
    var content;
    if (this.state.message) {
      content = (<span className='native-key-bindings' tabIndex='-1'>{JSON.stringify(this.state.message)}</span>)
    }
    else {
      content = (<div className='scrollable native-key-bindings'>
        {this.state.results.map(result =>
          result.message ?
            <span className='text-selectable result-message' tabIndex='-1'>{result.message}</span>
          :
            <div className='result-table'>
              <table>
                <thead>
                  <th>&nbsp;</th>
                  {result.fields.map(field =>
                    <th>{field.name}</th>
                  )}
                </thead>
                <tbody>
                {result.rows.map((row, cnt) =>
                  <tr>
                    <td>{cnt + 1}</td>
                    {row.map(data =>
                      <td className='text-selectable' tabIndex='-1'>{typeof data === 'object' ? JSON.stringify(data) : escapeHtml(data)}</td>
                    )}
                  </tr>
                )}
                </tbody>
              </table>
            </div>
        )}
      </div>)
    }
    return <div>{content}</div>;
  }

  getElement() {
    return this.element;
  }

  clear() {
    this.state.message = null;
    this.state.results = [];
    etch.updateElement(this);
  }

  setResults(results) {
    this.state.message = null;
    this.state.results = results;
    etch.updateElement(this);
  }

  setMessage(msg) {
    this.state.results = [];
    this.state.message = msg;
    etch.updateElement(this);
  }
}
