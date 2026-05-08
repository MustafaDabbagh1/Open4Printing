export function generateOrderNumber(): string {
  const date = new Date();
  const yyyymmdd = `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}`;
  const random = Math.floor(Math.random() * 1_000_000).toString().padStart(6, "0");
  return `O4P-${yyyymmdd}-${random}`;
}
