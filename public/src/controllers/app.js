Meeemories.register("app", class extends Stimulus.Controller {
  static get targets() {
    return ['main', 'list', 'mines', 'file']
  }
  initialize() {
    this.listTarget.addEventListener('next', e => {
      this.tryLoad(e.detail);
    });
    this.__preload = new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.width = 0;
      iframe.height = 0;
      iframe.frameBorder = 0;
      iframe.src = 'https://api.meeemori.es/contents';
      iframe.onload = () => {
        resolve();
      }
      document.body.appendChild(iframe)
    });
    this.tryLoad();

    setTimeout(() => {
      this.isGridView = localStorage.getItem('view') === 'grid';
    }, 0);
   
    this.application.state.subscribe('selecting', () => this.update());
    this.update();
    window.addEventListener('popstate', e => {
      if (!e.state) {
        const popup = this.find('popup');
        if (popup) {
          popup.remove();
          this.application.startScroll();
        }
      }
    })
    
    window.addEventListener('scroll', () => this.dispatchState());
    this.dispatchState();

    const hashquery = window.location.hash || '';
    const question = hashquery.indexOf('?');
    const hash = question > 0 ? hashquery.substring(0, question) : hashquery;
    this.application.state.subscribe('page', (page, old) => {
      if (page != old) {
        this.move(page)
        window.history.replaceState(null,null,page);
      }
    });
    this.application.state.patch({page: hash});

    const myupload = JSON.parse(localStorage.getItem('myupload')||'[]');
    this.application.state.patch({myupload:myupload});
    this.application.state.subscribe('myupload',list => {
      const json = JSON.stringify(list);
      localStorage.setItem('myupload', json);
    })
    for(let mine of myupload) {
      const template = document.querySelector('#uploading-tmpl').content;
      const fragment = template.cloneNode(true);
      fragment.firstElementChild.addEventListener('initialized', e => {
        const item = this.getController(e.target, 'uploading-item');
        item.selfLink = mine.url;
        if(hash==='#mypage') {
          item.watch();
        }
      });
      this.minesTarget.appendChild(fragment);
    }
    this.application.state.subscribe('uploading-item', count => {
      this.emptyMyupload = count === 0;
    });
    this.emptyMyupload = myupload.length === 0;
  }
  dispatchState() {
    this.application.state.patch({scroll: window.scrollY + window.innerHeight});
  }
  tryLoad(url) {
    if (!this.isLoading) {
      this.throttle('fetch',3000, () => {
        this.isLoading = true;
        const finalize = () => {this.isLoading = false;};
        this.load(url).then(finalize, finalize);
      })
    }
  }
  load (startIndex) {
    const url = !startIndex ? 'https://api.meeemori.es/contents' : 'https://api.meeemori.es/contents?before=' + startIndex;
    return this.__preload.then(() => 
    fetch(url,{ mode:'cors', credentials: 'include' }).then(res => {
      if (res.ok)
        return res.json();
    }, () => {
      alert('通信エラーが発生しました。\nネットワークをご確認の上、再度お試しください。')
    })
    .then(data => {
      if (!data) return;
      return data.contents.map(d => {
        const pc = this.application.state.get('pc');
        const sources = d.sources.sort((a, b) => a.width > b.width ? 1 : a.width < b.width ? -1 : 0);
        const raw = sources[sources.length - 1];
        if (sources.some(s => s.mime_type.startsWith('video'))) {
          const images = sources.filter(s => s.mime_type.startsWith('image'));
          const video = sources.filter(s => s.mime_type.startsWith('video'))[0];
          const mosic = images.shift();
          const thumbnail = pc? sources.filter((_,i) => i < 3) : sources.filter((_,i) => i < 2);
          return {
            id: d.id,
            type: 'video',
            aspect: raw.height / raw.width,
            tiny: mosic.url,
            thumbnail: {
              src: images[0].url,
              srcset: thumbnail.map(t => t.url + ' '+ t.width + 'w').join(','),
              sizes: '(max-width: 320px) and (-webkit-min-device-pixel-ratio: 1) 200px, (max-width: 320px) and (-webkit-min-device-pixel-ratio: 2) 400px, (max-width: 768px) and (-webkit-min-device-pixel-ratio: 1) 400px, 800px'
            },
            large:{
              src: video.url
            }
          }
        }
        else {
          const mosic = sources.shift();
          const thumbnail = pc? sources.filter((_,i) => i < 3) : sources.filter((_,i) => i < 2);
          const large = sources.reverse().filter((_,i) => i < 2).reverse();
          return {
            id: d.id,
            type: 'image',
            aspect: raw.height / raw.width,
            download: null,
            tiny: mosic.url,
            thumbnail: {
              src: thumbnail[0].url,
              srcset: thumbnail.map(t => t.url + ' '+ t.width + 'w').join(','),
              sizes: '(max-width: 320px) and (-webkit-min-device-pixel-ratio: 1) 200px, (max-width: 320px) and (-webkit-min-device-pixel-ratio: 2) 400px, (max-width: 768px) and (-webkit-min-device-pixel-ratio: 1) 400px, 800px'
            },
            large: {
              src: large[0].url,
              srcset: large.map(t => t.url + ' '+ t.width + 'w').join(',')
            }
          }
        }
      });
    })
    .then((data) => {
      this.list.replace(data);
      if(data.length > 0) {
        this.list.nextLink = (data[data.length - 1].id);
      }
    })
    )
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
      this.element.classList.toggle('app--empty-myupload', this.emptyMyupload);
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
    if (page === '#home') {
      this.tryLoad();
    }
    if (page === '#mypage') {
      for(const item of this.children('uploading-item')) {
        if (item)
          item.watch();
      }
    }
  }
  go(e) {
    const hash = e.target.closest('.actions__item').dataset.to;
    this.application.state.patch({page: hash});
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
    this.application.state.patch({page: '#mypage'});
  }
  download() {
    const selecteds = Array.from(document.querySelectorAll('.media-item--selected')).map(el => el.dataset.id);
    const body = "【希望画像ID】%0D%0A" + selecteds.map(_ => "・" + _).join('%0D%0A');
    const html = $('#download-tmpl').render({body:body});
    document.body.insertAdjacentHTML('beforeend', html);
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
    localStorage.setItem('view', value ? 'grid' : 'list');
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
  get emptyMyupload() {
    return this.data.get('empty-myupload') === 'true';
  }
  set emptyMyupload(value) {
    this.data.set('empty-myupload', value)
    this.update();
  }
});