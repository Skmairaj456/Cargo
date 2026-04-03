import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import Loader from "../components/Loader";

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/bookings/dashboard");
        setData(response.data);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Please login to view dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;
  if (!data) return <p className="text-sm text-slate-400">No data available.</p>;

  const cardClass = "rounded-2xl border border-slate-800 bg-slate-900/70 p-4";

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <div className={cardClass}>
        <h3 className="mb-3 text-sm font-semibold text-white">Active Bookings</h3>
        <div className="space-y-2">
          {data.activeBookings.length === 0 ? (
            <p className="text-xs text-slate-400">No active bookings</p>
          ) : (
            data.activeBookings.map((booking) => (
              <p key={booking.id} className="text-xs text-slate-300">
                {booking.id} — {booking.status}
                {booking.slot_label ? (
                  <span className="block text-slate-500">
                    {booking.slot_date} · {booking.slot_label}
                    {booking.is_priority ? " · Priority" : ""}
                  </span>
                ) : null}
              </p>
            ))
          )}
        </div>
      </div>
      <div className={cardClass}>
        <h3 className="mb-3 text-sm font-semibold text-white">Past Bookings</h3>
        <div className="space-y-2">
          {data.pastBookings.length === 0 ? (
            <p className="text-xs text-slate-400">No completed bookings</p>
          ) : (
            data.pastBookings.map((booking) => (
              <p key={booking.id} className="text-xs text-slate-300">
                {booking.id} — Rs.{booking.price}
                {booking.slot_label ? (
                  <span className="block text-slate-500">
                    {booking.slot_date} · {booking.slot_label}
                  </span>
                ) : null}
              </p>
            ))
          )}
        </div>
      </div>
      <div className={cardClass}>
        <h3 className="mb-3 text-sm font-semibold text-white">Payment History</h3>
        <div className="space-y-2">
          {data.payments.length === 0 ? (
            <p className="text-xs text-slate-400">No payments yet</p>
          ) : (
            data.payments.map((payment) => (
              <p key={payment.id} className="text-xs text-slate-300">
                #{payment.booking_id_ref} - Rs.{payment.amount} ({payment.status})
              </p>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
