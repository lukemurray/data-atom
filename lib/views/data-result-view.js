"use babel";
/** @jsx etch.dom */

import etch from 'etch';
import TableView from './table-view';

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
      content = (<span>{JSON.stringify(this.state.message)}</span>)
    }
    else {
      content = this.state.results.map(result =>
        result.message ?
          <span className='text-selectable result-message'>{result.message}</span>
        :
          <div className='result-table'>
            <TableView columns={result.fields} rows={result.rows} />
          </div>
      )
    }
    return <div className='results-section'>
      <span className='heading-title'>Results:</span>
      <div className='scollable'>
        {content}
      </div>
    </div>;
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
