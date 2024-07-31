import { SearchableType } from "./octokitHelper";

export type SearchQuery = {
  type: SearchableType;
  name: string;
};

const existInHistory = (
  history: SearchQuery[],
  query: SearchQuery
): boolean => {
  const duplicate = history.find(
    (item) => item.name === query.name && item.type === query.type
  );
  return duplicate ? true : false;
};

const removeFromHistory = (
  history: SearchQuery[],
  query: SearchQuery
): SearchQuery[] => {
	return history.filter(item => {
		return item.name !== query.name &&
			item.type !== query.name
	})
};

export { existInHistory, removeFromHistory };
