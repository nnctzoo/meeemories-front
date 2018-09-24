Meeemories.register("logo", class extends Stimulus.Controller {
    static get targets() {
      return []
    }
    initialize() {
      this.application.state.subscribe('scroll', bottom => {
        this.hidden = (bottom - window.innerHeight) > 10;
      });
    }
    update() {
      this.element.classList.toggle("logo--hidden", this.hidden);
    }
    get hidden() {
      return this.data.get('hidden') === 'true';
    }
    set hidden(value) {
      this.data.set('hidden', value);
      this.update();
    }
  });
  