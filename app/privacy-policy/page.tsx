export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-sm text-gray-500">
        Last updated: 30 December 2025
      </p>

      <section className="space-y-4">
        <p>
          AfricaMed Business Forum Connect is operated by Kardev. We are committed
          to protecting the personal data of individuals who register for and
          participate in the AfricaMed Business Forum 2026 scheduled from 16 to
          17 January 2026.
        </p>

        <p>
          This Privacy Policy explains how your personal data is collected,
          used, stored, and protected when you use the platform and related
          services.
        </p>

        <p>
          By using this platform, you acknowledge that you have read and
          understood this policy and consent to the processing of your personal
          data as described.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Information We Collect</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Contact details such as name, email address, and phone number</li>
          <li>Professional information including organization and role</li>
          <li>Account credentials including encrypted authentication data</li>
          <li>Event registration and participation records</li>
          <li>Session attendance and networking interactions</li>
          <li>Feedback, surveys, and submitted forms</li>
          <li>Travel or visa related information where applicable</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>User registration and account management</li>
          <li>Event access control and badge generation</li>
          <li>Facilitation of sessions, meetings, and networking</li>
          <li>Operational communication and event updates</li>
          <li>Security, compliance, and platform improvement</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Legal Basis for Processing</h2>
        <p>
          Personal data is processed based on user consent, the legitimate
          interests of the event organizer, and applicable data protection laws
          and regulations.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Data Retention</h2>
        <p>
          Personal data is retained only for the duration necessary to fulfill
          the purposes of the event and will be securely deleted or anonymized
          within 14 days after the conclusion of the AfricaMed Business Forum
          2026 unless otherwise required by law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Data Security</h2>
        <p>
          Data is stored securely using Supabase infrastructure with encryption,
          access controls, and row level security policies to prevent
          unauthorized access, loss, or misuse.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Your Rights</h2>
        <p>
          You have the right to access, rectify, restrict, object to, or request
          deletion of your personal data, as well as the right to data
          portability where applicable.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p>
          For any questions or requests related to data protection and privacy,
          please contact:
        </p>
        <p className="font-medium">it-support@africamedforum.com</p>
      </section>
    </main>
  )
}
