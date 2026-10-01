import { type ReactNode } from 'react';
import { type LucideIcon, LogOut, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

type AppShellProps = {
  title: string;
  subtitle: string;
  accent: string;
  stats: Array<{
    label: string;
    value: string;
    icon: LucideIcon;
  }>;
  children: ReactNode;
};

const roleLinks = [
  { label: 'Customer', to: '/customer' },
  { label: 'Staff', to: '/staff' },
  { label: 'Kitchen', to: '/kitchen' },
  { label: 'Cleaning', to: '/cleaning' },
  { label: 'Admin', to: '/admin' },
  { label: 'Super Admin', to: '/super-admin' },
];

export function AppShell({ title, subtitle, accent, stats, children }: AppShellProps): JSX.Element {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_30%),linear-gradient(160deg,#0f172a_0%,#111827_35%,#1f2937_100%)] text-stone-50">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-amber-200">
                <Sparkles className="h-4 w-4" />
                Restaurant Automation SaaS
              </div>
              <div>
                <h1 className={`bg-gradient-to-r ${accent} bg-clip-text text-4xl font-black text-transparent sm:text-5xl`}>
                  {title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">{subtitle}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Signed in as</p>
                <p className="mt-1 text-lg font-semibold">{user?.name}</p>
                <p className="text-sm text-slate-400">{user?.restaurantName}</p>
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20"
                onClick={() => signOut()}
                type="button"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </header>

        <nav className="mb-8 flex flex-wrap gap-3">
          {roleLinks.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-amber-300 text-slate-950'
                    : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                }`
              }
              to={link.to}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <section className="grid gap-4 md:grid-cols-3">
          {stats.map(({ icon: Icon, label, value }) => (
            <article key={label} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">{label}</p>
                <Icon className="h-5 w-5 text-amber-200" />
              </div>
              <p className="mt-4 text-3xl font-bold">{value}</p>
            </article>
          ))}
        </section>

        <main className="mt-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
