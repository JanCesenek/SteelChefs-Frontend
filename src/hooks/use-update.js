import { useQuery } from "react-query";
import { api } from "../core/api";

export function useUpdate(path) {
  const fetch = async () => {
    console.log("Fetching data from path:", path);
    const res = await api.get(path);
    console.log("Response:", res.data);
    return res.data;
  };

  const { data, error, isLoading, refetch, isSuccess } = useQuery([path], fetch, {
    enabled: false,
    onError: (error) => {
      console.error("Error fetching data:", error);
    },
  });

  return { data, error, isLoading, refetch, isSuccess };
}
