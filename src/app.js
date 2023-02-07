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

  const schema = yup.object({
    link: yup.string().trim()
      .url()
      .required(),
  });

  const validation = (field) => {
    schema.validate({ link: field }, { abortEarly: true })
      .then(() => {
        initialState.form.data.push(field);
        watchedState.form.dataState = 'valid';
        watchedState.form.processState = 'sent';
        getRSS(field);
      })
      .catch(() => {
        watchedState.form.processState = 'error';
        watchedState.form.dataState = 'invalid';
      });
  };

  const checkUpdates = (urls) => {
    prepareDataForUpdate(urls);
  };

  const prepareDataForUpdate = (urls) => {
    urls.forEach((url) => {
      axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
        .then((response) => {
          const { data } = response;
          const doc = parserXML(data.contents);
          const error = doc.querySelector('parsererror');
          if (!error) {
            const items = doc.querySelectorAll('item');
            const feedTitle = doc.querySelector('channel > title');
            const data1 = initialState.postsData.feeds.find((feed) => feed.feedTitle === feedTitle.textContent);
            const { id } = data1;
            items.forEach((item) => {
              const title = item.querySelector('title').textContent;
              const link = item.querySelector('link').textContent;
              const description = item.querySelector('description').textContent;
              if (initialState.postsData.posts.filter((post) => post.link === link).length === 0) {
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

  const watchedState = render(elements, i18nextInstance, initialState);

  const buildTree = (doc) => {
    const feedsTitle = doc.querySelector('channel > title');
    const feedsSubtitle = doc.querySelector('channel > description');
    const items = doc.querySelectorAll('item');
    const id = uniqueId();
    items.forEach((item) => {
      const title = item.querySelector('title').textContent;
      const link = item.querySelector('link').textContent;
      const description = item.querySelector('description').textContent;
      if (!title || !link || !description) {
        return;
      }
      watchedState.postsData.posts.push({
        feedId: id,
        id: uniqueId(),
        title,
        link,
        description,
        clicked: false,
      });
    });
    if (initialState.postsData.feeds.filter((feed) => feed.feedTitle === feedsTitle.textContent).length === 0) {
      watchedState.postsData.feeds.push({ id, feedTitle: feedsTitle.textContent, feedSubtitle: feedsSubtitle.textContent });
    }
    setTimeout(() => checkUpdates(initialState.form.data), 5000);
  };

  const domParser = (rssText) => {
    watchedState.form.data.push(elements.input.value);
    const doc = parserXML(rssText);
    const error = doc.querySelector('parsererror');
    if (!error) {
      buildTree(doc);
    } else {
      watchedState.form.dataState = 'noRss';
    }
  };

  const getRSS = (url) => {
    axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
      .catch(() => { watchedState.form.dataState = 'networkError'; })
      .then((response) => domParser(response.data.contents))
      .catch(() => { watchedState.form.dataState = 'noRss'; });
  };

  elements.postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    watchedState.modalWindowState.postId = id;
  });

  const { form } = elements;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.processState = 'sending';

    if (initialState.form.data.includes(elements.input.value)) {
      watchedState.form.dataState = 'duplicate';
      watchedState.form.processState = 'error';
    } else {
      validation(elements.input.value);
    }
  });
};

export default app;
