import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import Loader from "../components/Loader";

const DriverPage = () => {
  const [phone, setPhone] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [status, setStatus] = useState("accepted");
  const [loading, setLoading] = useState(false);
  const [driver, setDriver] = useState(null);

  const loginDriver = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/drivers/login", { phone });
      setDriver(data.driver);
      localStorage.setItem("quickcargo_driver_token", data.token);
      toast.success(`Welcome driver ${data.driver.name}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Driver login failed");
    } finally {
      setLoading(false);
    }
  };

  const updateRideStatus = async () => {
    setLoading(true);
    try {
      await api.patch("/drivers/ride-status", { bookingId, status });
      toast.success("Ride status updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="mb-3 text-lg font-semibold text-white">Driver Login</h2>
        <p className="mb-4 text-xs text-slate-400">
          Use seeded sample phone: 9000000001 / 9000000002 / 9000000003 / 9000000004
        </p>
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm"
          placeholder="Driver phone"
        />
        <button
          type="button"
          onClick={loginDriver}
          className="w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          {loading ? <Loader text="Logging in..." /> : "Login as Driver"}
        </button>
        {driver && (
          <div className="mt-4 rounded-xl border border-emerald-700 bg-emerald-950/20 p-3 text-sm text-emerald-300">
            {driver.name} | {driver.vehicle_type} | {driver.status}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="mb-3 text-lg font-semibold text-white">Ride Status</h2>
        <input
          value={bookingId}
          onChange={(event) => setBookingId(event.target.value)}
          className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm"
          placeholder="Booking ID (e.g. QC-AB12CD34)"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm"
        >
          <option value="accepted">accepted</option>
          <option value="in_transit">in_transit</option>
          <option value="completed">completed</option>
          <option value="rejected">rejected</option>
        </select>
        <button
          type="button"
          onClick={updateRideStatus}
          className="w-full rounded-xl border border-slate-600 px-4 py-3 text-sm text-slate-100 hover:border-slate-400"
        >
          {loading ? <Loader text="Updating..." /> : "Update Ride Status"}
        </button>
      </div>
    </section>
  );
};

export default DriverPage;
