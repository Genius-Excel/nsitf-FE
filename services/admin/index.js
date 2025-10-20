import HttpService from "../httpServices";
import useMutateItem from "../useMutateItem";
import useFetchItem from "../useFetchItem";
import { routes } from "../apiRoutes";
import { ErrorHandler } from "../errorHandler";
import Storage from "../storage";
import { getLocalStorageItem, getUserIdFromSession } from "@/lib/utils";

const httpService = new HttpService();
const storage = new Storage();

export const useAddUser =(handleSuccess)=>{
   const { data, error, isPending, mutate, isSuccess } = useMutateItem({
    mutationFn: (payload) =>
      httpService.postData(
        payload,
        routes.adminAddUsers()
      ),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      handleSuccess(resData);
    },
  });

  return {
    addUserData: data?.data || {},
    addUserError: error ? ErrorHandler(error) : null,
    addUserIsLoading: isPending,
    addUserPayload: (requestPayload) => mutate(requestPayload),
    addUserIsSuccess: isSuccess,
  };
}

export const useGetUsers =({enabled = false})=>{
   const { data, error, isLoading, refetch, setFilter } = useFetchItem({
    queryKey: ["GetEnteredUserData"],
    queryFn: () => {
      return httpService.getData(routes.adminGetUsers());
    },
    enabled,
    retry: 2,
  });
  console.log(data);
  return {
    gettingUserData: isLoading,
    userData: data?.data?.data || null,
    userDataError: ErrorHandler(error),
    refetchUserData: refetch,
    filterUserData: setFilter,
  };
}

export const useEditUser =(handleSuccess)=>{
   const { data, error, isPending, mutate, isSuccess } = useMutateItem({
    mutationFn: (payload) =>
      httpService.patchData(
        payload,
        routes.editUser(userId)
      ),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      handleSuccess(resData);
    },
  });

  return {
    editUserData: data?.data || {},
    editUserError: error ? ErrorHandler(error) : null,
    editUserIsLoading: isPending,
    editUserPayload: (requestPayload) => mutate(requestPayload),
    editUserIsSuccess: isSuccess,
  };
}

export const useGetConfirmEmail = ({ enabled = false }) => {
  const { data, error, isLoading, refetch, setFilter } = useFetchItem({
    queryKey: ["ConfirmEmailWithToken"],
    queryFn: (token) => {
      return httpService.getDataWithoutToken(routes.verifyEmailToken(token));
    },
    enabled,
    retry: 2,
  });
  console.log(data);
  return {
    isVerifyingToken: isLoading,
    verifiedTokenData: data?.data?.message || null,
    verifyTokenError: ErrorHandler(error),
    refetchVerifyToken: refetch,
    filterVerifyToken: setFilter,
  };
};

export const useResendConfirmationEmail =(handleSuccess)=>{
   const { data, error, isPending, mutate, isSuccess } = useMutateItem({
    mutationFn: (payload) =>
      httpService.postDataWithoutToken(
        payload,
        routes.resendConfirmation()
      ),
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
}

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

export const useLoginWithEmail = (handleSuccess) => {
  const { data, error, isPending, mutate } = useMutateItem({
    mutationFn: (payload) =>
      httpService.postDataWithoutToken(payload, routes.loginWithEmail()),

    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};

      if (
        typeof window !== "undefined" &&
        resData?.access &&
        resData?.refresh
      ) {
        try {
          Storage.set("accessToken", resData.access - token);
          Storage.set("refreshToken", resData.refresh - token);
          Storage.set("user_id", resData.user_id || "");
          Storage.set("role", resData.role || "");
        } catch (storageError) {
          console.error("Storage error:", storageError);
        }
      }
      if (typeof handleSuccess === "function") {
        handleSuccess(resData);
      }
    },
    onError: (err) => {
      console.error("Login error:", err);
    },
  });

  return {
    loginWithEmailData: data?.data,
    loginWithEmailError: ErrorHandler(error),
    loginWithEmailLoading: isPending,
    loginWithEmailPayload: (requestPayload) => {
      if (!requestPayload?.email || !requestPayload?.password) {
        console.error("Invalid payload: Missing email or password");
        return;
      }
      mutate(requestPayload);
    },
  };
};

export const useLoginWithPhoneNumber = (handleSuccess) => {
  const { data, error, isPending, mutate } = useMutateItem({
    mutationFn: (payload) =>
      httpService.postDataWithoutToken(payload, routes.loginWithPhonenumber()),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      if (typeof window !== "undefined") {
        Storage.set("accessToken", resData?.access - token);
        Storage.set("refreshToken", resData?.refresh - token);
        Storage.set("user_id", resData?.user_id);
        Storage.set("role", resData?.role);
      }
      handleSuccess(resData);
    },
  });
  return {
    loginWithPhoneNumberData: data,
    loginWithPhoneNumberError: ErrorHandler(error),
    loginWithPhoneNumberIsLoading: isPending,
    loginWithPhoneNumberPayload: (requestPayload) => mutate(requestPayload),
  };
};

