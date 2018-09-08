Meeemories.register("app", class extends Stimulus.Controller {
  static get targets() {
    return ['list']
  }
  initialize() {
    this.listTarget.addEventListener('next', e => {
      this.tryLoad(e.detail);
    });
    this.tryLoad();
  }
  tryLoad(url) {
    if (!this.isLoading) {
      this.isLoading = true;
      this.load(url).finally(() => {
        this.isLoading = false;
      })
    }
  }
  load (startIndex) {
    startIndex = parseInt(startIndex) || 0;
    return new Promise(function(resolve) {
      const data = [];
      for(let i = startIndex, last = i + 10; i < last; i++) {
        data.push({
          id: i,
          thumnail: "https://picsum.photos/200/300?image=" + i,
          sources: [
            { media_cond: "(min-width: 640px) and (-webkit-min-device-pixel-ratio: 2)", url: "https://picsum.photos/800/1200?image=" + i },
            { media_cond: "(min-width: 640px)", url: "https://picsum.photos/400/600?image=" + i },
            { media_cond: "(min-width: 320px) and (-webkit-min-device-pixel-ratio: 2)", url: "https://picsum.photos/400/600?image=" + i },
            { media_cond: "(min-width: 320px)", url: "https://picsum.photos/200/300?image=" + i },
          ]
        });
      }
      resolve(data);
    }).then((data) => {
      this.list.add(data);
      this.list.nextLink = startIndex + data.length;
    })
  }
  update() {
    this.element.classList.toggle('app--grid-view', this.isGridView);
    this.element.classList.toggle('app--loading', this.isLoading);
  }
  toggleView() {
    this.isGridView = !this.isGridView;
    this.list.clear();
    this.list.toggleView();
    this.load();
  }
  get list () {
    if (!this.__list) {
      this.__list = this.getController(this.listTarget, 'list');
    }
    return this.__list;
  }
  get isGridView() {
    return this.data.get('is-grid-view') === 'true';
  }
  set isGridView(value) {
    this.data.set('is-grid-view', value);
    this.update();
  }
  get isLoading() {
    return this.data.get('is-loading') === 'true';
  }
  set isLoading(value) {
    this.data.set('is-loading', value);
    this.update();
  }
  get selecting() {
    for(let item of this.children("media-item")) {
      if (item.selected)
        return true;
    }
    return false;
  }
});
