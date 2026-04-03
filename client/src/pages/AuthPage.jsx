import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : form;
      const { data } = await api.post(endpoint, payload);
      login(data.token, data.user);
      toast.success(`Welcome ${data.user.name}`);
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-lg rounded-3xl border border-slate-800 bg-slate-900/70 p-5 md:p-8">
      <h1 className="mb-2 text-2xl font-semibold text-white">User Authentication</h1>
      <p className="mb-6 text-sm text-slate-400">
        Login or create your QuickCargo account.
      </p>
      <div className="mb-4 flex gap-2">
        {["login", "signup"].map((nextMode) => (
          <button
            key={nextMode}
            type="button"
            onClick={() => setMode(nextMode)}
            className={`rounded-full px-4 py-2 text-sm ${
              mode === nextMode
                ? "bg-indigo-500 text-white"
                : "border border-slate-700 text-slate-300"
            }`}
          >
            {nextMode}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && (
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Full name"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm"
            required
          />
        )}
        <input
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="Email address"
          type="email"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm"
          required
        />
        <input
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          placeholder="Password"
          type="password"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-65"
        >
          {loading ? <Loader text="Please wait..." /> : mode === "login" ? "Login" : "Create account"}
        </button>
      </form>
    </section>
  );
};

export default AuthPage;
