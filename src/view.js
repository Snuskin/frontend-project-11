/* eslint-disable no-case-declarations, no-use-before-define, no-unused-expressions */
/* eslint-disable no-param-reassign, max-len */
import onChange from 'on-change';

const buildList = () => {
  const cardBorder = document.createElement('div');
  cardBorder.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');
  cardBody.append(cardTitle);
  cardBorder.append(cardBody, listGroup);
  return cardBorder;
};
const renderForm = (elements, i18nextInstance, value) => {
  const status = elements.statusMassage;
  switch (value) {
    case 'neutral':
      status.classList.remove('text-sucess', 'text-danger');
      status.textContent = i18nextInstance.t('statusMessage.neutral');
      break;
    case 'invalid':
      status.classList.remove('text-sucess', 'text-danger');
      status.classList.add('text-danger');
      status.textContent = i18nextInstance.t('statusMessage.invalid');
      elements.input.value = '';
      elements.input.focus();
      break;
    case 'valid':
      status.classList.remove('text-sucess', 'text-danger');
      status.classList.add('text-sucess');
      status.textContent = i18nextInstance.t('statusMessage.valid');
      elements.input.focus();
      break;
    case 'duplicate':
      status.classList.remove('text-sucess', 'text-danger');
      status.classList.add('text-danger');
      status.textContent = i18nextInstance.t('statusMessage.duplicate');
      elements.input.value = '';
      elements.input.focus();
      break;
    case 'noRss':
      status.classList.remove('text-sucess', 'text-danger');
      status.classList.add('text-danger');
      status.textContent = i18nextInstance.t('statusMessage.noRss');
      elements.input.value = '';
      elements.input.focus();
      break;
    case 'networkError':
      status.classList.remove('text-sucess', 'text-danger');
      status.classList.add('text-danger');
      status.textContent = i18nextInstance.t('statusMessage.networkError');
      elements.input.value = '';
      elements.input.focus();
      break;
    default:
      throw new Error(`Unknown data state: ${value}`);
  }
};

const renderFeeds = (elements, i18nextInstance, values) => {
  const { feedsContainer } = elements;
  feedsContainer.innerHTML = '';
  const feedContainer = buildList();
  const fUl = feedContainer.querySelector('ul');
  const feedtitle = feedContainer.querySelector('h2');
  feedtitle.textContent = i18nextInstance.t('feedTitle');
  values.forEach((value) => {
    const feedList = document.createElement('li');
    feedList.classList.add('list-group-item', 'border-0', 'border-end-0');
    const feedMinititle = document.createElement('h3');
    const feedDescription = document.createElement('p');
    feedList.append(feedMinititle, feedDescription);
    feedMinititle.classList.add('h6', 'm-0');
    feedMinititle.textContent = value.feedTitle;
    feedDescription.textContent = value.feedSubtitle;
    feedDescription.classList.add('small', 'm-0', 'text-black-50');
    fUl.append(feedList);
    feedsContainer.append(feedContainer);
  });
};

const renderPosts = (elements, i18nextInstance, values, state) => {
  const { postsContainer } = elements;
  postsContainer.innerHTML = '';
  const postContainer = buildList();
  const pUl = postContainer.querySelector('ul');
  const postTitle = postContainer.querySelector('h2');
  postTitle.textContent = i18nextInstance.t('postTitle');
  values.forEach((value) => {
    const postList = document.createElement('li');
    postList.classList.add('list-group-item', 'border-0', 'border-end-0', 'justify-content-between', 'align-items-start', 'd-flex');
    const postLink = document.createElement('a');
    const button = document.createElement('button');
    postList.append(postLink, button);
    if (state.postsData.clickedPosts.includes(value.id)) {
      postLink.outerHTML = `<a href= ${value.link} class='fw-bold link-secondary' data-id="${value.id}" target="_blank" rel="noopener noreferrer">${value.title}</a>`;
    } else {
      postLink.outerHTML = `<a href= ${value.link} class='fw-bold' data-id="${value.id}" target="_blank" rel="noopener noreferrer">${value.title}</a>`;
    }
    button.outerHTML = `<button type="button" data-id="${value.id}" data-bs-toggle="modal" class="btn btn-outline-primary btn-sm" data-bs-target="#modal">${i18nextInstance.t('linkBtn')}</button>`;
    pUl.append(postList);
    postsContainer.append(postContainer);
  });
};
const renderClickedLinks = (ids) => {
  ids.forEach((id) => {
    const link = document.querySelector(`[data-id='${id}']`);
    link.className = 'fw-normal link-secondary';
  });
};
const renderClickedBtns = (elements, state, id) => {
  const popUp = elements.modalContent;
  const link = document.querySelector(`[data-id='${id}']`);
  const header = popUp.querySelector('.modal-title');
  const block = popUp.querySelector('.modal-body');
  const modalLink = popUp.querySelector('.full-article');
  modalLink.href = link.href;
  const { title } = state.postsData.posts.find((post) => post.id === id);
  const { description } = state.postsData.posts.find((post) => post.id === id);
  header.textContent = title;
  block.textContent = description;
};

const handleProcessState = (submitButton, processState) => {
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

export default (elements, i18nextInstance, state) => {
  const watchState = onChange(state, (path, value) => {
    switch (path) {
      case ('form.dataState'):
        renderForm(elements, i18nextInstance, value);
        break;
      case ('form.processState'):
        handleProcessState(elements.submitButton, value);
        break;
      case ('postsData.posts'):
        renderPosts(elements, i18nextInstance, value, state);
        break;
      case ('postsData.feeds'):
        renderFeeds(elements, i18nextInstance, value);
        break;
      case ('modalWindowState.postId'):
        renderClickedBtns(elements, state, value);
        break;
      case ('postsData.clickedPosts'):
        renderClickedLinks(value);
        break;
      default:
        break;
    }
  });
  return watchState;
};
