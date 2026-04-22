import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { api } from "../lib/api";

const schema = z.object({
  password: z.string().min(8, "Min 8 characters").regex(/[A-Z]/, "Must contain uppercase").regex(/[0-9]/, "Must contain a number"),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const token = searchParams.get("token") || "";

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Invalid reset link. Please request a new one.</p>
          <Link to="/forgot-password" className="btn-primary">Request Reset</Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    try {
      setError("");
      await api.post("/auth/reset", { token, password: data.password });
      navigate("/login?reset=success");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || "Reset failed. The link may have expired.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-solar-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <LockKeyhole className="w-6 h-6 text-solar-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Set new password</h1>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" {...register("password")} className="input" autoComplete="new-password" />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              <p className="text-xs text-gray-400 mt-1">Min 8 chars, 1 uppercase, 1 number</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" {...register("confirm")} className="input" autoComplete="new-password" />
              {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm.message}</p>}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
