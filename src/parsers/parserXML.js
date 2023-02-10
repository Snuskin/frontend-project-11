/* eslint-disable consistent-return */
export default (data) => {
  const result = {
    feed: {},
    posts: [],
  };
  const doc = new DOMParser().parseFromString(data, 'application/xml');
  const error = doc.querySelector('parsererror');
  if (!error) {
    const feedsTitle = doc.querySelector('channel > title');
    const feedsSubtitle = doc.querySelector('channel > description');
    const items = doc.querySelectorAll('item');
    items.forEach((item) => {
      const title = item.querySelector('title').textContent;
      const link = item.querySelector('link').textContent;
      const description = item.querySelector('description').textContent;
      if (!title || !link || !description) {
        return 'Error';
      }
      result.posts.push({
        title,
        link,
        description,
        clicked: false,
      });
    });
    result.feed = { feedTitle: feedsTitle.textContent, feedSubtitle: feedsSubtitle.textContent };
    return result;
  }
  return 'Error';
};
