import { useQuery } from "@tanstack/react-query";
import { api } from "../core/api";

export function useUpdate(path) {
  const fetch = async () => {
    console.log("Fetching data from path:", path);
    const res = await api.get(path);
    console.log("Response:", res.data);
    return res.data;
  };

  const { data, error, isLoading, refetch, isSuccess } = useQuery({
    queryKey: [path],
    queryFn: fetch,
    enabled: false,
  });

  return { data, error, isLoading, refetch, isSuccess };
}
