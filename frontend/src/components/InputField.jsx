/**
 * Reusable form input field with label, icon, and error state.
 */
export default function InputField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  autoComplete,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Icon className="h-[18px] w-[18px] text-slate-400" />
          </div>
        )}
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`
            block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900
            placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
            transition-colors duration-150
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-400 focus:ring-red-500/40 focus:border-red-500' : 'border-slate-300'}
          `}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
