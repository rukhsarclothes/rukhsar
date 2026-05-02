export default function ResetPasswordPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-sm">
        <h1 className="font-serif text-4xl text-[color:var(--rukhsar-maroon)]">Reset Password</h1>
        <div className="mt-6 space-y-4">
          <input className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm" placeholder="New password" />
          <input className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm" placeholder="Confirm password" />
          <button className="w-full rounded-full bg-[color:var(--rukhsar-maroon)] px-6 py-3 text-sm font-semibold text-[color:var(--rukhsar-ivory)]">
            Update Password
          </button>
        </div>
      </div>
    </section>
  );
}
