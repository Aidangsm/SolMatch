import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import SEO from "../components/SEO";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Required"),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  if (user) { navigate(user.role === "INSTALLER" ? "/installer-dashboard" : "/dashboard"); return null; }

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      setError("");
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <SEO title="Sign In" description="Sign in to your SolMatch account to manage quotes, connect with solar installers, and track your solar journey." canonical="/login" />
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-solar-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Sun className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your SolMatch account</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" {...register("email")} className="input" placeholder="you@example.co.za" autoComplete="email" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" {...register("password")} className="input" autoComplete="current-password" />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="flex flex-col items-center gap-2 mt-4">
            <p className="text-sm text-gray-500">
              No account? <Link to="/register" className="text-solar-500 font-medium hover:underline">Create one free</Link>
            </p>
            <Link to="/forgot-password" className="text-sm text-gray-400 hover:text-solar-500">Forgot password?</Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">Demo login: demo@solmatch.co.za / Password1</p>
      </div>
    </div>
  );
}
