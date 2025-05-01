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
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-black text-white py-3 rounded-md disabled:opacity-50"
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
