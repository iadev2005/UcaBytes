import React from 'react';

export default function Marketing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-background)] p-8">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-[var(--color-primary-700)]">Marketing Panel</h1>
        <p className="text-[var(--color-primary-600)] text-center">
          Manage your campaigns, ads, and marketing strategies from one place. See the impact of your actions and boost your company's growth.
        </p>
        <div className="w-full bg-[var(--color-primary-100)] rounded-xl p-6 flex flex-col items-center gap-2">
          <span className="text-lg font-semibold text-[var(--color-primary-600)]">Active Campaigns</span>
          <div className="text-[var(--color-primary-400)]">(Your marketing campaigns will appear here)</div>
        </div>
      </div>
    </div>
  );
}
