/**
 * StatusBadge — Color-coded customer status indicator.
 */

const STATUS_STYLES = {
  New: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "On Hold": "bg-amber-50 text-amber-700 ring-amber-600/20",
  Matched: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  Closed: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.New;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {status}
    </span>
  );
}
