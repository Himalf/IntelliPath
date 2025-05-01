import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router-dom";
import AuthService from "../../services/authService";
import { useState } from "react";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const email = params.get("email") || "";
  const token = params.get("token") || "";

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<{
    newPassword: string;
    confirmPassword: string;
  }>();

  const onSubmit = async (data: { newPassword: string }) => {
    try {
      setMessage("");
      setError("");
      await AuthService.resetPassword(email, token, data.newPassword);
      setMessage("✅ Password reset successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "❌ Reset failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            {...register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 6,
                message: "Minimum 6 characters",
              },
            })}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          {errors.newPassword && (
            <p className="text-sm text-red-500">{errors.newPassword.message}</p>
          )}

          <input
            type="password"
            placeholder="Confirm password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === watch("newPassword") || "Passwords do not match",
            })}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-black text-white py-3 rounded-md disabled:opacity-50"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
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
