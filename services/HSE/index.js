import HttpService from "../httpServices";
import useMutateItem from "../useMutateItem";
import useFetchItem from "../useFetchItem";
import { routes } from "../apiRoutes";
import { ErrorHandler } from "../errorHandler";
import Storage from "../storage";
import { getLocalStorageItem, getUserIdFromSession } from "@/lib/utils";

const httpService = new HttpService();
const storage = new Storage();


export const useGetHSERecords =({enabled = false})=>{
   const { data, error, isLoading, refetch, setFilter } = useFetchItem({
    queryKey: ["getHSEData"],
    queryFn: () => {
      return httpService.getData(routes.getHseRecords());
    },
    enabled,
    retry: 2,
  });
  console.log(data);
  return {
    gettingHSErData: isLoading,
    HSEData: data?.data?.data || null,
    HSEError: ErrorHandler(error),
    refetchHSEData: refetch,
    filterHSEData: setFilter,
  };
}

export const useGEtDashboardMetrics =({enabled = false})=>{
   const { data, error, isLoading, refetch, setFilter } = useFetchItem({
    queryKey: ["getDashboardMetrics"],
    queryFn: () => {
      return httpService.getData(routes.getHSEDashboardMerics());
    },
    enabled,
    retry: 2,
  });
  console.log("hse dashboard",data);
  return {
    gettingHSErData: isLoading,
    HSEData: data?.data || null,
    HSEError: ErrorHandler(error),
    refetchHSEData: refetch,
    filterHSEData: setFilter,
  };
}

export const useGetHSESingle =({enabled = false})=>{
   const { data, error, isLoading, refetch, setFilter } = useFetchItem({
    queryKey: ["getSingleHSEData"],
    queryFn: (dataId) => {
      return httpService.getData(routes.getHseRecords(dataId));
    },
    enabled,
    retry: 2,
  });
  console.log(data);
  return {
    gettingHSErData: isLoading,
    HSEData: data?.data?.data || null,
    HSEError: ErrorHandler(error),
    refetchHSEData: refetch,
    filterHSEData: setFilter,
  };
}

export const useCreateHSERecord =(handleSuccess)=>{
   const { data, error, isPending, mutate, isSuccess } = useMutateItem({
    mutationFn: (payload) =>
      httpService.postData(
        payload,
        routes.createHSE()
      ),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      // console.log(requestParams?.data);
      handleSuccess(resData);
    },
  });
  console.log(data);
  return {
    HSERecordData: data || {},
    HSERecordError: error ? ErrorHandler(error) : null,
    HSERecordIsLoading: isPending,
    HSERecordPayload: (requestPayload) => mutate(requestPayload),
    HSERecordIsSuccess: isSuccess,
  };
}


export const useEditHseRecord = (handleSuccess) => {
  const { data, error, isPending, mutate, isSuccess } = useMutateItem({
    mutationFn: (payload) =>
      httpService.patchData(payload, routes.editHseRecord(payload.recordId)),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      // console.log("Send password reset request", resData);
      if (handleSuccess) {
        handleSuccess(resData);
      }
    },
  });

  return {
    editHSEData: data || {},
    editHSEError: error ? ErrorHandler(error) : null,
    editHSEIsLoading: isPending,
    editHSEPayload: (requestPayload) => mutate(requestPayload),
    editHSEIsSuccess: isSuccess,
  };
};
export const useDeleteHseRecord = (handleSuccess) => {
  const { data, error, isPending, mutate, isSuccess } = useMutateItem({
    mutationFn: (payload) =>
      httpService.deleteData(payload, routes.deleteHseRecord()),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      // console.log("Send password reset request", resData);
      if (handleSuccess) {
        handleSuccess(resData);
      }
    },
  });

  return {
    deleteHSEData: data || {},
    deleteHSEError: error ? ErrorHandler(error) : null,
    deleteHSEIsLoading: isPending,
    deleteHSEPayload: (requestPayload) => mutate(requestPayload),
    deleteHSEIsSuccess: isSuccess,
  };
}