export const useResendEmail = (handleSuccess) => {
  const { data, error, isPending, mutate } = useMutateItem({
    mutationFn: (payload) =>
      httpService.postDataWithoutToken(payload, routes.resendEmail()),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      // console.log(requestParams?.data);
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
export const useOnboardingStepOne = (handleSuccess) => {
  const userId = getLocalStorageItem("user_id");
  const { data, error, isPending, mutate, isSuccess } = useMutateItem({
    mutationFn: (payload) =>
      httpService.postDataWithoutToken(
        payload,
        routes.onboardingStepOne(userId)
      ),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      // console.log("onboardingStepOne Response Data:", resData?.error);
      if (handleSuccess) {
        handleSuccess(resData);
        if (typeof window !== "undefined") {
          Storage.set("business_id", resData?.data[0]?.business_id);
        }
      }
    },
  });

  return {
    onboardingStepOneData: data || {},
    onboardingStepOneError: error ? ErrorHandler(error) : null,
    onboardingStepOneIsLoading: isPending,
    onboardingStepOnePayload: (requestPayload) => mutate(requestPayload),
    onboardingStepOneIsSuccess: isSuccess,
  };
};

export const useOnboardingStepTwo = (handleSuccess) => {
  const businessId = getLocalStorageItem("business_id");
  const { data, error, isPending, mutate, isSuccess } = useMutateItem({
    mutationFn: (payload) =>
      httpService.postFormDataWithoutToken(
        payload,
        routes.onboardingStepTwo(businessId)
      ),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      // console.log("onboardingStepTwo Response Data:", resData);
      if (handleSuccess) {
        handleSuccess(resData);
      }
    },
  });

  return {
    onboardingStepTwoData: data || {},
    onboardingStepTwoError: error ? ErrorHandler(error) : null,
    onboardingStepTwoIsLoading: isPending,
    onboardingStepTwoPayload: (requestPayload) => mutate(requestPayload),
    onboardingStepTwoIsSuccess: isSuccess,
  };
};

export const useVerifyToken = ({ enabled = false }) => {
  const { data, error, isLoading, refetch, setFilter } = useFetchItem({
    queryKey: ["validateEmailToken"],
    queryFn: (token) => {
      return httpService.getDataWithoutToken(routes.verifyEmailToken(token));
    },
    enabled,
    retry: 2,
  });
  console.log(data);
  return {
    isVerifyingToken: isLoading,
    verifiedTokenData: data?.data?.message || null,
    verifyTokenError: ErrorHandler(error),
    refetchVerifyToken: refetch,
    filterVerifyToken: setFilter,
  };
};

export const useSendPasswordReset = (handleSuccess) => {
  const { data, error, isPending, mutate, isSuccess } = useMutateItem({
    mutationFn: (payload) =>
      httpService.postDataWithoutToken(payload, routes.sendPasswordReset()),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      // console.log("Send password reset request", resData);
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
      // console.log("Reset password data", resData);
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

export const useGetVerificationStatus = ({ enabled = false, businessId }) => {
  const {
    data: rawData,
    error,
    isLoading,
    refetch,
    setFilter,
  } = useFetchItem({
    queryKey: ['verify_business', businessId],
    queryFn: async () => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }
      const response = await httpService.getData(
        routes.getVerificationStatus(businessId)
      );
      return response; 
    },
    enabled: enabled && !!businessId,
    retry: 2,
    staleTime: 5 * 60 * 1000, 
    cacheTime: 10 * 60 * 1000, 
  });
   console.log("Verification Status Data:", rawData?.data);
  return {
    verificationIsLoading: isLoading,
    verificationData: rawData?.data?.message,
    verificationError: error ? ErrorHandler(error) : null,
    refetchVerification: refetch,
    filterVerification: setFilter,
  };
};

export const useCreateOrUpdateCustomLink = (businessId, handleSuccess) => {
  const { data, error, isPending, isSuccess, mutate } = useMutateItem({
    mutationFn: (payload) =>
      httpService.patchDataJson(payload, routes.createAndUpdateCustomLink(businessId)),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      handleSuccess?.(resData);
    },
  });

  return {
    customLinkData: data || {},
    customLinkError: error ? ErrorHandler(error) : null,
    customLinkIsLoading: isPending,
    mutateCustomLink: (requestPayload) => mutate(requestPayload),
    customLinkIsSuccess: isSuccess,
  };
};
