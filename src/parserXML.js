/* eslint-disable consistent-return */
export default (data) => {
  const result = {
    feed: {},
    posts: [],
  };
  const doc = new DOMParser().parseFromString(data, 'application/xml');
  const error = doc.querySelector('parsererror');
  if (error) {
    throw new Error();
  }
  const feedsTitle = doc.querySelector('channel > title');
  const feedsSubtitle = doc.querySelector('channel > description');
  const items = doc.querySelectorAll('item');
  items.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    if (title && link && description) {
      result.posts.push({
        title,
        link,
        description,
      });
    }
  });
  result.feed = { feedTitle: feedsTitle.textContent, feedSubtitle: feedsSubtitle.textContent };
  return result;
};
