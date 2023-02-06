/* eslint-disable no-case-declarations, no-use-before-define, no-unused-expressions */
/* eslint-disable no-param-reassign, max-len */
import renderClickedLinks from './renders/renderClickedLinks.js';
import renderUpdates from './renders/renderUpdates.js';
import renderFeeds from './renders/renderFeeds.js';
import renderPosts from './renders/renderPosts.js';
import renderForm from './renders/renderForm.js';
import resources from './locales/index.js';
import uniqueId from 'lodash/uniqueId.js';
import onChange from 'on-change';
import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';

const {ru} = resources;
const i18nextInstance = i18next.createInstance();
i18nextInstance.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru,
  },
});

const schema = yup.object({
  link: yup.string().trim()
    .url()
    .required(),
});

const handleProcessState = (submitButton) => (path, processState) => {
  switch (processState) {
    case 'sent':
      submitButton.disabled = false;
      break;
    case 'sending':
      submitButton.disabled = true;
      break;
    case 'error':
      submitButton.disabled = false;
      break;
    case 'filling':
      submitButton.disabled = false;
      break;
    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

// const buildList = () => {
//   const cardBorder = document.createElement('div');
//   cardBorder.classList.add('card', 'border-0');
//   const cardBody = document.createElement('div');
//   cardBody.classList.add('card-body');
//   const cardTitle = document.createElement('h2');
//   cardTitle.classList.add('card-title', 'h4');
//   const listGroup = document.createElement('ul');
//   listGroup.classList.add('list-group', 'border-0', 'rounded-0');
//   cardBody.append(cardTitle);
//   cardBorder.append(cardBody, listGroup);
//   return cardBorder;
// };

const app = () => {

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
      newPosts: [],
      feeds: [],
    },
     modalWindowState: {
      postId: '',
    },
  };

  const validation = (field) => {
    schema.validate({ link: field }, { abortEarly: true })
      .then(() => {
        initialState.form.data.push(field)
        watchedState.form.dataState = 'valid';
        watchedState.form.processState = 'sent';
        getRSS(field);
      })
      .catch((e) => {
        watchedState.form.processState = 'error';
        watchedState.form.dataState = 'invalid';
      });
  };

  const checkUpdates = (urls) => {
   
    urls.forEach((url) => {
      prepareDataForUpdate(url);
    });
    setTimeout(() => checkUpdates(urls), 5000);
  };

  const prepareDataForUpdate = (url) => {
   
    axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
      .then((response) => response.data)
      .then((data) => {
        const doc = new DOMParser().parseFromString(data.contents, 'application/xml');
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
  };

  // const renderForm = (status) => (path, value) => {
  //   switch (value) {
  //     case 'neutral':
  //       status.classList.remove('text-sucess', 'text-danger');
  //       status.textContent = i18nextInstance.t('statusMessage.neutral');
  //       break;
  //     case 'invalid':
  //       status.classList.remove('text-sucess', 'text-danger');
  //       status.classList.add('text-danger');
  //       status.textContent = i18nextInstance.t('statusMessage.invalid');
  //       elements.input.value = '';
  //       elements.input.focus();
  //       break;
  //     case 'valid':
  //       status.classList.remove('text-sucess', 'text-danger');
  //       status.classList.add('text-sucess');
  //       status.textContent = i18nextInstance.t('statusMessage.valid');
  //       elements.input.value = '';
  //       elements.input.focus();
  //       break;
  //     case 'duplicate':
  //       status.classList.remove('text-sucess', 'text-danger');
  //       status.classList.add('text-danger');
  //       status.textContent = i18nextInstance.t('statusMessage.duplicate');
  //       elements.input.value = '';
  //       elements.input.focus();
  //       break;
  //     case 'noRss':
  //       status.classList.remove('text-sucess', 'text-danger');
  //       status.classList.add('text-danger');
  //       status.textContent = i18nextInstance.t('statusMessage.noRss');
  //       elements.input.value = '';
  //       elements.input.focus();
  //       break;
  //       case 'networkError':
  //         status.classList.remove('text-sucess', 'text-danger');
  //         status.classList.add('text-danger');
  //         status.textContent = i18nextInstance.t('statusMessage.noRss');
  //         elements.input.value = '';
  //         elements.input.focus();
  //         break;
  //     default:
  //       throw new Error(`Unknown data state: ${value}`);
  //   }
  // };

  // const renderUpdates = (pUl) => (path, values) => {
  //   const newPost = values[values.length -1];
  //     watchedState.postsData.posts.push(newPost);
  //     const postList = document.createElement('li');
  //     postList.classList.add('list-group-item', 'border-0', 'border-end-0', 'justify-content-between', 'align-items-start', 'd-flex');
  //     const postLink = document.createElement('a');
  //     const button = document.createElement('button');
  //     postList.append(postLink, button);
  //     postLink.outerHTML = `<a href= ${newPost.link} class='fw-bold' data-id="${newPost.id}" target="_blank" rel="noopener noreferrer">${newPost.title}</a>`;
  //     button.outerHTML = `<button type="button" data-id="${newPost.id}" data-bs-toggle="modal" class="btn btn-outline-primary btn-sm" data-bs-target="#modal">${i18nextInstance.t('linkBtn')}</button>`;
  //     pUl.append(postList);
  // };

  // const renderFeeds = (feedsContainer) => (path, values) => {
  //   feedsContainer.innerHTML = '';
  //   const feedContainer = buildList();
  //   const fUl = feedContainer.querySelector('ul');
  //   const feedtitle = feedContainer.querySelector('h2');
  //   feedtitle.textContent = i18nextInstance.t('feedTitle');;
  //   values.forEach((value) => {
  //     const feedList = document.createElement('li');
  //     feedList.classList.add('list-group-item', 'border-0', 'border-end-0');
  //     const feedMinititle = document.createElement('h3');
  //     const feedDescription = document.createElement('p');
  //     feedList.append(feedMinititle, feedDescription);
  //     feedMinititle.classList.add('h6', 'm-0');
  //     feedMinititle.textContent = value.feedTitle;
  //     feedDescription.textContent = value.feedSubtitle;
  //     feedDescription.classList.add('small', 'm-0', 'text-black-50');
  //     fUl.append(feedList);
  //     feedsContainer.append(feedContainer);
  //   });
  //   setTimeout(() => checkUpdates(initialState.form.data), 5000);
  // };

  // const renderPosts = (postsContainer) => (path, values) => {
  //   postsContainer.innerHTML = '';
  //   const postContainer = buildList();
  //   const pUl = postContainer.querySelector('ul');
  //   const postTitle = postContainer.querySelector('h2');
  //   postTitle.textContent = i18nextInstance.t('postTitle');

  //   values.forEach((value) => {
  //     const postList = document.createElement('li');
  //     postList.classList.add('list-group-item', 'border-0', 'border-end-0', 'justify-content-between', 'align-items-start', 'd-flex');
  //     const postLink = document.createElement('a');
  //     const button = document.createElement('button');
  //     postList.append(postLink, button);
  //     postLink.outerHTML = `<a href= ${value.link} class='fw-bold' data-id="${value.id}" target="_blank" rel="noopener noreferrer">${value.title}</a>`;
  //     button.outerHTML = `<button type="button" data-id="${value.id}" data-bs-toggle="modal" class="btn btn-outline-primary btn-sm" data-bs-target="#modal">${i18nextInstance.t('linkBtn')}</button>`;
  //     pUl.append(postList);
  //     postsContainer.append(postContainer);
  //   });
  // };
  // const renderClickedLinks = (popUp) => (path, id) => {
  //   const link = document.querySelector(`[data-id='${id}']`);
  //   link.className = 'fw-normal link-secondary';
  //   const header = popUp.querySelector('.modal-title');
  //   const block = popUp.querySelector('.modal-body');
  //   const modalLink = popUp.querySelector('.full-article');
  //   modalLink.href = link.href;
  //   const { title } = watchedState.postsData.posts.find((post) => post.id === id);
  //   const { description } = watchedState.postsData.posts.find((post) => post.id === id);
  //   header.textContent = title;
  //   block.textContent = description;
  // };

  const watchedState = onChange(initialState, (path, value) => {
    switch(path) {
      case ('form.dataState'):
        renderForm(elements, i18nextInstance)(path, value)
        break;
      case ('form.processState'):
        handleProcessState(elements.submitButton)(path, value)
        break;
      case ('postsData.posts'):
        renderPosts(elements.postsContainer)(path, value)
        break;
      case ('postsData.feeds'):
        console.log(value)
        renderFeeds(elements.feedsContainer)(path, value)
        break;
      case ('postsData.newPosts'):
        renderUpdates(elements.postsContainer.querySelector('ul'), i18nextInstance)(path, value)
        break;
      case ('modalWindowState.postId'):
        renderClickedLinks(elements.modalContent)(path, value)
        break;
      default:
        break;
    }
  });

  const buildTree = (doc) => {
    console.log(doc)
    const feedsTitle = doc.querySelector('channel > title');
    const feedsSubtitle = doc.querySelector('channel > description');
    const items = doc.querySelectorAll('item');
    const id = uniqueId();

    if (watchedState.postsData.feeds.filter((feed) => feed.feedTitle === feedsTitle.textContent).length === 0) {
      watchedState.postsData.feeds.push({ id, feedTitle: feedsTitle.textContent, feedSubtitle: feedsSubtitle.textContent });
    };

    items.forEach((item) => {
      const title = item.querySelector('title').textContent;
      const link = item.querySelector('link').textContent;
      const description = item.querySelector('description').textContent;
      watchedState.postsData.posts.push({
        feedId: id,
        id: uniqueId(),
        title,
        link,
        description,
        clicked: false,
      });
    });
    console.log(initialState.form.dataState)
  };

  const domParser = (rssText) => {
    watchedState.form.data.push(elements.input.value);
    const doc = new DOMParser().parseFromString(rssText, 'application/xml');
    const error = doc.querySelector('parsererror');
    console.log(error)
    if (!error) {
      buildTree(doc)
    } else {
      watchedState.form.dataState = 'noRss'
    };
  };

  const getRSS = (url) => {
    axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
      .then((response) => response.data)
      .then((data) => domParser(data.contents))
      .catch(e => watchedState.form.dataState = 'networkError'); 
  };

  elements.postsContainer.addEventListener('click', (e) => {
    switch (e.target.nodeName) {
      case ('A'):
        e.target.className = 'fw-normal link-secondary';
        break;
      case ('BUTTON'):
        const { id } = e.target.dataset;
        watchedState.modalWindowState.postId = id;
        break;
      default:
        break;
    }
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
  if (initialState.form.data.length > 0) {
    setTimeout(() => checkUpdates(initialState.form.data), 5000);
  }
};

export default app;
