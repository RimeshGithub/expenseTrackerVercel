import React from "react"

export default function ExpenseTrackerDocs() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-8 text-slate-800">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        <header className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white">
          <h1 className="text-3xl font-extrabold tracking-tight">ExpenseTracker — Project Documentation</h1>
          <p className="mt-2 text-indigo-100/90">Next.js (App Router) + Firebase | TailwindCSS</p>
        </header>

        <main className="p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold">Project Overview</h2>
            <p className="mt-2 text-slate-700">This is a modern expense tracker built with Next.js (App Router), TypeScript and Firebase (Auth + Firestore). It contains a dashboard with transactions, analytics charts, add/edit flows, and a polished component library (Radix + shadcn-style UI primitives). The app is optimized for deployment on Vercel.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Tech stack</h2>
            <ul className="mt-2 space-y-1 list-disc list-inside text-slate-700">
              <li>Next.js (App Router)</li>
              <li>TypeScript</li>
              <li>Firebase — Authentication & Firestore</li>
              <li>Tailwind CSS + postcss</li>
              <li>Radix UI & shadcn/ui style primitives</li>
              <li>Vercel for deployment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Quick start</h2>
            <p className="mt-2 text-slate-700">Steps to run the project locally:</p>
            <pre className="mt-4 bg-slate-900/5 border border-slate-100 p-4 rounded-md text-sm text-slate-800">
{`# install dependencies (pnpm is used in this repo, but npm/yarn also work)
pnpm install

# run dev server
pnpm dev

# build for production
pnpm build
pnpm start`}
            </pre>
            <p className="mt-2 text-slate-600">If the repo uses <code>pnpm-lock.yaml</code>, prefer <code>pnpm</code> for parity with lockfile.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Environment variables</h2>
            <p className="mt-2 text-slate-700">The app connects to Firebase. Instead of committing keys, set these environment variables in your local <code>.env.local</code> or in Vercel project settings.</p>
            <pre className="mt-4 bg-slate-50 border border-slate-100 p-3 rounded-md text-sm text-slate-700">
{`NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Optional
NEXT_PUBLIC_DEBUG=true`}
            </pre>
            <p className="mt-2 text-slate-600">Note: This repository includes a firebase config file that demonstrates initialization. For security and portability, replace hard-coded values with env variables.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Project structure (high level)</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
              <div className="space-y-1">
                <p className="font-medium">/app</p>
                <p className="text-sm">Next.js App Router pages and layouts (login, signup, dashboard, docs, analytics, transactions)</p>

                <p className="font-medium mt-3">/components</p>
                <p className="text-sm">Reusable UI: forms, charts, dashboard layout, theme provider, and shadcn-like UI primitives.</p>

                <p className="font-medium mt-3">/lib</p>
                <p className="text-sm">Utilities and providers — firebase initializer, auth context, helpers.</p>
              </div>

              <div className="space-y-1">
                <p className="font-medium">/public</p>
                <p className="text-sm">Static assets (icons, images).</p>

                <p className="font-medium mt-3">/styles</p>
                <p className="text-sm">Global CSS and Tailwind entry.</p>

                <p className="font-medium mt-3">Other</p>
                <p className="text-sm">postcss.config.mjs, next.config.mjs, package.json (scripts & deps)</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Authentication flow</h2>
            <p className="mt-2 text-slate-700">Auth is implemented via Firebase Auth. Key parts:</p>
            <ul className="mt-2 list-disc list-inside text-slate-700">
              <li><code>/lib/firebase.ts</code> — initializes Firebase app, Auth and Firestore</li>
              <li><code>/lib/auth-context.tsx</code> — React context wrapping <code>onAuthStateChanged</code> to expose <code>user</code>, <code>loading</code>, <code>signIn</code>, <code>signUp</code>, <code>signOut</code>.</li>
              <li>Pages: <code>/app/auth/login/page.tsx</code> and <code>/app/auth/signup/page.tsx</code></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Data model & Firestore</h2>
            <p className="mt-2 text-slate-700">The app stores transactions in Firestore per user. Typical document fields:</p>
            <ul className="mt-2 list-disc list-inside text-slate-700">
              <li><strong>amount</strong> — number</li>
              <li><strong>category</strong> — string</li>
              <li><strong>type</strong> — "income" | "expense"</li>
              <li><strong>date</strong> — timestamp</li>
              <li><strong>notes</strong> — string (optional)</li>
            </ul>
            <p className="mt-2 text-slate-600">Look for Firestore read/write logic inside <code>/components</code> and any helper files in <code>/lib</code>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Key components</h2>
            <ul className="mt-2 list-disc list-inside text-slate-700">
              <li><code>dashboard-layout.tsx</code> — main dashboard shell with sidebar and responsive layout</li>
              <li><code>transactions-list.tsx</code> — lists transactions with edit/delete actions</li>
              <li><code>add-transaction-form.tsx</code> / <code>edit-transaction-form.tsx</code> — forms with validation</li>
              <li>Charts: <code>expense-chart.tsx</code>, <code>trend-chart.tsx</code>, <code>category-chart.tsx</code> — rendered via charting library (check each file for exact lib used)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Styling & Theme</h2>
            <p className="mt-2 text-slate-700">TailwindCSS is used across the project. There is a theme provider component and many shadcn-style UI primitives under <code>/components/ui</code>. The global styles and design tokens are defined in <code>/styles/globals.css</code>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Deployment</h2>
            <p className="mt-2 text-slate-700">Recommended: Vercel. Add the same environment variables to Vercel's dashboard (project settings &gt; Environment Variables). Ensure <code>NEXT_PUBLIC_*</code> keys are exposed to the browser.</p>
            <p className="mt-2 text-slate-600">Use the built-in Vercel analytics if desired (this project already imports <code>@vercel/analytics</code>).</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Developer notes & suggestions</h2>
            <ul className="mt-2 list-disc list-inside text-slate-700">
              <li>Move hard-coded Firebase config into environment variables for security and multi-environment support.</li>
              <li>Add a top-level README.md summarizing the project, license, and quick links.</li>
              <li>Consider adding stricter TypeScript checks and enabling ESLint/TS config in CI for better robustness.</li>
              <li>Audit Firestore security rules before production deploy.</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  )
}
