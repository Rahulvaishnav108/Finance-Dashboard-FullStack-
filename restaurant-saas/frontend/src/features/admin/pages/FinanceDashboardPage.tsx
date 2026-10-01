export default function FinanceDashboardPage(): JSX.Element {
  const financeUrl = import.meta.env.VITE_FINANCE_DASHBOARD_URL || 'http://localhost:3000';

  return (
    <iframe
      title="FinanceOS dashboard"
      src={financeUrl}
      className="block w-full rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
      style={{ height: 'calc(100vh - 7rem)' }}
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}