import crypto from "crypto";

const isSandbox = () => process.env.NODE_ENV !== "production";

export const PAYFAST_URL = () =>
  isSandbox()
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";

function paramsToString(params: Record<string, string>, exclude: string[] = []): string {
  return Object.keys(params)
    .filter(k => !exclude.includes(k) && params[k] !== "")
    .sort()
    .map(k => `${k}=${encodeURIComponent(params[k].trim()).replace(/%20/g, "+")}`)
    .join("&");
}

function sign(params: Record<string, string>): string {
  const passphrase = process.env.PAYFAST_PASSPHRASE;
  let str = paramsToString(params, ["signature"]);
  if (passphrase) str += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
  return crypto.createHash("md5").update(str).digest("hex");
}

export function buildPaymentParams(opts: {
  paymentId: string;
  amount: number;
  itemName: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}): Record<string, string> {
  const params: Record<string, string> = {
    merchant_id: isSandbox() ? "10000100" : (process.env.PAYFAST_MERCHANT_ID ?? ""),
    merchant_key: isSandbox() ? "46f0cd694581a" : (process.env.PAYFAST_MERCHANT_KEY ?? ""),
    return_url: opts.returnUrl,
    cancel_url: opts.cancelUrl,
    notify_url: opts.notifyUrl,
    m_payment_id: opts.paymentId,
    amount: opts.amount.toFixed(2),
    item_name: opts.itemName,
  };
  params.signature = sign(params);
  return params;
}

export async function verifyITN(pfData: Record<string, string>): Promise<boolean> {
  const expected = sign(pfData);
  if (pfData.signature !== expected) return false;

  // Skip server-side validation in sandbox — PayFast can't reach localhost
  if (isSandbox()) return true;

  const body = paramsToString(pfData, ["signature"]);
  try {
    const res = await fetch("https://www.payfast.co.za/eng/query/validate", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    return (await res.text()).trim() === "VALID";
  } catch {
    return false;
  }
}
