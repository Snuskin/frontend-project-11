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

export default (postsContainer) => (path, values) => {
  console.log('huy')
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