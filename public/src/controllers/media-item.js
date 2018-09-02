Meeemories.register("media-item", class extends Stimulus.Controller {
  static get targets() {
    return []
  }
  show() {
    alert("show!!!")
  }
  select() {
    this.selected = !this.selected;
  }
  onClick() {
    if (this.parent("app").selecting)
      this.select();

    else
      this.show();
  }
  update() {
    this.element.classList.toggle("media-item--selected", this.selected);
  }
  get selected() {
    return this.data.get("selected") === 'true';
  }
  set selected(value) {
    this.data.set("selected", value);
    this.update();
  }
});
