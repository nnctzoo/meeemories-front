const RECYCLE_ITEM_MAX = 33;
Meeemories.register("recyclable", class extends Stimulus.Controller {
  static get targets() {
    return ["item"]
  }
  initialize() {
    this.application.state.subscribe('scroll', (current, old) => {
      this.throttle('scroll', 200, () => {
        this.onScroll(current, old);
      })
    })
    this.itemData = [];
  }
  onScroll(current, old) {
    old = old || current;
    const viewportBottom = current;
    const viewportTop = viewportBottom - window.outerHeight;
    const items = this.itemTargets.reverse();
    items.forEach(el => {
      const elTop = el.offsetTop;
      const elBottom = elTop + el.clientHeight;
      if (current - old > 0 && elBottom <= viewportTop) {
        this.resycleTopToBottom(el);
      }
      if (current - old < 0 && elTop >= viewportBottom) {
        this.resycleBottomToTop(el);
      }
    })
  }
  resycleTopToBottom(el) {
    const last = this.itemTargets[this.itemTargets.length - 1];
    if (last) {
      this.resycle(el, last, +1);
    }
  }
  resycleBottomToTop(el) {
    const first = this.itemTargets[0];
    if (first) {
      this.resycle(el, first, -1);
    }
  }
  indexOfItem(el) {
    const id = el.dataset.id;
    const datum = this.itemData.find(it => it.id == id);
    return this.itemData.indexOf(datum);
  }
  resycle(el, pivot, dir) {
    if (this.itemTargets.length > RECYCLE_ITEM_MAX) {
      const style = el.computedStyleMap();
      const height = el.offsetHeight + style.get('margin-top').value;
      this.head = this.head + height * dir;
      el.remove();
    }

    const next = this.itemData[this.indexOfItem(pivot) + dir];
    if (next) {
      const html = $(this.itemTemplate).render(next);
      this.containerTarget.insertAdjacentHTML(dir > 0 ? 'beforeend' : 'afterbegin', html);
    }
  }
  prepend(data) {
    this.itemData = data.concat(this.itemData);
    this.add(data, 'afterbegin');
  }
  append(data) {
    this.itemData = this.itemData.concat(data);
    this.add(data, 'beforeend');
  }
  add(data, position) {
    const template = $(this.itemTemplate);
    for (const datum of data) {
      if (this.itemTargets.length < RECYCLE_ITEM_MAX) {
        const html = template.render(datum);
        this.containerTarget.insertAdjacentHTML(position, html);
      }
    }
    setTimeout(() => {
      this.tryDispatchNext();
    }, 500);
  }
  update() {
    this.containerTarget.style.paddingTop = this.head + 'px';
  }
  get itemTemplate() {
    return this.data.get('item-template');
  }
  set itemTemplate(value) {
    this.data.set('item-template', value);
  }
  get head() {
    return parseFloat(this.data.get('head')) || 0;
  }
  set head(value) {
    this.data.set('head', value);
    this.update();
  }
  get isLast() {
    return this.itemData[this.itemData.length - 1].id == this.itemTargets[this.itemTargets.length - 1].dataset.id;
  }
});
