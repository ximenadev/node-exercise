import qs from 'qs';

export const parseQuery = (queryString: string) =>
  qs.parse(queryString, { allowPrototypes: false, duplicates: 'last' });
