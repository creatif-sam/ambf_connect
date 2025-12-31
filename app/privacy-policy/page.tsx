export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-sm text-gray-500">
        Last updated: 30 December 2025
      </p>

      <section className="space-y-4">
        <p>
          AMBF Connect respects your privacy and is committed to protecting your
          personal data. This Privacy Policy explains how we collect, use,
          store, and protect your information when you use our platform.
        </p>

        <p>
          By using AMBF Connect, you agree to the practices described in this
          policy.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Information We Collect</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Email address and encrypted password</li>
          <li>Profile information such as name and role</li>
          <li>Event participation data</li>
          <li>Session and authentication data</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Account creation and authentication</li>
          <li>Event participation and management</li>
          <li>Platform security and performance</li>
          <li>Essential service communications</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Data Security</h2>
        <p>
          Your data is stored securely using Supabase infrastructure with
          encryption, access control, and row level security policies.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Your Rights</h2>
        <p>
          You may access, update, or request deletion of your data at any time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p>
          For privacy related questions, contact us at:
        </p>
        <p className="font-medium">it-support@africamedforum.com</p>
      </section>
    </main>
  )
}
