import { DollarSign, Clock, TrendingUp } from "lucide-react";

export default function KpiCards({
  available,
  pending,
  projected
}: {
  available: string;
  pending: string;
  projected: string;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {/* Available Cash Card */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-emerald-100">Available Cash</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{available}</div>
          <div className="mt-2 text-sm text-emerald-100/80">Posted transactions only</div>
        </div>
      </div>

      {/* Pending Card */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-amber-100">Pending</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{pending}</div>
          <div className="mt-2 text-sm text-amber-100/80">Awaiting clearance</div>
        </div>
      </div>

      {/* Projected Card */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-violet-100">Projected</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{projected}</div>
          <div className="mt-2 text-sm text-violet-100/80">Available + Pending</div>
        </div>
      </div>
    </div>
  );
}
