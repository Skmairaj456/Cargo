const Loader = ({ text = "Loading..." }) => (
  <div className="flex items-center gap-3 text-slate-300">
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-indigo-400" />
    <span className="text-sm">{text}</span>
  </div>
);

export default Loader;
