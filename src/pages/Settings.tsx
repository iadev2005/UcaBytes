import React from 'react';

export default function Settings() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-primary-50)] p-8">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-[var(--color-primary-700)]">Settings</h1>
        <p className="text-[var(--color-primary-600)] text-center">
          Adjust your account and platform preferences and parameters.
        </p>
        <div className="w-full bg-[var(--color-primary-100)] rounded-xl p-6 flex flex-col items-center gap-2">
          <span className="text-lg font-semibold text-[var(--color-primary-600)]">Preferences</span>
          <div className="text-[var(--color-primary-400)]">(Here you can modify your account settings)</div>
        </div>
      </div>
    </div>
  );
} 