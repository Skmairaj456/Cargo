import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import TrackingPanel from "../components/TrackingPanel";

const cargoOptions = ["Small", "Medium", "Large", "XL"];

const BookingPage = () => {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    pickup: "",
    drop: "",
    cargoSize: "Small",
    distanceKm: 5,
    helpers: false,
    fragile: false,
    priority: false,
    slotDate: new Date().toISOString().slice(0, 10),
    slotLabel: "",
  });
  const [estimate, setEstimate] = useState(null);
  const [booking, setBooking] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [tracking, setTracking] = useState({
    progress: 0,
    driverPosition: { lat: 12.97, lng: 77.59 },
    etaMinutes: 14,
    status: "waiting",
  });
  const [loading, setLoading] = useState(false);
  const estimatePayload = useMemo(
    () => ({
      cargoSize: form.cargoSize,
      distanceKm: form.distanceKm,
      helpers: form.helpers,
      fragile: form.fragile,
      priority: form.priority,
    }),
    [form.cargoSize, form.distanceKm, form.helpers, form.fragile, form.priority]
  );

  useEffect(() => {
    const getEstimate = async () => {
      try {
        const { data } = await api.post("/pricing/estimate", estimatePayload);
        setEstimate(data);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch fare");
      }
    };
    getEstimate();
  }, [estimatePayload]);

  useEffect(() => {
    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const { data } = await api.get("/bookings/slots", {
          params: { date: form.slotDate, cargoSize: form.cargoSize },
        });
        setSlots(data.slots);
        const firstAvailable = data.slots.find((slot) => slot.isAvailable);
        setForm((prev) => ({
          ...prev,
          slotLabel:
            data.slots.some((slot) => slot.slotLabel === prev.slotLabel && slot.isAvailable)
              ? prev.slotLabel
              : firstAvailable?.slotLabel || "",
        }));
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch slots");
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [form.slotDate, form.cargoSize]);

  useEffect(() => {
    if (!booking) return undefined;
    const timer = setInterval(async () => {
      const { data } = await api.get("/bookings/tracking", {
        params: { progress: tracking.progress },
      });
      setTracking(data);
      if (data.progress >= 100) {
        clearInterval(timer);
      }
    }, 2500);

    return () => clearInterval(timer);
  }, [booking, tracking.progress]);

  const confirmBooking = async () => {
    if (!isAuthenticated) {
      toast.error("Please login first");
      return;
    }
    if (!form.slotLabel) {
      toast.error("Please choose an available slot");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/bookings", form);
      setBooking(data);
      toast.success(`Booking confirmed: ${data.booking.id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Book Your Truck</h2>
        <div className="space-y-3">
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm"
            placeholder="Pickup location"
            value={form.pickup}
            onChange={(event) => setForm({ ...form, pickup: event.target.value })}
          />
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm"
            placeholder="Drop location"
            value={form.drop}
            onChange={(event) => setForm({ ...form, drop: event.target.value })}
          />
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm"
            placeholder="Distance (km)"
            type="number"
            min={1}
            value={form.distanceKm}
            onChange={(event) => setForm({ ...form, distanceKm: Number(event.target.value) })}
          />
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm"
            type="date"
            value={form.slotDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(event) => setForm({ ...form, slotDate: event.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            {cargoOptions.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setForm({ ...form, cargoSize: item })}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  form.cargoSize === item
                    ? "border-indigo-500 bg-indigo-500/20 text-white"
                    : "border-slate-700 text-slate-300"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.helpers}
              onChange={(event) => setForm({ ...form, helpers: event.target.checked })}
            />
            Need helpers (+Rs.200)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.fragile}
              onChange={(event) => setForm({ ...form, fragile: event.target.checked })}
            />
            Fragile handling (+Rs.100)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.priority}
              onChange={(event) => setForm({ ...form, priority: event.target.checked })}
            />
            Priority service (+Rs.180)
          </label>
          <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-300">Available slots</p>
            {slotsLoading ? (
              <Loader text="Fetching slots..." />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.slotLabel}
                    type="button"
                    disabled={!slot.isAvailable}
                    onClick={() => setForm({ ...form, slotLabel: slot.slotLabel })}
                    className={`rounded-lg border px-2 py-2 text-xs ${
                      form.slotLabel === slot.slotLabel
                        ? "border-indigo-500 bg-indigo-500/20 text-white"
                        : slot.isAvailable
                          ? "border-slate-700 text-slate-300"
                          : "cursor-not-allowed border-slate-800 text-slate-600"
                    }`}
                  >
                    {slot.slotLabel} ({slot.available} left)
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={confirmBooking}
            disabled={loading}
            className="w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-70"
          >
            {loading ? <Loader text="Confirming..." /> : "Confirm Booking"}
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          <h3 className="mb-3 text-base font-semibold text-white">Instant Price</h3>
          {estimate ? (
            <div className="space-y-2 text-sm text-slate-300">
              <p>Vehicle: {estimate.vehicleType}</p>
              <p>Rate: Rs.{estimate.perKmRate}/km</p>
              <p>Distance: {estimate.distanceKm} km</p>
              <p>Optional: Rs.{estimate.optionalCharges}</p>
              <p>Priority: Rs.{estimate.priorityFee}</p>
              <p className="text-lg font-bold text-white">Total: Rs.{estimate.total}</p>
            </div>
          ) : (
            <Loader text="Calculating fare..." />
          )}
        </div>

        {booking && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-700 bg-emerald-950/30 p-4">
              <p className="text-sm text-emerald-300">Booking ID: {booking.booking.id}</p>
              <p className="text-sm text-slate-200">Driver: {booking.driver.name}</p>
              <p className="text-xs text-slate-300">Vehicle: {booking.driver.vehicle_type}</p>
              <p className="text-xs text-slate-300">
                Slot: {booking.booking.slot_date} | {booking.booking.slot_label}
              </p>
            </div>
            <TrackingPanel tracking={tracking} />
          </div>
        )}
      </section>
    </div>
  );
};

export default BookingPage;
