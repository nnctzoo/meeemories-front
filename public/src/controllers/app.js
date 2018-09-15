Meeemories.register("app", class extends Stimulus.Controller {
  static get targets() {
    return ['main', 'list']
  }
  initialize() {
    this.listTarget.addEventListener('next', e => {
      this.tryLoad(e.detail);
    });
    this.tryLoad(151);
   
    this.application.state.subscribe('selecting', () => this.update());
    this.update();
    
    this.mainTarget.addEventListener('scroll', () => this.dispatchState());
    this.dispatchState();
    
  }
  dispatchState() {
    this.application.state.patch({scroll: this.mainTarget.scrollTop + this.mainTarget.offsetHeight});
  }
  tryLoad(url) {
    if (!this.isLoading) {
      this.isLoading = true;
      const finalize = () => {this.isLoading = false;};
      this.load(url).then(finalize, finalize);
    }
  }
  load (startIndex) {
    startIndex = parseInt(startIndex) || 0;
    return new Promise(function(resolve) {
      const data = [];
      Array
          .from(Array(10), (v, k) => startIndex + k)
          .forEach(i => 
            data.push({
              id: i,
              aspect: 1200 / 800,
              download: "https://picsum.photos/800/1200?image=" + i,
              tiny:"https://picsum.photos/20/30?image=" + i,
              thumbnail: {
                src: "https://picsum.photos/200/300?image=" + i,
                srcset: `https://picsum.photos/200/300?image=${i} 1x, https://picsum.photos/400/600?image=${i} 2x`
              },
              large: {
                src: "https://picsum.photos/400/600?image=" + i,
                srcset: `https://picsum.photos/400/600?image=${i} 1x, https://picsum.photos/800/1200?image=${i} 2x`
              }
            }));
      resolve(data);
    }).then((data) => {
      this.list.append(data);
      this.list.nextLink = data.pop().id + 1;
    })
  }
  toggleView() {
    this.isGridView = !this.isGridView;
    this.mainTarget.scrollTop = 0;
  }
  update() {
    this.debounce('upload', 50, () => {
      this.element.classList.toggle('app--grid-view', this.isGridView);
      this.element.classList.toggle('app--loading', this.isLoading);
      this.element.classList.toggle('app--selecting', this.isSelecting);
    });
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
    this.application.state.patch({'is-grid-view': value});
    this.update();
    this.listTarget.style.opacity = 0;
    setTimeout(() => {
      this.listTarget.style.opacity = 1;    
    }, 100);
  }
  get isLoading() {
    return this.data.get('is-loading') === 'true';
  }
  set isLoading(value) {
    this.data.set('is-loading', value);
    this.update();
  }
  get isSelecting() {
    for(let item of this.children("media-item")) {
      if (item.selected)
        return true;
    }
    return false;
  }
});