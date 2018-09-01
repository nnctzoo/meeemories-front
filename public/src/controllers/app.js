Meeemories.register("app", class extends Stimulus.Controller {
  static get targets() {
    return ["list"]
  }
  initialize() {
    this.infinity = [
      new infinity.ListView($(this.listTargets[0])),
      new infinity.ListView($(this.listTargets[1])),
      new infinity.ListView($(this.listTargets[2]))
    ];
    window.addEventListener('scroll', () => {
      this.onScroll();
    })
    this.load();
  }
  onScroll() {
    if (!this.updateScheduled) {
      this.updateScheduled = setTimeout(() => {
        const $loader =  $("#loader");
        const viewportBottom = $(window).scrollTop() + $(window).height();
        if ($loader.length > 0 && $loader.offset().top <= viewportBottom) {
          this.next();
        }
        this.updateScheduled = null;
      }, 500);
    }
  }
  load (startIndex) {
    startIndex = startIndex || 0;
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
      this.render(data, startIndex + data.length)
    })
  }
  render(data, nextLink) {
    if (this.isGridView) {
      const len1 = this.infinity[0].pages.reduce((length, page) => length + page.items.length, 0);
      const len2 = this.infinity[1].pages.reduce((length, page) => length + page.items.length, 0);
      const len3 = this.infinity[2].pages.reduce((length, page) => length + page.items.length, 0);
      const offset = len1 > len2 ? 1 : len2 > len3 ? 2 : 0;

      for (var i = 0; i < data.length; i++) {
        const datum = data[i];
        const html = $("#media-tmpl").render(datum);
        this.infinity[(offset + i)%3].append($(html));
      }
    }
    else {
      for(const datum of data) {
        const html = $("#media-tmpl").render(datum);
        this.infinity[0].append($(html));
      }
    }
    this.infinity[0].append($(`<div id='loader' data-next="${nextLink}">Now Loading...</div>`));
  }
  next() {
    const pages = this.infinity[0].pages;
    const items = pages[pages.length - 1].items;
    let startIndex = 0;
    if (items.length > 0) {
      const last = items[items.length - 1];
      startIndex = +last.$el.attr("data-next");
      last.remove();
    }
    this.load(startIndex);
  }
  update() {
    this.element.classList.toggle('app--grid-view', this.isGridView);
  }
  toggleView() {
    this.isGridView = !this.isGridView;
    this.clear();
    this.load();
  }
  clear() {
    for(let j = 0; j < 3; j++) {
      for(let i = this.infinity[j].pages.length - 1; i >= 0; i--) {
        while(this.infinity[j].pages[i].items.length > 0)
          this.infinity[j].pages[i].items.pop().remove();
        this.infinity[j].pages.pop();
      }
    }
  }
  get isGridView() {
    return this.data.get('is-grid-view') === 'true';
  }
  set isGridView(value) {
    this.data.set('is-grid-view', value);
    this.update(true);
  }
  get selecting() {
    for(let item of this.children("media-item")) {
      if (item.selected)
        return true;
    }
    return false;
  }
});
