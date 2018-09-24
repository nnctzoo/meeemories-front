window.Meeemories = Stimulus.Application.start();
(function (app) {
  class State {
    constructor() {
      this._state = {};
      this._callbacks = [];
    }
    patch(state) {
      const current = this._state;
      const next = Object.assign({}, this._state, state || {});
      this._state = next;
      for (let key of Object.keys(next)) {
        if (next[key] !== current[key]) {
          this.dispatch(key, next[key], current[key]);
        }
      }
    }
    diff(key, d) {
      const state = {}
      state[key] = (this.get(key) || 0) + d;
      this.patch(state);
    }
    increment(key) {
      this.diff(key, 1);
    }
    decrement(key) {
      this.diff(key, -1);
    }
    dispatch(key, newVal, oldVal) {
      this._callbacks.filter(_ => _.key === key).forEach(_ => _.callback(newVal, oldVal));
    }
    subscribe(key, callback) {
      this._callbacks.push({ key, callback });
    }
    get(key) {
      return this._state[key];
    }
  }
  app.state = new State();
  if (window.navigator && window.navigator.userAgent) {
    app.state.patch({ios: this.navigator.userAgent.indexOf('iPhone') > 0 || this.navigator.userAgent.indexOf('iPad') > 0 });
    app.state.patch({android: this.navigator.userAgent.indexOf('Android') > 0});
  }
}(window.Meeemories))
