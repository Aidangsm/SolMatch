import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import SEO from "../components/SEO";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  role: z.enum(["HOMEOWNER", "INSTALLER"]),
  password: z.string().min(8, "Min 8 characters").regex(/[A-Z]/, "Must contain uppercase").regex(/[0-9]/, "Must contain a number"),
  consentGiven: z.boolean().refine((v) => v === true, "You must accept the terms to continue"),
});
type FormData = z.infer<typeof schema>;

export default function Register() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "HOMEOWNER" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError("");
      await authRegister(data);
      navigate(data.role === "INSTALLER" ? "/installer-dashboard" : "/dashboard");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <SEO title="Create Account" description="Join SolMatch free — get solar ROI estimates and connect with verified solar installers across South Africa." canonical="/register" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-solar-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Sun className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Free to join — no credit card needed</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input {...register("firstName")} className="input" />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input {...register("lastName")} className="input" />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" {...register("email")} className="input" autoComplete="email" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
              <input {...register("phone")} className="input" placeholder="+27 82 000 0000" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-2">
                {(["HOMEOWNER", "INSTALLER"] as const).map(role => (
                  <label key={role} className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-solar-400 transition-colors">
                    <input type="radio" value={role} {...register("role")} className="accent-solar-500" />
                    <span className="text-sm font-medium capitalize">{role.toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" {...register("password")} className="input" autoComplete="new-password" />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              <p className="text-xs text-gray-400 mt-1">Min 8 chars, 1 uppercase, 1 number</p>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" {...register("consentGiven")} className="mt-0.5 w-4 h-4 accent-solar-500 rounded shrink-0" />
              <span className="text-xs text-gray-600">
                I agree to SolMatch's <Link to="/terms" target="_blank" className="text-solar-500 underline">Terms of Service</Link> and <Link to="/privacy" target="_blank" className="text-solar-500 underline">Privacy Policy</Link>, and consent to the processing of my personal information in accordance with POPIA.
              </span>
            </label>
            {errors.consentGiven && <p className="text-xs text-red-500">{errors.consentGiven.message}</p>}

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account? <Link to="/login" className="text-solar-500 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
