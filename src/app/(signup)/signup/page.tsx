"use client";

import { ErrorMessage } from "@hookform/error-message";
import { FormButton } from "@/components/authForm/FormButton";
import { LinkText } from "@/components/authForm/LinkText";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as yup from "yup";
import { LuXCircle } from "react-icons/lu";
import OtpInput from "react-otp-input";
import Modal from "@/components/Modal";
import LoadingModal from "@/components/authForm/LoadingModal";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

// TS types
type RequestObjectType = {
  username: FormDataEntryValue;
  password: FormDataEntryValue;
  full_name: string;
  is_pool: boolean;
  link: boolean;
  ref: string;
  types: string;
};

type RegisterUser = {
  username: string;
  password: string;
  "referral-id": string | null | undefined;
  agreeTerms: boolean | undefined;
};

//yup schema
const registerSchema = yup
  .object({
    username: yup
      .string()
      .required("Please enter your email address")
      .email("Please enter a valid email"),
    password: yup.string().required("Please enter a password").min(8),
    "referral-id": yup.string().nullable(),
    agreeTerms: yup
      .boolean()
      .oneOf([true], "Please accept our Terms of Service and Privacy policy"),
  })
  .required();

  // Alert component
  const AlertMessage = ({ message }: { message: string }) => {
    return (
      <Alert className="fixed top-6 w-[22rem] left-[calc(50vw_-_11rem)] bg-yellow-400 z-[1100]">
        <ExclamationTriangleIcon className="w-4 h-4" />
        <AlertTitle>Notice!</AlertTitle>
        <button
          onClick={() => setAlert(false)}
          className="absolute right-2 top-2"
        >
          <LuXCircle className="w-5 h-5" />
        </button>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  };

export default function Signup() {
  const router = useRouter();

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [messageToken, setMessageToken] = useState("");
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [requestObject, setRequestObject] = useState<RequestObjectType>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterUser>({
    resolver: yupResolver(registerSchema),
    mode: "onSubmit",
  });

  
  // OTP action
  useEffect(() => {
    if (otp.length === 8) {
      console.log("verifying OTP");
      setLoading(true);
      handleOTPValidation();
    }
  }, [otp]);

  // Execute fetch once requestObject is updated to ensure we use latest data
  useEffect(() => {
    async function fetchdata() {
      const data = await handleSignUpRequest();

      if (data.msg) {
        setMessageToken(data.msg);
        setLoading(false);
        setShow(true);
      }

      if (data.detail) {
        setAlertMessage(data.detail);
        setAlert(true);
        setLoading(false);
      }
    }

    if (requestObject) {
      fetchdata();
    }
  }, [requestObject]);

  //handle OTP Validation
  const handleOTPValidation = () => {
    fetch("https://api.trustauthx.com/verify_email/false", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        otp,
        add: messageToken,
        types: "email",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        if (data.status === 200 && data.is_ok === true) {
          router.push("/");
        }
        if (data.detail) {
          setAlertMessage(data.detail);
          setAlert(true);
        }
      })
      .catch((err) => console.log(err));
  };

  // Handle resend OTP email
  const resendEmail = async () => {
    setLoading(true);
    const data = await handleSignUpRequest();
    if (data.msg) {
      setMessageToken(data.msg);
      setLoading(false);
      setShow(true);
    }

    if (data.detail) {
      setAlertMessage(data.detail);
      setAlert(true);
      setLoading(false);
    }
  };

  // Signup request
  const handleSignUpRequest = async () => {
    return await fetch("https://api.trustauthx.com/signup", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestObject),
    })
      .then((response) => response.json())
      .catch((err) => console.log(err));
  };

  // form submit handler
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsedData = Object.fromEntries(formData.entries());
    const reqObject = {
      username: parsedData.username,
      password: parsedData.password,
      full_name: "Test User",
      is_pool: true,
      link: true,
      ref: "string",
      types: "string",
    };

    setAlert(false);
    if (!parsedData.agreeTerms) {
      setAlertMessage("Please accept our Terms of Service and Privacy Policy!");
      setAlert(true);
      return;
    }

    setRequestObject(reqObject);
    setLoading(true);
  };

  return (
    <>
      <div className="login-wrapper form-wrapper">
        <form
          onSubmit={handleFormSubmit}
          // className="was-validated"
        >
          <div className="form-group relative">
            <label
              htmlFor="email"
              className={`form-label absolute translate-x-6 translate-y-[-12px] bg-white px-2 ${
                errors.username && "text-red-600"
              }`}
            >
              Email
            </label>
            <input
              {...register("username")}
              id="email"
              type="text"
              className={`form-control w-full px-8 py-3 border rounded-lg ${
                errors.username ? "border-red-600" : "border-slate-500"
              }`}
              placeholder="name@example.com"
            />
            <ErrorMessage
              errors={errors}
              name="username"
              render={({ message }) => (
                <p className="text-red-600 pl-8">{message}</p>
              )}
            />
          </div>

          <div className="form-group mt-8 md:mt-11 relative">
            <label
              htmlFor="password"
              className={`form-label absolute translate-x-6 translate-y-[-12px] bg-white px-2 ${
                errors.password && "text-red-600"
              }`}
            >
              Password
            </label>
            <input
              {...register("password")}
              id="password"
              type="password"
              className={`form-control w-full px-8 py-3 border rounded-lg ${
                errors.password ? "border-red-600" : "border-slate-500"
              }`}
              placeholder="Enter password"
            />
            <ErrorMessage
              errors={errors}
              name="password"
              render={({ message }) => (
                <p className="text-red-600 pl-8">{message}</p>
              )}
            />
          </div>

          <div className="form-group mt-8 md:mt-11 relative">
            <label
              htmlFor="referral-id"
              className="form-label absolute translate-x-6 translate-y-[-12px] bg-white px-2"
            >
              Referral ID (Optional)
            </label>
            <input
              {...register("referral-id")}
              id="referral-id"
              type="text"
              className="form-control w-full px-8 py-3 border border-slate-500 rounded-lg"
              placeholder="Referral-ID"
            />
          </div>

          <div className="form-group">
            <div className="d-grid start">
              <FormButton>Next</FormButton>
            </div>
          </div>

          <div className="flex items-center mt-8 md:mt-11">
            <input
              {...register("agreeTerms")}
              id="terms"
              type="checkbox"
              className={`checkbox-customized w-7 h-7 cursor-pointer ${
                errors.agreeTerms && "border-red-600"
              }`}
            />
            <label
              htmlFor="terms"
              className="ml-5 text-sm font-medium tracking-[.13em] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and agree to Flitchcoin's{" "}
              <a className="underline underline-offset-2" href="#">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline underline-offset-2">
                Privacy Policy
              </a>
            </label>
          </div>
          <ErrorMessage
            errors={errors}
            name="agreeTerms"
            render={({ message }) => (
              <p className="text-red-600 pl-10 mt-2">{message}</p>
            )}
          />

          <div className="ats-content mt-8 md:mt-11">
            <p className="mb-0 text-xl flex items-center flex-wrap">
              I already have an AuthX account
              <LinkText to="/">advance to Login</LinkText>
            </p>
          </div>
        </form>
      </div>
      {alert && <AlertMessage message={alertMessage} />}

      <Modal
        show={show}
        onHide={() => setShow(false)}
        backdrop="static"
        keyboard={false}
        className="modal-dialog-popup"
      >
        <div className="bg-white rounded-3xl p-16">
          <p className="font-light">
            Please check your email for a registration link or OTP. You can
            register any way by clicking on the{" "}
            <span className="text_design">link in E-mail </span>or{" "}
            <span className="text_design">by entering OTP </span>in the
            designated column. If you didn't receive an email, you can click I
            didn't receive any email.
          </p>
          <div className="row">
            <div className="col-lg-2"></div>
            <div className="">
              <div className="number_input">
                <div className="text-3xl my-11">Enter e-mail OTP</div>
                <OtpInput
                  containerStyle="flex justify-center gap-1"
                  inputStyle="otp-input-width h-12 p-0 text-center rounded-xl"
                  value={otp}
                  onChange={setOtp}
                  numInputs={8}
                  renderSeparator={<span></span>}
                  renderInput={(props) => <input {...props} />}
                />
              </div>
              <div className="row">
                <div className="col-lg-10 text-start">
                  <button
                    className="mt-16 p-0 bg-transparent font-['Lexend'] font-normal down-button"
                    onClick={resendEmail}
                  >
                    I didn't receive Email
                    <span className="modal-arr pl-2">›</span>
                  </button>
                </div>
                <div className="col-lg-2"></div>
              </div>
            </div>
            <div className="col-lg-2"></div>
          </div>
        </div>
      </Modal>

      <LoadingModal show={loading} />
    </>
  );
}
