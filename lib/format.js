export function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCategoryLabel(value = "") {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getLatestTransactionDate(transactions = []) {
  if (!transactions.length) return new Date();

  return transactions.reduce((latest, transaction) => {
    const date = new Date(transaction.date);
    return date > latest ? date : latest;
  }, new Date(transactions[0].date));
}

export function getMonthLabel(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
