import { motion } from "framer-motion";

const TrackingPanel = ({ tracking }) => {
  const AnimatedDiv = motion.div;
  const positionStyle = {
    left: `${Math.min(tracking.progress, 100)}%`,
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="text-slate-300">Driver live tracking</span>
        <span className="text-emerald-300">{tracking.status}</span>
      </div>
      <div className="relative mb-4 h-3 w-full rounded-full bg-slate-700">
        <AnimatedDiv
          className="h-3 rounded-full bg-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${tracking.progress}%` }}
        />
        <AnimatedDiv
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-200 bg-indigo-400 shadow-lg shadow-indigo-500/50"
          animate={positionStyle}
          transition={{ duration: 0.4 }}
        />
      </div>
      <p className="text-xs text-slate-400">
        ETA: {tracking.etaMinutes} mins | GPS: {tracking.driverPosition.lat.toFixed(3)},
        {tracking.driverPosition.lng.toFixed(3)}
      </p>
    </div>
  );
};

export default TrackingPanel;
