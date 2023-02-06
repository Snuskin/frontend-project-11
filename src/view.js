export default () => {
      const renderForm = (status) => (path, value) => {
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
        elements.input.value = '';
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
          status.textContent = i18nextInstance.t('statusMessage.noRss');
          elements.input.value = '';
          elements.input.focus();
          break;
      default:
        throw new Error(`Unknown data state: ${value}`);
    }
  };

  const renderUpdates = (pUl) => (path, values) => {
    const newPost = values[values.length -1];
      watchedState.postsData.posts.push(newPost);
      const postList = document.createElement('li');
      postList.classList.add('list-group-item', 'border-0', 'border-end-0', 'justify-content-between', 'align-items-start', 'd-flex');
      const postLink = document.createElement('a');
      const button = document.createElement('button');
      postList.append(postLink, button);
      postLink.outerHTML = `<a href= ${newPost.link} class='fw-bold' data-id="${newPost.id}" target="_blank" rel="noopener noreferrer">${newPost.title}</a>`;
      button.outerHTML = `<button type="button" data-id="${newPost.id}" data-bs-toggle="modal" class="btn btn-outline-primary btn-sm" data-bs-target="#modal">${i18nextInstance.t('linkBtn')}</button>`;
      pUl.append(postList);
  };

  const renderFeeds = (feedsContainer) => (path, values) => {
    feedsContainer.innerHTML = '';
    const feedContainer = buildList();
    const fUl = feedContainer.querySelector('ul');
    const feedtitle = feedContainer.querySelector('h2');
    feedtitle.textContent = i18nextInstance.t('feedTitle');;
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
    setTimeout(() => checkUpdates(initialState.form.data), 5000);
  };

  const renderPosts = (postsContainer) => (path, values) => {
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
      postLink.outerHTML = `<a href= ${value.link} class='fw-bold' data-id="${value.id}" target="_blank" rel="noopener noreferrer">${value.title}</a>`;
      button.outerHTML = `<button type="button" data-id="${value.id}" data-bs-toggle="modal" class="btn btn-outline-primary btn-sm" data-bs-target="#modal">${i18nextInstance.t('linkBtn')}</button>`;
      pUl.append(postList);
      postsContainer.append(postContainer);
    });
  };
  const renderClickedLinks = (popUp) => (path, id) => {
    const link = document.querySelector(`[data-id='${id}']`);
    link.className = 'fw-normal link-secondary';
    const header = popUp.querySelector('.modal-title');
    const block = popUp.querySelector('.modal-body');
    const modalLink = popUp.querySelector('.full-article');
    modalLink.href = link.href;
    const { title } = watchedState.postsData.posts.find((post) => post.id === id);
    const { description } = watchedState.postsData.posts.find((post) => post.id === id);
    header.textContent = title;
    block.textContent = description;
  };
}