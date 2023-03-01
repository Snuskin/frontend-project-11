/* eslint-disable no-case-declarations, no-use-before-define, no-unused-expressions */
/* eslint-disable no-param-reassign, max-len, no-console */
import uniqueId from 'lodash/uniqueId.js';
import differenceWith from 'lodash/differenceWith.js';
import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import getWatchState from './view.js';
import resources from './locales/index.js';
import parserXML from './parserXML.js';

const { ru } = resources;

const updateTimeout = 5000;

const app = () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  });
  const createFeedId = (id) => ({
    feedId: id,
    id: uniqueId(),
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
      dataState: 'start',
    },
    uiState: {
      clickedPostIDs: [],
    },
    modalWindowState: {
      postId: null,
    },
  };

  const watchState = getWatchState(elements, i18nextInstance, initialState);

  const validation = (field, urls) => {
    const schema = yup.string().trim().url().notOneOf(urls)
      .required();
    return schema.validate(field)
      .then(() => null)
      .catch((e) => e);
  };

  const makeProxyLink = (url) => {
    const proxy = new URL('/get', 'https://allorigins.hexlet.app');
    proxy.searchParams.set('url', url);
    proxy.searchParams.set('disableCache', true);
    return proxy;
  };

  const getRSS = (url) => {
    axios.get(makeProxyLink(url))
      .then((response) => {
        const data = parserXML(response.data.contents);
        data.feed.url = elements.input.value;
        const id = uniqueId();
        data.feed.id = id;
        const postsData = data.posts.map((post) => ({
          title: post.title,
          link: post.link,
          description: post.description,
          ...createFeedId(id),
        }));
        watchState.feeds.push(data.feed);
        watchState.posts.push(...postsData);
        watchState.form.dataState = 'valid';
        watchState.form.processState = 'filling';
      })
      .catch((e) => {
        watchState.form.processState = 'error';
        if (e.isAxiosError) {
          watchState.form.dataState = 'networkError';
        } else {
          watchState.form.dataState = 'noRss';
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
    const formData = new FormData(e.target).get('url').trim();
    watchState.form.processState = 'sending';
    validation(formData, watchState.feeds.map((feed) => feed.url)).then((error) => {
      if (error) {
        watchState.form.processState = 'error';
        if (error.type === 'notOneOf') {
          watchState.form.dataState = 'duplicate';
        } else {
          watchState.form.dataState = 'invalid';
        }
      } else {
        getRSS(formData);
      }
    });
  });

  const updateFeeds = () => {
    const urls = watchState.feeds.map((feed) => feed.url);
    const promises = urls.map((url) => axios.get(makeProxyLink(url)).then((response) => {
      const { data } = response;
      const newData = parserXML(data.contents);
      const changedFeed = watchState.feeds.find((feed) => feed.feedTitle === newData.feed.feedTitle);
      const { id } = changedFeed;
      const items = newData.posts;
      const newPosts = differenceWith(items, watchState.posts, (a, b) => a.link === b.link)
        .map((item) => ({
          ...createFeedId(id),
          title: item.title,
          link: item.link,
          description: item.description,
        }));
      watchState.posts.push(...newPosts);
    }).catch((e) => console.log(e)));
    Promise.all(promises).finally(setTimeout(() => updateFeeds(), updateTimeout));
  };
  updateFeeds();
};

export default app;
