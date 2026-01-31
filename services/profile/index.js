import HttpService from "../httpServices";
import useMutateItem from "../useMutateItem";
import useFetchItem from "../useFetchItem";
import { routes } from "../apiRoutes";
import { ErrorHandler } from "../errorHandler";
import Storage from "../storage";
import { getLocalStorageItem, getUserIdFromSession } from "@/lib/utils";

const httpService = new HttpService();
const storage = new Storage();

export const useGetUserProfile = ({ enabled = false }) => {
  const { data, error, isLoading, refetch, setFilter } = useFetchItem({
    queryKey: ["GetUserData"],
    queryFn: () => {
      return httpService.getData(routes.getUserProfileDetails());
    },
    enabled,
    retry: 2,
  });
  return {
    gettingUserData: isLoading,
    userData: data?.data?.data || null,
    userDataError: ErrorHandler(error),
    refetchUserData: refetch,
    filterUserData: setFilter,
  };
};

export const useGetConfirmEmail = ({ enabled = false }) => {
  const { data, error, isLoading, refetch, setFilter } = useFetchItem({
    queryKey: ["ConfirmEmailWithToken"],
    queryFn: (token) => {
      return httpService.getDataWithoutToken(routes.verifyEmailToken(token));
    },
    enabled,
    retry: 2,
  });
  return {
    isVerifyingToken: isLoading,
    verifiedTokenData: data?.data?.message || null,
    verifyTokenError: ErrorHandler(error),
    refetchVerifyToken: refetch,
    filterVerifyToken: setFilter,
  };
};

export const useResendConfirmationEmail = (handleSuccess) => {
  const { data, error, isPending, mutate, isSuccess } = useMutateItem({
    mutationFn: (payload) =>
      httpService.postDataWithoutToken(payload, routes.resendConfirmation()),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      // console.log(requestParams?.data);
      handleSuccess(resData);
    },
  });

  return {
    resendConfirmationData: data || {},
    resendConfirmationError: error ? ErrorHandler(error) : null,
    resendConfirmationIsLoading: isPending,
    resendConfirmationPayload: (requestPayload) => mutate(requestPayload),
    resendConfirmationIsSuccess: isSuccess,
  };
};

export const useVerifyEmail = (handleSuccess) => {
  const { data, error, isPending, mutate } = useMutateItem({
    mutationFn: (payload) =>
      httpService.postDataWithoutToken(payload, routes.restaurantVerifyMail()),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      // console.log(requestParams?.data);
      handleSuccess(resData);
    },
  });

  return {
    verifyEmailData: data,
    verifyEmailError: ErrorHandler(error),
    verifyEmailIsLoading: isPending,
    verifyEmailPayload: (requestPayload) => mutate(requestPayload),
  };
};

export const useResendEmail = (handleSuccess) => {
  const { data, error, isPending, mutate } = useMutateItem({
    mutationFn: (payload) =>
      httpService.postDataWithoutToken(payload, routes.resendEmail()),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      handleSuccess(resData);
    },
  });

  return {
    resendEmailData: data,
    resendEmaiError: ErrorHandler(error),
    resendEmaiIsLoading: isPending,
    resendEmaiPayload: (requestPayload) => mutate(requestPayload),
  };
};

export const useSendPasswordReset = (handleSuccess) => {
  const { data, error, isPending, mutate, isSuccess } = useMutateItem({
    mutationFn: (payload) =>
      httpService.postDataWithoutToken(payload, routes.sendPasswordReset()),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      if (handleSuccess) {
        handleSuccess(resData);
      }
    },
  });

  return {
    resetRequestData: data || {},
    resetRequestError: error ? ErrorHandler(error) : null,
    resetRequestIsLoading: isPending,
    resetRequestPayload: (requestPayload) => mutate(requestPayload),
    resetRequestIsSuccess: isSuccess,
  };
};

export const useResetPassword = (handleSuccess) => {
  const { data, error, isPending, isSuccess, mutate } = useMutateItem({
    mutationFn: ({ payload, token }) =>
      httpService.postDataWithoutToken(payload, routes.passwordReset(token)),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      if (handleSuccess) {
        handleSuccess(resData);
      }
    },
  });

  return {
    resetPasswordData: data || {},
    resetPasswordError: error ? ErrorHandler(error) : null,
    resetPasswordIsLoading: isPending,
    resetPasswordPayload: (requestPayload, token) =>
      mutate({ payload: requestPayload, token }),
    resetPasswordIsSuccess: isSuccess,
  };
};
