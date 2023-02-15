/* eslint-disable no-case-declarations, no-use-before-define, no-unused-expressions */
/* eslint-disable no-param-reassign, max-len */
import uniqueId from 'lodash/uniqueId.js';
import differenceWith from 'lodash/differenceWith.js';
import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import getWatchState from './view.js';
import resources from './locales/index.js';
import parserXML from './parserXML.js';

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
    submitButton: document.querySelector('button[type="submit"]'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    modalContent: document.querySelector('.modal-content'),
  };

  const initialState = {
    posts: [],
    feeds: [],
    form: {
      processState: 'filling',
      dataState: 'neutral',
    },
    uiState: {
      clickedPostIDs: [],
    },
    modalWindowState: {
      postId: '',
    },
  };
  const watchState = getWatchState(elements, i18nextInstance, initialState);

  const validation = (field, urls) => {
    const schema = yup.string().trim().url().notOneOf(urls)
      .required();
    schema.validate(field)
      .then(() => {
        getRSS(field);
      })
      .catch((e) => {
        watchState.form.processState = 'error';
        if (e.type === 'notOneOf') {
          watchState.form.dataState = 'duplicate';
        } else {
          watchState.form.dataState = 'invalid';
        }
      });
  };
  const makeProxyLink = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;

  const prepareDataForUpdate = (url) => {
    axios.get(makeProxyLink(url))
      .then((response) => {
        const { data } = response;
        const newData = parserXML(data.contents);
        if (newData !== 'Error') {
          const changedFeed = watchState.feeds.find((feed) => feed.feedTitle === newData.feed.feedTitle);
          const { id } = changedFeed;
          const items = newData.posts;
          const newPosts = differenceWith(items, watchState.posts.map((post) => post), (a, b) => a.link === b.link);
          newPosts.forEach((item) => {
            watchState.posts.push({
              feedId: id,
              id: uniqueId(),
              title: item.title,
              link: item.link,
              description: item.description,
            });
          });
        }
      })
      .finally(setTimeout(() => prepareDataForUpdate(url), 5000));
  };

  const getRSS = (url) => {
    axios.get(makeProxyLink(url))
      .then((response) => {
        watchState.form.processState = 'sent';
        const data = parserXML(response.data.contents);
        if (data !== 'Error') {
          watchState.form.dataState = 'valid';
          data.feed.url = elements.input.value;
          elements.input.value = '';
          const id = uniqueId();
          data.feed.id = id;
          watchState.feeds.push(data.feed);
          data.posts.forEach((post) => {
            post.feedId = id;
            post.id = uniqueId();
            watchState.posts.push(post);
          });
          setTimeout(() => prepareDataForUpdate(data.feed.url), 5000);
        }
        throw new Error('noRss');
      })
      .catch((e) => {
        watchState.form.processState = 'sent';
        if (e.isAxiosError) {
          watchState.form.dataState = 'networkError';
        }
      });
  };

  elements.postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    watchState.modalWindowState.postId = id;
    watchState.uiState.clickedPostIDs.push(id);
  });

  const { form } = elements;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchState.form.processState = 'sending';
    validation(elements.input.value, watchState.feeds.map((feed) => feed.url));
  });
};

export default app;
