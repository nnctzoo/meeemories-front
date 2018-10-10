Meeemories.register("uploading-item", class extends Stimulus.Controller {
  static get targets() {
    return ['thumb', 'progress']
  }
  initialize() {
    this.initialized();
  }
  start(file) {
    this.setThumb(new File([file], 'thumbnail'));
    this.upload(file).then(data => {
      this.selfLink = "";
      this.watch();
    }).catch(() => {
      alert('アップロードに失敗しました。');
      this.element.remove();
    });
  }
  setThumb(file) {
    if (file.type.match('image')) {
      this.thumbTarget.style.backgroundImage = `url('${URL.createObjectURL(file)}')`;
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
          this.thumbTarget.style.backgroundImage = `url('${url}')`;
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
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = e => {
        if(e.lengthComputable) {
          this.progress = ~~((e.loaded / e.total) * 100);
        }
      }
      xhr.upload.onload = () => {
        this.progress = 100;
        resolve(JSON.parse(xhr.responseText));
      }
      xhr.upload.onerror = () => {
        reject();
      }
      xhr.upload.ontimeout = () => {
        reject();
      }
      xhr.open('POST', 'https://api.meeemori.es/contents');
      xhr.withCredentials = true;
      xhr.send(file);
    });
  }
  watch() {
    
    // ここでサーバーにステータスを問い合わせる
    // fetch(this.selfLink).then(res => res.json);
    const status = this.status;
    
    // これはダミーコード
    switch(this.status) {
      case 'uploading' : this.status = 'uploaded'; break;
      case 'uploaded' : this.status = 'converting'; break;
      case 'converting' : this.status = 'succeeded'; break;
      case 'succeeded' : this.status = 'succeeded'; break;
      default: this.status = 'none';
    }

    if (this.status == 'succeeded') {
      // setTimeout(() => { this.remove(); }, 3000);
    }
    else {
      setTimeout(() => { this.watch(); }, 3000);
    }
  }
  remove() {
    this.element.remove();
    // Meeemories.state.decrement('uploading-item');
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
