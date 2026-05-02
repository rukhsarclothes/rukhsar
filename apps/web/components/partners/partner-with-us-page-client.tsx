"use client";

import { useMemo, useState } from "react";

const benefits = [
  {
    title: "Reach a serious saree audience",
    description: "Sell to customers across India who already come to Rukhsar looking for premium and occasion-led sarees."
  },
  {
    title: "Low-friction launch",
    description: "Start with a simple onboarding process, clear catalog requirements, and no heavy setup burden."
  },
  {
    title: "Marketing that helps you move inventory",
    description: "We spotlight strong products through campaigns, styling stories, festive edits, and demand generation."
  },
  {
    title: "Reliable payout confidence",
    description: "Structured payment cycles, verified orders, and a premium platform experience designed for long-term trust."
  },
  {
    title: "Operational support",
    description: "Get help with product presentation, listing standards, and order-handling workflows that reduce friction."
  },
  {
    title: "Grow with a premium brand",
    description: "Position your sarees alongside a curated, quality-first label that respects craft, finish, and customer trust."
  }
];

const growthStats = [
  { value: "10,000+", label: "monthly browsing customers" },
  { value: "3X", label: "average seller growth potential" },
  { value: "7 days", label: "target onboarding turnaround" },
  { value: "Pan-India", label: "shipping demand coverage" }
];

const applicantTypes = [
  "Saree manufacturers",
  "Wholesalers",
  "Boutique owners",
  "Handloom artisans"
];

const processSteps = [
  { title: "Apply", description: "Share your business details, product categories, and sample catalog." },
  { title: "Get approved", description: "Our team reviews brand fit, quality standards, and supply readiness." },
  { title: "Upload products", description: "We help prepare listings that look premium and convert with trust." },
  { title: "Start selling", description: "Go live on Rukhsar and begin receiving customer demand from across India." }
];

const productTypeOptions = [
  "Banarasi",
  "Kanjivaram",
  "Organza",
  "Silk",
  "Cotton",
  "Tissue",
  "Chiffon",
  "Linen",
  "Designer Sarees",
  "Festive Sarees"
];

const testimonials = [
  {
    quote:
      "Rukhsar helped us present our sarees more beautifully online. The quality of inquiries improved almost immediately.",
    name: "Aditi Saree House",
    role: "Surat wholesaler"
  },
  {
    quote:
      "The platform feels premium, and that changes the kind of customer who discovers our catalog. We see stronger order confidence.",
    name: "Meera Weaves",
    role: "Banarasi supplier"
  },
  {
    quote:
      "We appreciated the fast communication, onboarding clarity, and the focus on building long-term brand value instead of quick discounting.",
    name: "Varnika Loom Studio",
    role: "Handloom boutique"
  }
];

const trustBadges = ["Seller-first onboarding", "Secure payouts", "Pan-India reach", "Premium merchandising"];

const faqs = [
  {
    question: "What is the commission structure?",
    answer:
      "Commission is aligned to category, order value, and operational support required. Approved partners receive a clear commercial sheet during onboarding."
  },
  {
    question: "When do sellers get paid?",
    answer:
      "Payments are processed on a defined payout cycle after order confirmation, subject to return and reconciliation windows communicated during onboarding."
  },
  {
    question: "How are returns handled?",
    answer:
      "Rukhsar coordinates customer communication and process clarity. Final operational responsibility is shared according to the product and fulfillment model."
  },
  {
    question: "Does Rukhsar help with logistics?",
    answer:
      "Yes. We support partners with shipping workflow guidance and fulfillment coordination so deliveries remain smooth and customer-ready."
  },
  {
    question: "How long does approval take?",
    answer:
      "Most qualified applications are reviewed within 3 to 7 business days, depending on catalog completeness and verification needs."
  }
];

