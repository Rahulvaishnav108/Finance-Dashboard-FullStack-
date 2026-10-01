import { PlatformOrder } from "../store/Analytics";

export const exportOrdersAsCSV = (orders: PlatformOrder[]) => {
  const headers = "Transaction_ID,Restaurant,Route,Gross_Amount,Commission,Status\n";
  const rows = orders
    .map(
      (o) =>
        `${o.id},"${o.restaurant}",${o.type},${o.grossAmount},${o.commission},${o.status}`
    )
    .join("\n");

  const blob = new Blob([headers + rows], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute(
    "download",
    `superadmin_franchise_report_${new Date().toISOString().slice(0, 10)}.csv`
  );
  a.click();
  window.URL.revokeObjectURL(url);
};