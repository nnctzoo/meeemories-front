Meeemories.register("app", class extends Stimulus.Controller {
  static get targets() {
    return ['main', 'list', 'mines', 'file']
  }
  initialize() {
    this.listTarget.addEventListener('next', e => {
      this.tryLoad(e.detail);
    });
    this.tryLoad(151);
   
    this.application.state.subscribe('selecting', () => this.update());
    this.update();

    window.addEventListener('popstate', e => {
      if (!e.state) {
        const popup = this.find('popup');
        if (popup)
          popup.remove();
      }
    })
    
    window.addEventListener('scroll', () => this.dispatchState());
    this.dispatchState();

    const hashquery = window.location.hash || '';
    const question = hashquery.indexOf('?');
    const hash = question > 0 ? hashquery.substring(0, question) : hashquery;
    this.application.state.subscribe('page', page => this.move(page));
    this.application.state.patch({page: hash});
  }
  dispatchState() {
    this.application.state.patch({scroll: window.scrollY + window.innerHeight});
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
    return fetch('https://api.meeemori.es/contents',{ mode:'cors' }).then(res => {
      if (res.ok)
        return res.json();
      else
        alert('エラーが発生しました。再度お試しください。')
    }, () => {
      alert('通信エラーが発生しました。\nネットワークをご確認の上、再度お試しください。')
    })
    .then(data => {
      return data.contents.map(d => {
        const sources = d.sources.sort((a, b) => a.width > b.width ? 1 : a.width < b.width ? -1 : 0);
        return {
          id: d.id,
          aspect: sources[3].height / sources[3].width,
          download: null,
          tiny: sources[0].url,
          thumbnail: {
            src: sources[1].url,
            srcset: sources[1].url + ' ' + sources[1].width + 'w, ' + sources[2].url + ' ' + sources[2].width + 'w' + (this.application.state.get('pc') ? (', ' + sources[3].url + ' ' + sources[3].width + 'w') : ''),
            sizes: '(max-width: 320px) and (-webkit-min-device-pixel-ratio: 1) 200px, (max-width: 320px) and (-webkit-min-device-pixel-ratio: 2) 400px, (max-width: 768px) and (-webkit-min-device-pixel-ratio: 1) 400px, 800px'
          },
          large: {
            src: sources[2].url,
            srcset: sources[2].url + ' ' + sources[2].width + 'w, ' + sources[3].url + ' ' + sources[3].width + 'w'
          }
        }
      });
    })
    .then((data) => {
      this.list.append(data);
      this.list.nextLink = data.pop().id + 1;
    })
  }
  toggleView() {
    this.isGridView = !this.isGridView;
    window.scrollTo(0,0);
  }
  update() {
    this.debounce('upload', 50, () => {
      this.element.classList.toggle('app--grid-view', this.isGridView);
      this.element.classList.toggle('app--loading', this.isLoading);
      this.element.classList.toggle('app--selecting', this.isSelecting);
    });
  }
  move(page) {
    const target = page ? document.querySelector(page) || document.querySelector('.page') : document.querySelector('.page');
    if (!target.classList.contains('page--active')) {
      document.querySelector('.page--active').classList.remove('page--active');
      document.querySelector('.icon--active').classList.remove('icon--active');
      target.classList.add('page--active');
      document.querySelector('[data-to="' + page + '"] .icon').classList.add('icon--active');
    }
  }
  go(e) {
    const hash = e.target.closest('.actions__item').dataset.to;
    this.application.state.patch({page: hash});
    window.history.replaceState(null,null,hash);
    return false;
  }
  upload() {
    for(let file of Array.from(this.fileTarget.files)) {
      const template = document.querySelector('#uploading-tmpl').content;
      const fragment = template.cloneNode(true);
      fragment.firstElementChild.addEventListener('initialized', e => {
        this.getController(e.target, 'uploading-item').start(file);
      });
      this.minesTarget.insertBefore(fragment, this.minesTarget.firstElementChild);
    }
    this.fileTarget.value = '';
    this.move('#mypage');
  }
  download() {
    alert("Downloading...");
  }
  showMenu() {
    const template = document.querySelector('#menu-tmpl').content;
    const fragment = template.cloneNode(true);
    document.body.appendChild(fragment);
    
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