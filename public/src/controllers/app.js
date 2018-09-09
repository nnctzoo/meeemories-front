Meeemories.register("app", class extends Stimulus.Controller {
  static get targets() {
    return ['list', 'file', 'notification', 'notificationIndicator']
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
      const finalize = () => {this.isLoading = false;};
      this.load(url).then(finalize, finalize);
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
  upload() {
    for(let file of this.fileTarget.files) {
      const template = document.querySelector('#uploading-tmpl').content;
      const fragment = template.cloneNode(true);
      fragment.firstElementChild.addEventListener('initialized', e => {
        this.getController(e.target, 'uploading-item').start(file);
      });
      this.notificationTarget.appendChild(fragment);
    }
    this.isShowingNotification = true;
  }
  toggleView() {
    this.isGridView = !this.isGridView;
    this.list.clear();
    this.list.toggleView();
    this.load();
  }
  toggleNotification() {
    this.isShowingNotification = !this.isShowingNotification;
  }
  update() {
    this.element.classList.toggle('app--grid-view', this.isGridView);
    this.element.classList.toggle('app--loading', this.isLoading);
    this.element.classList.toggle('app--selecting', this.isSelecting);
    this.notificationTarget.classList.toggle('app__notification--showing', this.isShowingNotification);
    this.notificationIndicatorTarget.classList.toggle('app__notificatoion-indicator--showing', this.notificationTarget.childElementCount > 0);
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
  get isShowingNotification() {
    return this.data.get('is-showing-notification') === 'true';
  }
  set isShowingNotification(value) {
    this.data.set('is-showing-notification', value);
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
