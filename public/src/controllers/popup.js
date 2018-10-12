Meeemories.register("popup", class extends Stimulus.Controller {
  static get targets() {
    return ['image']
  }
  initialize() {
    this.imageTarget.addEventListener('load', () => {
      this.loaded = true;
    })
    this.imageTarget.srcset = this.srcset;
    this.imageTarget.src = this.src;
    window.history.pushState({detail:'show'}, null, '#show');
    this.application.stopScroll();
  }
  close() {
    this.remove();
    window.history.go(-1);
    this.application.startScroll();
  }
  remove() {
    this.element.remove();
  }
  update() {
    this.element.classList.toggle('popup--loaded', this.loaded);
  }
  get src() {
    return this.data.get('src');
  }
  get srcset() {
    return this.data.get('srcset');
  }
  get loaded() {
    return this.data.get('loaded') === 'true';
  }
  set loaded(value) {
    this.data.set('loaded',value);
    this.update();
  }
});