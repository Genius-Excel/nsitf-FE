import HttpService from "../httpServices";
import useMutateItem from "../useMutateItem";
import useFetchItem from "../useFetchItem";
import { routes } from "../apiRoutes";
import { ErrorHandler } from "../errorHandler";
import Storage from "../storage";
import { getLocalStorageItem, getUserIdFromSession } from "@/lib/utils";

const httpService = new HttpService();
const storage = new Storage();

export const useCreateAdmin = (handleSuccess) => {
  const { data, error, isPending, mutate, isSuccess } = useMutateItem({
    mutationFn: (payload) =>
      httpService.postDataWithoutToken(payload, routes.createAdmin()),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      if (handleSuccess) {
        handleSuccess(resData);
      }
    },
  });

  return {
    createAdminData: data || {},
    createAdminError: error ? ErrorHandler(error) : null,
    createAdminIsLoading: isPending,
    createAdminPayload: (requestPayload) => mutate(requestPayload),
    createAdminIsSuccess: isSuccess,
  };
};

export const useLogin = (handleSuccess) => {
  const { data, error, isPending, mutate, isSuccess } = useMutateItem({
    mutationFn: (payload) =>
      httpService.postDataWithoutToken(payload, routes.login()),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};

      // Store access token in localStorage
      // API returns tokens with hyphenated field names
      const accessToken =
        resData["access-token"] ||
        resData?.access ||
        resData?.access_token ||
        resData?.token;
      const refreshToken =
        resData["refresh-token"] || resData?.refresh || resData?.refresh_token;

      if (typeof window !== "undefined" && accessToken) {
        try {
          localStorage.setItem("access_token", accessToken);

          if (refreshToken) {
            localStorage.setItem("refresh_token", refreshToken);
          }
        } catch (storageError) {
          console.error("Failed to store tokens:", storageError);
        }
      }

      handleSuccess(resData);
    },
  });

  return {
    loginData: data?.data || {},
    loginError: error ? ErrorHandler(error) : null,
    loginIsLoading: isPending,
    loginPayload: (requestPayload) => mutate(requestPayload),
    loginIsSuccess: isSuccess,
  };
};

export const useChangePassword = (handleSuccess) => {
  const { data, error, isPending, mutate, isSuccess } = useMutateItem({
    mutationFn: (payload) =>
      httpService.postData(payload, routes.changePassword()),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      handleSuccess(resData);
    },
  });

  return {
    changePasswordData: data?.data || {},
    changePasswordError: error ? ErrorHandler(error) : null,
    changePasswordIsLoading: isPending,
    changePasswordPayload: (requestPayload) => mutate(requestPayload),
    changePasswordIsSuccess: isSuccess,
  };
};

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

export const useEditUserProfile = (handleSuccess) => {
  const { data, error, isPending, mutate, isSuccess } = useMutateItem({
    mutationFn: (payload) =>
      httpService.patchData(payload, routes.editUserProfile()),
    onSuccess: (requestParams) => {
      const resData = requestParams?.data || {};
      handleSuccess(resData);
    },
  });

  return {
    editUserProfileData: data?.data || {},
    editUserProfileError: error ? ErrorHandler(error) : null,
    editUserProfileIsLoading: isPending,
    editUserProfilePayload: (requestPayload) => mutate(requestPayload),
    editUserProfileIsSuccess: isSuccess,
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
  console.log(data);
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

export const useGetVerificationStatus = ({ enabled = false, businessId }) => {
  const {
    data: rawData,
    error,
    isLoading,
    refetch,
    setFilter,
  } = useFetchItem({
    queryKey: ["verify_business", businessId],
    queryFn: async () => {
      if (!businessId) {
        throw new Error("Business ID is required");
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
      httpService.patchDataJson(
        payload,
        routes.createAndUpdateCustomLink(businessId)
      ),
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
