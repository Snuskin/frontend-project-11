export default (popUp) => (path, id) => {
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