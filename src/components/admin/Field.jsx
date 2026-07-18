import React from 'react';

export default function Field({ label, value, onChange, type = 'text', required = false, step, as = 'input', children }) {
  const baseClass = 'mt-1.5 w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm text-brown-dark outline-none focus:border-gold-dark transition-colors';

  return (
    <div>
      <label className="text-xs font-semibold text-brown-dark uppercase tracking-wide">{label}</label>
      {as === 'select' ? (
        <select required={required} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={baseClass}>
          {children}
        </select>
      ) : as === 'textarea' ? (
        <textarea
          required={required}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={baseClass}
        />
      ) : (
        <input
          type={type}
          step={step}
          required={required}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      )}
    </div>
  );
}
