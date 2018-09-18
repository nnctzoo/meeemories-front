Meeemories.register("list", class extends Stimulus.Controller {
  static get targets() {
    return ["container", "item", "next"]
  }
  initialize() {
    this.application.state.subscribe('scroll', (current, old) => {
      this.throttle('next', 500, () => {
        this.tryDispatchNext();
      })
    })
    this.application.state.subscribe('is-grid-view', isGridView => {
      this.isGridView = isGridView;
      if (isGridView) setTimeout(() => {
        this.tryDispatchNext();
      }, 300)
    });
  }
  tryDispatchNext() {
    const isDisplay = !!this.nextTarget.offsetParent;
    const isBottom = this.nextTarget.offsetTop <= this.application.state.get('scroll') + 600;
    if (isDisplay && isBottom && this.nextLink) {
      this.element.dispatchEvent(new CustomEvent('next', { detail: this.nextLink }));
    }
  }
  prepend(data) {
  }
  append(data) {
    const template = $(this.itemTemplate);
    for (const datum of data) {
      const html = template.render(datum);
      this.containerTarget.insertAdjacentHTML('beforeend', html);
    }
    setTimeout(() => {
      this.tryDispatchNext();
     }, 500);
  }
  update() {
    this.element.classList.toggle('list--grid-view', this.isGridView);
  }
  toggleView() {
    this.isGridView = !this.isGridView;
  }
  get isGridView() {
    return this.data.get('is-grid-view') === 'true';
  }
  set isGridView(value) {
    this.data.set('is-grid-view', value);
    this.update();
  }
  get itemTemplate() {
    return this.data.get('item-template');
  }
  set itemTemplate(value) {
    this.data.set('item-template', value);
  }
  get nextLink() {
    return this.data.get('next-link');
  }
  set nextLink(value) {
    this.data.set('next-link', value);
  }
});
