Meeemories.register("list", class extends Stimulus.Controller {
  static get targets() {
    return ["infinity", "next"]
  }
  initialize() {
    this.infinity = this.infinityTargets.map(el => new infinity.ListView($(el)));
    window.addEventListener('scroll', () => {
      this.throttle('scroll', 500, () => {
        if (this.nextTarget.offsetTop <= window.scrollY + window.outerHeight) {
          this.element.dispatchEvent(new CustomEvent('next', { detail: this.nextLink }));
        }
      })
    })
  }
  add(data) {
    const template = $(this.itemTemplate);
    if (this.isGridView) {
      const size = this.infinity.length;
      const lengthes = this.infinity.map(inf => inf.pages.reduce((length, page) => length + page.items.length, 0));
      const offset = lengthes.reduce((total, length) => total + length, 0) % size;

      for (var i = 0; i < data.length; i++) {
        const datum = data[i];
        const html = template.render(datum);
        this.infinity[(offset + i) % size].append($(html));
      }
    }
    else {
      for (const datum of data) {
        const html = template.render(datum);
        this.infinity[0].append($(html));
      }
    }
  }
  addHtml(html, index = 0) {
    this.infinity[index].append(html);
  }
  clear() {
    for (let j = 0; j < 3; j++) {
      for (let i = this.infinity[j].pages.length - 1; i >= 0; i--) {
        while (this.infinity[j].pages[i].items.length > 0)
          this.infinity[j].pages[i].items.pop().remove();
        this.infinity[j].pages.pop();
      }
    }
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
