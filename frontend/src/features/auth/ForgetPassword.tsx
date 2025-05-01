import { useForm } from "react-hook-form";
import AuthService from "../../services/authService";
import { useState } from "react";

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (data: { email: string }) => {
    try {
      setMessage("");
      setError("");
      await AuthService.sendResetPasswordEmail(data.email);
      setMessage("✅ Check your email for a password reset link.");
    } catch (err: any) {
      setError(err.response?.data?.message || "❌ Failed to send reset link.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-semibold text-center text-black mb-2">
          IntelliPath
        </h1>
        <h2 className="text-xl text-center text-gray-700 mb-6">
          Forgot Password
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              placeholder="Enter your email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Enter a valid email",
                },
              })}
              className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-black focus:outline-none"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-black text-white py-3 rounded-md font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-green-600 text-center">{message}</p>
        )}
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
}
