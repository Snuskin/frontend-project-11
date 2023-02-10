/* eslint-disable no-case-declarations, no-use-before-define, no-unused-expressions */
/* eslint-disable no-param-reassign, max-len */
import uniqueId from 'lodash/uniqueId.js';
import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import render from './renders/view.js';
import resources from './locales/index.js';
import parserXML from './parsers/parserXML.js';

const { ru } = resources;

const app = () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  });

  const elements = {
    form: document.querySelector('.rss-form'),
    statusMassage: document.querySelector('.feedback'),
    input: document.querySelector('#url-input'),
    submitButton: document.querySelector('.btn-primary'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    modalContent: document.querySelector('.modal-content'),
  };

  const initialState = {
    form: {
      processState: 'filling',
      data: [],
      dataState: 'neutral',
    },
    postsData: {
      posts: [],
      feeds: [],
      newPosts: [],
    },
    modalWindowState: {
      postId: '',
    },
  };

  const watchedState = render(elements, i18nextInstance, initialState);

  const checkUpdates = (urls) => {
    prepareDataForUpdate(urls);
  };

  const prepareDataForUpdate = (urls) => {
    urls.forEach((url) => {
      axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
        .then((response) => {
          const { data } = response;
          const doc = new DOMParser().parseFromString(data, 'application/xml');
          const error = doc.querySelector('parsererror');
          if (!error) {
            const items = doc.querySelectorAll('item');
            const feedTitle = doc.querySelector('channel > title');
            const data1 = watchedState.postsData.feeds.find((feed) => feed.feedTitle === feedTitle.textContent);
            const { id } = data1;
            items.forEach((item) => {
              const title = item.querySelector('title').textContent;
              const link = item.querySelector('link').textContent;
              const description = item.querySelector('description').textContent;
              if (watchedState.postsData.posts.filter((post) => post.link === link).length === 0) {
                watchedState.postsData.newPosts.push({
                  feedId: id,
                  id: uniqueId(),
                  title,
                  link,
                  description,
                  clicked: false,
                });
              }
            });
          }
        });
    });
    setTimeout(() => checkUpdates(urls), 5000);
  };

  const domParser = (rssText) => {
    const data = parserXML(rssText);
    if (data === 'Error') {
      throw new Error('noRss');
    } else {
      watchedState.form.data.push(elements.input.value);
      elements.input.value = '';
      const id = uniqueId();
      data.feed.id = id;
      watchedState.postsData.feeds.push(data.feed);
      data.posts.forEach((post) => {
        post.feedId = id;
        post.id = uniqueId();
        watchedState.postsData.posts.push(post);
      });

      setTimeout(() => checkUpdates(watchedState.form.data), 5000);
    }
  };

  const getRSS = (url) => {
    axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
      .then((response) => domParser(response.data.contents))
      .catch((e) => {
        e.message === 'noRss' ? watchedState.form.dataState = 'noRss' : watchedState.form.dataState = 'networkError';
      });
  };

  elements.postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    watchedState.modalWindowState.postId = id;
  });

  const { form } = elements;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.processState = 'sending';
    const schema = yup.string().trim().url().notOneOf(watchedState.form.data)
      .required();

    const validation = (field) => {
      schema.validate(field)
        .then(() => {
          watchedState.form.dataState = 'valid';
          watchedState.form.processState = 'sent';
          getRSS(field);
        })
        .catch(() => {
          watchedState.form.dataState = 'duplicate';
          watchedState.form.processState = 'error';
          watchedState.form.dataState = 'invalid';
        });
    };
    validation(elements.input.value);
  });
};

export default app;
