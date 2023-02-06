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
export default (feedsContainer) => (path, values) => {
  console.log('huy')
  
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