Meeemories.register("list", class extends Stimulus.Controller {
  static get targets() {
    return ["infinity", "next"]
  }
  initialize() {
    this.application.state.subscribe('scroll', () => {
      this.throttle('next', 500, () => {
        this.tryDispatchNext();
      })
      this.throttle('scroll', 500, pos => {
        this.onScroll(pos);
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
    if (this.nextTarget.offsetTop <= this.application.state.get('scroll') && this.nextLink) {
      this.element.dispatchEvent(new CustomEvent('next', { detail: this.nextLink }));
    }
  }
  onScroll(positon) {

  }
  add(data) {
    const template = $(this.itemTemplate);
    const container = this.element.querySelector('.list__container');
    for (const datum of data) {
      const html = template.render(datum);
      container.insertAdjacentHTML('beforeend', html);
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
    this.update(true);
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
