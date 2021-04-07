const host = 'https://37.46.133.40:5000/api';

const app = new Vue({
  el: '#app',
  data: {
    page: 'index',
    toasts: [],
    posts: [],
    registerForm: {
      name: null,
      login: null,
      password: null
    },
    loginForm: {
      login: null,
      password: null
    },
    user: null,
    postForm: {
      name: null,
      text: null,
      image: null
    }
  },
  mounted() {
    this.loadLocalData();
    this.getAllPosts();
  },
  methods: {
    openPage(pageName) {
      this.page = pageName;
    },
    showToast(text, classes, duration = 2000) {
      const toast = {text, classes, id: Math.random()};

      this.toasts.push(toast);

      setTimeout(() => {
        this.toasts.splice(this.toasts.indexOf(toast), 1);
      }, duration);
    },
    async fetchAllPosts() {
      const response = await fetch(host + '/post');
      return await response.json();
    },
    async getAllPosts() {
      this.posts = await this.fetchAllPosts();
    },
    register() {
      fetch(host + '/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.registerForm)
      })
          .then(res => {
            if (res.status === 201) {
              this.showToast('Вы успешно зарегистрировались', ['alert-success']);
              this.openPage('login');
            }
            else
              this.showToast('Что-то пошло не так', ['alert-danger']);
          })
    },
    login() {
      fetch(host + '/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.loginForm)
      })
          .then(res => {
            if (res.status === 200)
              this.showToast('Вы вошли', ['alert-success']);
            else
              this.showToast('Не верный логин или пароль', ['alert-danger']);

            return res.json();
          })
          .then(data => {
            this.user = data;
            this.saveLocalData();
            this.openPage('profile');
          })
    },
    logout() {
      this.user = null;
      localStorage.removeItem('user');
    },
    saveLocalData() {
      localStorage.setItem('user', JSON.stringify(this.user));
    },
    loadLocalData() {
      this.user = JSON.parse(localStorage.getItem('user'));
    },
    fileSelected() {
      if(event.target.files.length)
        this.postForm.image = event.target.files[0];
    },
    createPost() {
      let formData = new FormData();
      formData.append('name', this.postForm.name);
      formData.append('text', this.postForm.text);
      formData.append('image', this.postForm.image);

      fetch(host + '/post', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.user.token}`
        },
        body: formData
      })
          .then(res => {
            if(res.status === 201) {
              this.showToast('Поздравляем! Пост успешно опубликован!', ['alert-success']);
              this.getAllPosts();
              this.openPage('profile');
            }
          })
    }
  }
});
