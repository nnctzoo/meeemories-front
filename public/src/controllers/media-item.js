Meeemories.register("media-item", class extends Stimulus.Controller {
  static get targets() {
    return ['thumb', 'template']
  }
  initialize() {
    this.application.state.subscribe('scroll', pos => {
      this.tryVisualize(pos);
    });
    this.application.state.subscribe('is-grid-view', isGridView => {
      if (isGridView) setTimeout(() => {
        this.tryVisualize(this.application.state.get('scroll'));
      }, 300)
    });
    this.tryVisualize(this.application.state.get('scroll'));

    this.thumbTarget.addEventListener('load', () => {
      //this.animation();
      this.loaded = true;
    });
  }
  tryVisualize(pos) {
    const viewportTop = pos - window.innerHeight;
    const viewportBottom = pos;
    const mediaTop = this.element.offsetTop;
    const mediaBottom = mediaTop + this.element.offsetHeight;

    if (mediaTop <= viewportBottom 
     // && mediaBottom >= viewportTop
    ) {
      this.visibled = true;
      if (!this.thumbTarget.srcset && !this.thumbTarget.src) {
        this.thumbTarget.srcset = this.srcset;
        this.thumbTarget.sizes = this.sizes;
        this.thumbTarget.src = this.src;
      }
    }
    // else {
    //   this.visibled = false;
    //   if (this.thumbTarget.hasAttribute('src')) {
    //     this.thumbTarget.removeAttribute('src');
    //     this.thumbTarget.removeAttribute('sizes');
    //     this.thumbTarget.removeAttribute('srcset');
    //   }
    // }
  }
  animation() {
    const size = Math.max(this.element.clientWidth, this.element.clientHeight) * 3;
    let start = null;
    this.animating = true;
    const step = timestamp => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const maskSize = Math.exp(progress / 100);
      if (maskSize < size) {
        this.thumbTarget.style.webkitMaskSize = maskSize + 'px';
        this.thumbTarget.style.maskSize = maskSize + 'px';
        window.requestAnimationFrame(step);
      } 
      else {
        this.animating = false;
      }
    }
    window.requestAnimationFrame(step);
  }
  show() {
    const clone = this.templateTarget.content.cloneNode(true);
    document.body.appendChild(clone);
  }
  select() {
    this.selected = !this.selected;
    this.application.state.diff('selecting', this.selected ? 1 : -1);
  }
  onClick() {
    if (this.application.state.get('selecting'))
      this.select();

    else
      this.show();
  }
  update() {
    this.element.classList.toggle("media-item--selected", this.selected);
    this.element.classList.toggle("media-item--visibled", this.visibled);
    this.element.classList.toggle("media-item--animating", this.animating);
    this.element.classList.toggle("media-item--loaded", this.loaded);
  }
  get selected() {
    return this.data.get("selected") === 'true';
  }
  set selected(value) {
    this.data.set("selected", value);
    this.update();
  }
  get loaded() {
    return this.data.get("loaded") === 'true';
  }
  set loaded(value) {
    this.data.set("loaded", value);
    this.update();
  }
  get visibled() {
    return this.data.get('visibled') === 'true';
  }
  set visibled(value) {
    this.data.set('visibled', value);
    this.update();
  }
  get animating() {
    return this.data.get("animating") === 'true';
  }
  set animating(value) {
    this.data.set("animating", value);
    this.update();
  }
  get src() {
    return this.data.get('src');
  }
  get srcset() {
    return this.data.get('srcset');
  }
  get sizes() {
    return this.data.get('sizes');
  }
  get download() {
    return this.data.get('download');
  }
});
