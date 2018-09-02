Stimulus.Controller.prototype.parent = function(identifier) {
  const el = this.element.closest(`[data-controller="${identifier}"]`);
  return this.application.getControllerForElementAndIdentifier(el, identifier);
}
Stimulus.Controller.prototype.children = function(identifier) {
  const children = Array.from(this.element.querySelectorAll(`[data-controller="${identifier}"]`));
  return children.map(el => this.application.getControllerForElementAndIdentifier(el, identifier));
}
