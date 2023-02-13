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
    submitButton: document.querySelector('.btn-primary'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    modalContent: document.querySelector('.modal-content'),
  };

  const initialState = {
    form: {
      processState: 'filling',
      dataState: 'neutral',
    },
    postsData: {
      posts: [],
      feeds: [],
      clickedPosts: [],
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

  const checkUpdates = (url) => {
    prepareDataForUpdate(url);
  };

  const prepareDataForUpdate = (url) => {
      axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
        .then((response) => {
          const { data } = response;
          const newData = parserXML(data.contents);
          if(newData !== 'Error') {
            const changedFeed = watchState.postsData.feeds.find((feed) => feed.feedTitle === newData.feed.feedTitle);
            const { id } = changedFeed;
            const items = newData.posts; 
            const newPosts = differenceWith( items, watchState.postsData.posts.map(post => post), (a,b) => a.link === b.link);
            newPosts.forEach((item) => {
                watchState.postsData.posts.push({
                  feedId: id,
                  id: uniqueId(),
                  title: item.title,
                  link: item.link,
                  description: item.description,
                });
            });
          }
        }
        )
        .then(setTimeout(() => checkUpdates(url), 5000))
  };

  const domParser = (rssText) => {
    const data = parserXML(rssText);
    if (data === 'Error') {
      throw new Error('noRss');
    } else {
      watchState.form.dataState = 'valid';
      data.feed.url = elements.input.value;
      elements.input.value = '';
      const id = uniqueId();
      data.feed.id = id;
      watchState.postsData.feeds.push(data.feed);
      data.posts.forEach((post) => {
        post.feedId = id;
        post.id = uniqueId();
        watchState.postsData.posts.push(post);
      });
      setTimeout(() => checkUpdates(data.feed.url), 5000);
    }
  };

  const getRSS = (url) => {
    axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
      .then((response) => {
        watchState.form.processState = 'sent';
        domParser(response.data.contents);
      })
      .catch((e) => {
        watchState.form.processState = 'sent';
        e.message === 'noRss' ? watchState.form.dataState = 'noRss' : watchState.form.dataState = 'networkError';
      });
  };

  elements.postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    watchState.modalWindowState.postId = id;
    watchState.postsData.clickedPosts.push(id);
  });

  const { form } = elements;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchState.form.processState = 'sending';
    validation(elements.input.value, watchState.postsData.feeds.map(feed => feed.url));
  });
};

export default app;
