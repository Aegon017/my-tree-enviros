import api from "./axios";

export const fetcher = async (url: string) => {
  const { data } = await api.get(url);
  return data;
};
