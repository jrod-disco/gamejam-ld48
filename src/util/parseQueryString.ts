/**
 * @param {string} queryString The full query string.
 * @return {!Object<string, string>} The parsed query parameters.
 */
export const parseQueryString = (queryString): any => {
  // Remove first character if it is ? or #.
  if (
    queryString.length &&
    (queryString.charAt(0) == '#' || queryString.charAt(0) == '?')
  ) {
    queryString = queryString.substring(1);
  }
  const config = {};
  const pairs = queryString.split('&');
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    if (pair.length == 2) {
      config[pair[0]] = pair[1];
    }
  }
  return config;
};
