import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { api } from "../lib/api";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await api.post("/auth/forgot", data);
    setSent(true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-solar-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 text-solar-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Reset your password</h1>
          <p className="text-gray-500 text-sm mt-1">We'll send a reset link to your email</p>
        </div>

        <div className="card p-6">
          {sent ? (
            <div className="text-center py-4">
              <p className="text-gray-700 mb-1 font-medium">Check your inbox</p>
              <p className="text-sm text-gray-500 mb-4">If that email is registered, a reset link is on its way. Check your spam folder too.</p>
              <Link to="/login" className="btn-primary w-full justify-center">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input type="email" {...register("email")} className="input" placeholder="you@example.co.za" autoComplete="email" />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-solar-500 hover:underline">Back to Login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
