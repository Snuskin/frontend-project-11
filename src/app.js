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
  const view = render(elements, i18nextInstance, initialState);

  const validation = (field, urls) => {
    const schema = yup.string().trim().url().notOneOf(urls)
      .required();
    schema.validate(field)
      .then(() => {
        getRSS(field);
      })
      .catch((e) => {
        view.form.processState = 'error';
        if (e.type === 'notOneOf') {
          view.form.dataState = 'duplicate';
        } else {
          view.form.dataState = 'invalid';
        }
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
          const doc = new DOMParser().parseFromString(data, 'application/xml');
          const error = doc.querySelector('parsererror');
          if (!error) {
            const items = doc.querySelectorAll('item');
            const feedTitle = doc.querySelector('channel > title');
            const data1 = view.postsData.feeds.find((feed) => feed.feedTitle === feedTitle.textContent);
            const { id } = data1;
            items.forEach((item) => {
              const title = item.querySelector('title').textContent;
              const link = item.querySelector('link').textContent;
              const description = item.querySelector('description').textContent;
              if (view.postsData.posts.filter((post) => post.link === link).length === 0) {
                view.postsData.newPosts.push({
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
      view.form.dataState = 'valid';

      view.form.data.push(elements.input.value);
      elements.input.value = '';
      const id = uniqueId();
      data.feed.id = id;
      view.postsData.feeds.push(data.feed);
      data.posts.forEach((post) => {
        post.feedId = id;
        post.id = uniqueId();
        view.postsData.posts.push(post);
      });

      setTimeout(() => checkUpdates(view.form.data), 5000);
    }
  };

  const getRSS = (url) => {
    axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
      .then((response) => {
        view.form.processState = 'sent';
        domParser(response.data.contents);
      })
      .catch((e) => {
        view.form.processState = 'sent';
        e.message === 'noRss' ? view.form.dataState = 'noRss' : view.form.dataState = 'networkError';
      });
  };

  elements.postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    view.modalWindowState.postId = id;
  });

  const { form } = elements;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    view.form.processState = 'sending';

    validation(elements.input.value, view.form.data);
  });
};

export default app;
