import HttpService from "../httpServices";
import useMutateItem from "../useMutateItem";
import useFetchItem from "../useFetchItem";
import { routes } from "../apiRoutes";
import { ErrorHandler } from "../errorHandler";
import Storage from "../storage";
import { getLocalStorageItem, getUserIdFromSession } from "@/lib/utils";

const httpService = new HttpService();
const storage = new Storage();

export const useGetHSERecords = ({ enabled = false }) => {
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
};

export const useGEtDashboardMetrics = ({ enabled = false }) => {
  const { data, error, isLoading, refetch, setFilter } = useFetchItem({
    queryKey: ["getDashboardMetrics"],
    queryFn: () => {
      return httpService.getData(routes.getHSEDashboardMerics());
    },
    enabled,
    retry: 2,
  });
  return {
    gettingHSErData: isLoading,
    HSEData: data?.data || null,
    HSEError: ErrorHandler(error),
    refetchHSEData: refetch,
    filterHSEData: setFilter,
  };
};

export const useGetHSESingle = ({ enabled = false }) => {
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
};

export const useGetSingleManageHseRecord = ({ uuid, enabled = false }) => {
  const { data, error, isLoading, refetch } = useFetchItem({
    queryKey: ["getSingleManageHseRecord", uuid],
    queryFn: () => {
      return httpService.getData(routes.getSingleManageHseRecord(uuid));
    },
    enabled: enabled && !!uuid,
    retry: 2,
  });
  return {
    gettingManageHSERecord: isLoading,
    manageHSERecord: data?.data?.data || null,
    manageHSERecordError: ErrorHandler(error),
    refetchManageHSERecord: refetch,
  };
};

export const useCreateHSERecord = (handleSuccess) => {
  const { data, error, isPending, mutate, isSuccess } = useMutateItem({
    mutationFn: (payload) => httpService.postData(payload, routes.createHSE()),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      handleSuccess(resData);
    },
  });
  return {
    HSERecordData: data || {},
    HSERecordError: error ? ErrorHandler(error) : null,
    HSERecordIsLoading: isPending,
    HSERecordPayload: (requestPayload) => mutate(requestPayload),
    HSERecordIsSuccess: isSuccess,
  };
};

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
export const useUpdateManageHseRecord = (handleSuccess) => {
  const { data, error, isPending, mutate, isSuccess } = useMutateItem({
    mutationFn: (payload) => {
      const { uuid, ...fields } = payload;
      const formData = new URLSearchParams();
      if (fields.record_status !== undefined)
        formData.append("record_status", fields.record_status);
      if (fields.total_actual_osh_activities !== undefined)
        formData.append(
          "total_actual_osh_activities",
          String(fields.total_actual_osh_activities),
        );
      if (fields.target_osh_activities !== undefined)
        formData.append(
          "target_osh_activities",
          String(fields.target_osh_activities),
        );
      if (fields.osh_enlightenment !== undefined)
        formData.append("osh_enlightenment", String(fields.osh_enlightenment));
      if (fields.osh_inspection_audit !== undefined)
        formData.append(
          "osh_inspection_audit",
          String(fields.osh_inspection_audit),
        );
      if (fields.accident_investigation !== undefined)
        formData.append(
          "accident_investigation",
          String(fields.accident_investigation),
        );
      if (fields.period !== undefined) formData.append("period", fields.period);
      // Passing URLSearchParams directly — axios sets Content-Type automatically
      return httpService.patchData(
        formData,
        routes.updateManageHseRecord(uuid),
      );
    },
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      if (handleSuccess) {
        handleSuccess(resData);
      }
    },
  });

  return {
    updateManageHSEData: data || {},
    updateManageHSEError: error ? ErrorHandler(error) : null,
    updateManageHSEIsLoading: isPending,
    updateManageHSEPayload: (requestPayload) => mutate(requestPayload),
    updateManageHSEIsSuccess: isSuccess,
  };
};

export const useDeleteHseRecord = (handleSuccess) => {
  const { data, error, isPending, mutate, isSuccess } = useMutateItem({
    mutationFn: (payload) =>
      httpService.deleteData(payload, routes.deleteHseRecord()),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
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
};