type FormState = {
  fullName: string;
  businessName: string;
  phoneNumber: string;
  email: string;
  cityState: string;
  businessType: string;
  monthlyInventoryCapacity: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState | "productTypes" | "catalog", string>>;

const initialFormState: FormState = {
  fullName: "",
  businessName: "",
  phoneNumber: "",
  email: "",
  cityState: "",
  businessType: "",
  monthlyInventoryCapacity: "",
  message: ""
};

export function PartnerWithUsPageClient() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [catalogFile, setCatalogFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

  const isFormValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  function toggleProductType(option: string) {
    setSelectedProductTypes((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option]
    );
  }

  function validateForm(nextForm: FormState, nextProductTypes: string[], nextCatalogFile: File | null) {
    const nextErrors: FormErrors = {};

    if (nextForm.fullName.trim().length < 2) {
      nextErrors.fullName = "Enter your full name.";
    }
    if (nextForm.businessName.trim().length < 2) {
      nextErrors.businessName = "Enter your business name.";
    }
    if (!/^\d{10,15}$/.test(nextForm.phoneNumber.replace(/\s+/g, ""))) {
      nextErrors.phoneNumber = "Enter a valid phone or WhatsApp number.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextForm.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (nextForm.cityState.trim().length < 2) {
      nextErrors.cityState = "Enter your city and state.";
    }
    if (!nextForm.businessType) {
      nextErrors.businessType = "Select your business type.";
    }
    if (nextProductTypes.length === 0) {
      nextErrors.productTypes = "Select at least one product type.";
    }
    if (!nextForm.monthlyInventoryCapacity) {
      nextErrors.monthlyInventoryCapacity = "Select your monthly inventory capacity.";
    }
    if (nextCatalogFile && nextCatalogFile.size > 5 * 1024 * 1024) {
      nextErrors.catalog = "Catalog file should be 5 MB or smaller.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(form, selectedProductTypes, catalogFile);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("Please fix the highlighted fields before submitting.");
      return;
    }

    const payload = new FormData();
    payload.append("fullName", form.fullName);
    payload.append("businessName", form.businessName);
    payload.append("phoneNumber", form.phoneNumber);
    payload.append("email", form.email);
    payload.append("cityState", form.cityState);
    payload.append("businessType", form.businessType);
    payload.append("productTypes", JSON.stringify(selectedProductTypes));
    payload.append("monthlyInventoryCapacity", form.monthlyInventoryCapacity);
    payload.append("message", form.message);
    if (catalogFile) {
      payload.append("catalog", catalogFile);
    }

    setSubmitting(true);
    setStatus("Submitting your application...");

    try {
      const response = await fetch(`${apiBaseUrl}/partners/apply`, {
        method: "POST",
        body: payload
      });

      const data = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Could not submit partner application");
      }

      setForm(initialFormState);
      setSelectedProductTypes([]);
      setCatalogFile(null);
      setErrors({});
      setStatus(data.message ?? "Application submitted successfully.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not submit partner application");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="overflow-hidden">
      <section className="section-shell relative py-10 md:py-14">
        <div className="absolute inset-x-0 top-0 -z-10 h-[30rem] rounded-[2.5rem] bg-[radial-gradient(circle_at_20%_20%,rgba(194,161,90,0.28),transparent_30%),linear-gradient(135deg,rgba(66,20,25,0.98),rgba(90,30,34,0.92)_35%,rgba(132,82,34,0.88)_100%)]" />
        <div className="grid gap-8 overflow-hidden rounded-[2.5rem] border border-white/10 px-6 py-10 text-[color:var(--rukhsar-ivory)] shadow-[0_30px_80px_rgba(53,18,21,0.22)] md:px-10 md:py-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.42em] text-[rgba(248,241,231,0.7)]">Seller Partner Program</p>
            <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
              Sell Your Sarees to Thousands of Customers Across India
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[rgba(248,241,231,0.82)] md:text-lg">
              Join Rukhsar as a Seller Partner and Grow Your Business Faster with premium storytelling, demand generation,
              and a customer base that already values craftsmanship.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#partner-application" className="cta-primary bg-[color:var(--rukhsar-ivory)] text-[color:var(--rukhsar-maroon)] hover:-translate-y-0.5">
                Apply to Become a Partner
              </a>
              <a href="#how-it-works" className="cta-secondary border-white/20 bg-white/10 text-[color:var(--rukhsar-ivory)] hover:bg-white/14">
                See how it works
              </a>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                "Premium saree audience",
                "Pan-India demand",
                "Fast partner onboarding"
              ].map((item) => (
                <div key={item} className="rounded-[1.4rem] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur transition hover:-translate-y-1 hover:bg-white/12">
                  <p className="text-sm font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 self-end md:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[2rem] border border-white/10 bg-[rgba(248,241,231,0.08)] p-6 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.28em] text-[rgba(248,241,231,0.62)]">Why suppliers join</p>
              <p className="mt-4 font-serif text-3xl">A premium route to sustainable online growth</p>
              <p className="mt-4 text-sm leading-7 text-[rgba(248,241,231,0.76)]">
                We help strong saree businesses present their work beautifully, convert with trust, and scale beyond local circles.
              </p>
            </div>
            <div className="rounded-[2rem] bg-[linear-gradient(180deg,rgba(248,241,231,0.14),rgba(248,241,231,0.05))] p-6 shadow-inner">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                {growthStats.map((stat) => (
                  <div key={stat.label} className="rounded-[1.4rem] border border-white/10 bg-[rgba(255,255,255,0.06)] p-4 transition hover:-translate-y-1">
                    <p className="font-serif text-3xl text-[color:var(--rukhsar-ivory)]">{stat.value}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[rgba(248,241,231,0.68)]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-14">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Why Partner With Rukhsar</p>
            <h2 className="mt-3 font-serif text-4xl text-[color:var(--rukhsar-maroon)]">Built to help serious saree businesses grow with confidence</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-stone-600">
            From onboarding to merchandising and demand generation, the platform is designed to make premium sarees easier to discover and trust online.
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {benefits.map((benefit, index) => (
            <article key={benefit.title} className="surface-card group p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(90,30,34,0.08)] text-[color:var(--rukhsar-maroon)]">
                  <span className="font-serif text-xl">{index + 1}</span>
                </div>
                <h3 className="font-serif text-2xl text-[color:var(--rukhsar-maroon)]">{benefit.title}</h3>
              </div>
              <p className="mt-4 text-sm leading-7 text-stone-600">{benefit.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell py-6">
        <div className="surface-card overflow-hidden bg-[linear-gradient(135deg,rgba(90,30,34,0.98),rgba(133,92,45,0.95))] p-8 text-[color:var(--rukhsar-ivory)] md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[rgba(248,241,231,0.64)]">Growth Promise</p>
              <h2 className="mt-4 font-serif text-4xl">Rukhsar is built to move sellers from presence to momentum</h2>
              <p className="mt-5 text-sm leading-8 text-[rgba(248,241,231,0.78)]">
                Strong supply deserves strong presentation. We help partners turn catalog depth into visibility, credibility, and faster conversion.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {growthStats.map((stat) => (
                <div key={stat.label} className="rounded-[1.6rem] border border-white/10 bg-white/8 p-6 backdrop-blur transition hover:-translate-y-1">
                  <p className="font-serif text-4xl">{stat.value}</p>
                  <p className="mt-3 text-sm text-[rgba(248,241,231,0.8)]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-14">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="surface-card p-8">
            <p className="eyebrow">Who Can Apply</p>
            <h2 className="mt-3 font-serif text-4xl text-[color:var(--rukhsar-maroon)]">We welcome both established sellers and craft-led growing businesses</h2>
            <p className="mt-5 text-sm leading-7 text-stone-600">
              If you can supply quality sarees consistently and care about presentation, we would love to review your application.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {applicantTypes.map((item) => (
              <div key={item} className="surface-card flex items-center gap-4 p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="h-3 w-3 rounded-full bg-[color:var(--rukhsar-gold)]" />
                <p className="font-medium text-[color:var(--rukhsar-maroon)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section-shell py-14">
        <div className="max-w-3xl">
          <p className="eyebrow">How It Works</p>
          <h2 className="mt-3 font-serif text-4xl text-[color:var(--rukhsar-maroon)]">A simple path from application to live selling</h2>
        </div>
        <div className="mt-8 grid gap-5 xl:grid-cols-4">
          {processSteps.map((step, index) => (
            <div key={step.title} className="surface-card relative p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(90,30,34,0.08)] font-serif text-2xl text-[color:var(--rukhsar-maroon)]">
                {index + 1}
              </div>
              <h3 className="font-serif text-2xl text-[color:var(--rukhsar-maroon)]">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="partner-application" className="section-shell py-14">
        <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-5">
            <div className="surface-card p-8">
              <p className="eyebrow">Apply Now</p>
              <h2 className="mt-3 font-serif text-4xl text-[color:var(--rukhsar-maroon)]">Bring your saree catalog to a premium, fast-growing platform</h2>
              <p className="mt-4 text-sm leading-7 text-stone-600">
                Share your details once. Our team will review your fit, connect for onboarding, and guide the next steps.
              </p>
            </div>
            <div className="surface-card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--rukhsar-maroon)]">What helps approval</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-600">
                <li>Clear saree category focus and inventory readiness</li>
                <li>Consistent product quality and trustworthy business identity</li>
                <li>A sample catalog or product overview that reflects your strongest styles</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="surface-card p-6 md:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Full Name"
                value={form.fullName}
                error={errors.fullName}
                onChange={(value) => setForm((current) => ({ ...current, fullName: value }))}
              />
              <Field
                label="Business Name"
                value={form.businessName}
                error={errors.businessName}
                onChange={(value) => setForm((current) => ({ ...current, businessName: value }))}
              />
              <Field
                label="Phone Number (WhatsApp preferred)"
                value={form.phoneNumber}
                error={errors.phoneNumber}
                onChange={(value) => setForm((current) => ({ ...current, phoneNumber: value }))}
              />
              <Field
                label="Email"
                value={form.email}
                error={errors.email}
                onChange={(value) => setForm((current) => ({ ...current, email: value }))}
              />
              <Field
                label="City / State"
                value={form.cityState}
                error={errors.cityState}
                onChange={(value) => setForm((current) => ({ ...current, cityState: value }))}
              />
              <SelectField
                label="Business Type"
                value={form.businessType}
                error={errors.businessType}
                onChange={(value) => setForm((current) => ({ ...current, businessType: value }))}
                options={[
                  { label: "Select business type", value: "" },
                  { label: "Manufacturer", value: "manufacturer" },
                  { label: "Wholesaler", value: "wholesaler" },
                  { label: "Boutique owner", value: "boutique-owner" },
                  { label: "Handloom artisan", value: "handloom-artisan" },
                  { label: "Other", value: "other" }
                ]}
              />
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-[color:var(--rukhsar-maroon)]">Product Types</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {productTypeOptions.map((option) => {
                  const active = selectedProductTypes.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleProductType(option)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        active
                          ? "border-[color:var(--rukhsar-maroon)] bg-[rgba(90,30,34,0.08)] text-[color:var(--rukhsar-maroon)]"
                          : "border-stone-200 bg-white/70 text-stone-600 hover:bg-white"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {errors.productTypes ? <p className="mt-2 text-sm text-[color:var(--rukhsar-maroon)]">{errors.productTypes}</p> : null}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr]">
              <SelectField
                label="Monthly Inventory Capacity"
                value={form.monthlyInventoryCapacity}
                error={errors.monthlyInventoryCapacity}
                onChange={(value) => setForm((current) => ({ ...current, monthlyInventoryCapacity: value }))}
                options={[
                  { label: "Select monthly capacity", value: "" },
                  { label: "Under 100 sarees", value: "under-100" },
                  { label: "100 to 300 sarees", value: "100-300" },
                  { label: "300 to 700 sarees", value: "300-700" },
                  { label: "700+ sarees", value: "700-plus" }
                ]}
              />
              <div>
                <label className="text-sm font-medium text-[color:var(--rukhsar-maroon)]">Upload Catalog (optional)</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.zip,.csv,.xlsx"
                  onChange={(event) => setCatalogFile(event.target.files?.[0] ?? null)}
                  className="mt-2 block w-full rounded-2xl border border-stone-200 bg-white/70 px-4 py-3 text-sm text-stone-600 file:mr-4 file:rounded-full file:border-0 file:bg-[rgba(90,30,34,0.08)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[color:var(--rukhsar-maroon)]"
                />
                {catalogFile ? <p className="mt-2 text-xs uppercase tracking-[0.12em] text-stone-500">{catalogFile.name}</p> : null}
                {errors.catalog ? <p className="mt-2 text-sm text-[color:var(--rukhsar-maroon)]">{errors.catalog}</p> : null}
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium text-[color:var(--rukhsar-maroon)]">Message</label>
              <textarea
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                placeholder="Tell us about your saree categories, strengths, or what makes your business a good fit for Rukhsar."
                className="mt-2 min-h-32 w-full rounded-[1.5rem] border border-stone-200 bg-white/70 px-4 py-3 text-sm text-stone-700 outline-none placeholder:text-stone-400"
              />
            </div>

            <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                {status ? <p className="text-sm text-[color:var(--rukhsar-maroon)]">{status}</p> : null}
                {!status && isFormValid ? <p className="text-sm text-stone-500">Applications are reviewed within 3 to 7 business days.</p> : null}
              </div>
              <button className="cta-primary disabled:opacity-70" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="section-shell py-14">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow">Trust And Social Proof</p>
            <h2 className="mt-3 font-serif text-4xl text-[color:var(--rukhsar-maroon)]">A partner opportunity designed to feel credible from day one</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {trustBadges.map((badge) => (
                <span key={badge} className="rounded-full border border-[rgba(90,30,34,0.12)] bg-white/70 px-4 py-3 text-sm font-medium text-[color:var(--rukhsar-maroon)]">
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="surface-card p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <p className="text-sm leading-7 text-stone-600">"{testimonial.quote}"</p>
                <div className="mt-4 border-t border-stone-200 pt-4">
                  <p className="font-medium text-[color:var(--rukhsar-maroon)]">{testimonial.name}</p>
                  <p className="mt-1 text-sm text-stone-500">{testimonial.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-14">
        <div className="max-w-3xl">
          <p className="eyebrow">FAQs</p>
          <h2 className="mt-3 font-serif text-4xl text-[color:var(--rukhsar-maroon)]">Questions partners usually ask before joining</h2>
        </div>
        <div className="mt-8 space-y-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="surface-card group p-6">
              <summary className="cursor-pointer list-none font-serif text-2xl text-[color:var(--rukhsar-maroon)]">
                <div className="flex items-center justify-between gap-4">
                  <span>{faq.question}</span>
                  <span className="text-xl transition group-open:rotate-45">+</span>
                </div>
              </summary>
              <p className="mt-4 max-w-4xl text-sm leading-7 text-stone-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section-shell py-14">
        <div className="surface-card overflow-hidden bg-[linear-gradient(135deg,rgba(248,241,231,0.88),rgba(255,255,255,0.7))] p-8 md:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">Final Step</p>
              <h2 className="mt-3 font-serif text-4xl text-[color:var(--rukhsar-maroon)]">Start selling your sarees to customers across India today.</h2>
              <p className="mt-4 text-sm leading-7 text-stone-600">
                If your catalog has quality, consistency, and craft value, Rukhsar can help turn it into a trusted online growth channel.
              </p>
            </div>
            <a href="#partner-application" className="cta-primary self-start lg:self-center">
              Apply Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  error,
  onChange
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[color:var(--rukhsar-maroon)]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-stone-200 bg-white/70 px-4 py-3 text-sm text-stone-700 outline-none placeholder:text-stone-400"
      />
      {error ? <p className="mt-2 text-sm text-[color:var(--rukhsar-maroon)]">{error}</p> : null}
    </label>
  );
}

function SelectField({
  label,
  value,
  error,
  onChange,
  options
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[color:var(--rukhsar-maroon)]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-stone-200 bg-white/70 px-4 py-3 text-sm text-stone-700 outline-none"
      >
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-2 text-sm text-[color:var(--rukhsar-maroon)]">{error}</p> : null}
    </label>
  );
}
