export default function ForgotPasswordPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-sm">
        <h1 className="font-serif text-4xl text-[color:var(--rukhsar-maroon)]">Forgot Password</h1>
        <input className="mt-6 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm" placeholder="Email address" />
        <button className="mt-4 w-full rounded-full bg-[color:var(--rukhsar-maroon)] px-6 py-3 text-sm font-semibold text-[color:var(--rukhsar-ivory)]">
          Send Reset Link
        </button>
      </div>
    </section>
  );
}
