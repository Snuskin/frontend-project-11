export default (pUl, i18nextInstance) => (path, values) => {
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