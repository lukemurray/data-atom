"use babel";

import _s from 'underscore.string';

Statuses = {
  executing: ['status-bar-data-atom-executing', 'Executing... %s'],
  completed: ["status-bar-data-atom-completed", 'Completed in %s']
};

export default class StatusBarManager {
  constructor() {
    this.element = document.createElement('div');
    this.element.id = 'status-bar-data-atom';
    this.element.classList.add('inline-block');
  }

  update(status, arg) {
    // remove state CSS
    for (var k in Statuses) {
      this.element.classList.remove(Statuses[k][0]);
    }
    // set the text/CSS
    this.element.innerHTML = _s.sprintf(Statuses[status][1], arg);
    this.element.classList.add(Statuses[status][0]);
  }

  attachTo(statusBar) {
    this.tile = statusBar.addRightTile({item: this.element, priority: 20});
  }

  detach() {
    if (this.tile)
      this.tile.destroy();
  }
}
