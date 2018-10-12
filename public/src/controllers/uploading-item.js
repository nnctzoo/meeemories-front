Meeemories.register("uploading-item", class extends Stimulus.Controller {
  static get targets() {
    return ['thumb', 'progress']
  }
  initialize() {
    this.initialized();
    this.application.state.increment('uploading-item');
  }
  start(file) {
    this.setThumb(new File([file], file.name, {type:file.type}));
    this.upload(file).then(data => {
      this.status = 'uploaded';
      this.selfLink = data.detail;
      this.watch();
      const list = this.application.state.get('myupload') || [];
      this.application.state.patch({myupload:[{url: data.detail}].concat(list)});
    }).catch(() => {
      alert('アップロードに失敗しました。');
      this.element.remove();
    });
  }
  
  setThumb(file) {
    if (file.type.match('image')) {
      this.setThumbUrl(URL.createObjectURL(file));
    }
    else if (file.type.match('video')) {
      const video = document.createElement('video');
      const snap = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        var url = canvas.toDataURL();
        var success = url.length > 1000;
        if (success) {
          this.setThumbUrl(url);
        }
        return success;
      }
      function loadeddata() {
        if (snap()) {
          video.removeEventListener('timeupdate', timeupdate);
        }
      }
      function timeupdate() {
        if (snap()) {
          video.removeEventListener('timeupdate', timeupdate);
          video.pause();
        }
      }
      video.addEventListener('timeupdate', timeupdate);
      video.addEventListener('loadeddata', loadeddata);
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.playsInline = true;
      video.play();
    }
    else {
      // other;
    }
  }
  upload(file) {
    this.status = 'uploading';
    const form = new FormData();
    form.append('file', file);
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = e => {
        if(e.lengthComputable) {
          this.progress = ~~((e.loaded / e.total) * 100);
        }
      }
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 201) {
            this.progress = 100;
            resolve(JSON.parse(xhr.responseText));
          }
          else {
            reject();
          }
        }
      }
      xhr.upload.onerror = () => {
        reject();
      }
      xhr.upload.ontimeout = () => {
        reject();
      }
      
      xhr.open('POST', 'https://api.meeemori.es/contents');
      // xhr.withCredentials = true;
      xhr.send(form);
    });
  }
  removeFromStore() {
    const list = this.application.state.get('myupload') || [];
    const removed = list.filter(item => item.url !== this.selfLink)
    this.application.state.patch({myupload:removed});
  }
  watch() {
    fetch('https://api.meeemori.es' + this.selfLink).then(res => res.json(), _ => {
      this.removeFromStore();
    }).then(data => {
      console.log(data);
      if (data.pending && !data.available) {
        this.status = 'converting';
      }
      else if (!data.pending && data.available) {
        this.status = 'succeeded'
        const sources = data.sources.filter(s => s.mime_type.startsWith('image')).sort((a, b) => a.width > b.width ? 1 : a.width < b.width ? -1 : 0);
        const url = sources.length >= 2 ? sources[sources.length - 2].url : sources.length > 0 ? sources[sources.length - 1].url : null;
        if (url) {
          fetch(url).then(res => {if(res.ok) return res.blob()}).then(blob => this.setThumbUrl(URL.createObjectURL(blob)))
        }
      }
      else if (!data.pending && !data.available) {
        this.status = 'faild';
      }
      if (this.status !== 'succeeded' && this.status !== 'faild') {
        setTimeout(() => { this.watch(); }, 3000);
      }
    });
  }
  remove() {
    this.removeFromStore();
    this.element.remove();
    this.application.state.decrement('uploading-item');
  }
  update() {
    const status = this.status;
    this.element.classList.toggle("uploading-item--uploading", status === 'uploading');
    this.element.classList.toggle("uploading-item--uploaded", status === 'uploaded');
    this.element.classList.toggle("uploading-item--converting", status === 'converting');
    this.element.classList.toggle("uploading-item--succeeded", status === 'succeeded');
    this.element.classList.toggle("uploading-item--faild", status === 'faild');
    this.progressTarget.style.width = this.progress + '%';
  }
  setThumbUrl(url) {
    this.thumbTarget.style.backgroundImage = "url('" + url +"')";
  }
  get selfLink() {
    return this.data.get('self-link');
  }
  set selfLink(value) {
    this.data.set('self-link', value);
  }
  get status() {
    return this.data.get("status") || 'none';
  }
  set status(value) {
    this.data.set("status", value);
    this.update();
  }
  get progress() {
    return this.__progress || 0;
  }
  set progress(value) {
    this.__progress = value;
    this.update();
  }
});
