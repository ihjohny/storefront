import type { CustomerAnalytics } from "@/lib/api/customer";
import { formatPrice } from "@/lib/utils/format-price";

interface DeviceSecurityWidgetProps {
  analytics: CustomerAnalytics | null;
}

function maskIp(ip?: string): string {
  if (!ip) return "Unknown";
  if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") return "Localhost (Protected)";
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  return ip.slice(0, Math.floor(ip.length / 2)) + "******";
}

function DeviceIcon({ type }: { type?: string }) {
  if (type === "mobile") {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
        <path d="M7 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7Zm3 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
      </svg>
    );
  }
  if (type === "tablet") {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H5Zm5 14.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
      <path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 0 1 4.25 2h11.5A2.25 2.25 0 0 1 18 4.25v8.5A2.25 2.25 0 0 1 15.75 15h-3.19l.74 1.973a.75.75 0 0 1-1.4.527L11.137 15H8.863l-.763 2.5a.75.75 0 0 1-1.4-.527L7.44 15H4.25A2.25 2.25 0 0 1 2 12.75v-8.5Zm2.25-.75a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h11.5a.75.75 0 0 0 .75-.75v-8.5a.75.75 0 0 0-.75-.75H4.25Z" clipRule="evenodd" />
    </svg>
  );
}

export function DeviceSecurityWidget({ analytics }: DeviceSecurityWidgetProps) {
  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total Orders
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {analytics.totalOrders}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Lifetime Spend
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {formatPrice(analytics.totalSpent, analytics.currency)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Account Status
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-sm font-semibold text-foreground">Verified Customer</p>
          </div>
        </div>
      </div>

      {/* Device & IP Security Activity */}
      {analytics.devices && analytics.devices.length > 0 ? (
        <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Recent Order Devices & Security Insights
              </h2>
              <p className="text-xs text-muted-foreground">
                Devices and IP signatures recorded at checkout for fraud prevention
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 self-start sm:self-auto">
              Security Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 font-medium">Device & Browser</th>
                  <th className="pb-2 font-medium">Operating System</th>
                  <th className="pb-2 font-medium">Network IP</th>
                  <th className="pb-2 font-medium">Order Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {analytics.devices.map((device, idx) => (
                  <tr key={idx} className="transition hover:bg-muted/40">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <DeviceIcon type={device.deviceType} />
                        </span>
                        <div>
                          <p className="font-medium text-foreground capitalize">
                            {device.deviceType || "Desktop"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {device.browser || "Unknown Browser"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 font-medium text-foreground">
                      {device.os || "Unknown OS"}
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-muted-foreground">
                      {maskIp(device.ipAddress)}
                    </td>
                    <td className="py-2.5 text-muted-foreground">
                      {device.orderNumber ? (
                        <span className="font-mono text-[11px] font-medium text-foreground">
                          {device.orderNumber}
                        </span>
                      ) : (
                        <span>Verified Checkout</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
