Stimulus.Controller.prototype.getController = function (el, identifier) {
  return this.application.getControllerForElementAndIdentifier(el, identifier);
}
Stimulus.Controller.prototype.parent = function (identifier) {
  const el = this.element.closest(`[data-controller="${identifier}"]`);
  return this.application.getControllerForElementAndIdentifier(el, identifier);
}
Stimulus.Controller.prototype.child = function (identifier) {
  const el = this.element.querySelector(`[data-controller="${identifier}"]`);
  return this.application.getControllerForElementAndIdentifier(el, identifier);
}
Stimulus.Controller.prototype.children = function (identifier) {
  const children = Array.from(this.element.querySelectorAll(`[data-controller="${identifier}"]`));
  return children.map(el => this.application.getControllerForElementAndIdentifier(el, identifier));
}
Stimulus.Controller.prototype.debounce = function (code, dt, callback) {
  this.__debounces = this.__debounces || {};

  if (this.__debounces[code])
    clearTimeout(this.__debounces[code]);

  this.__debounces[code] = setTimeout(callback, dt);
}
Stimulus.Controller.prototype.throttle = function (code, dt, callback) {
  this.__throttles = this.__throttles || {};

  if (!this.__throttles[code]) {
    this.__throttles[code] = setTimeout(() => {
      callback();
      this.__throttles[code] = null;
    }, dt);
  }
}