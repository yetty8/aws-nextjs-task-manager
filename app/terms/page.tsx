// app/terms/page.tsx
import LegalLayout from "@/components/legal/LegalLayout";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        By using our service, you agree to these terms. Please read them
        carefully.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
        1. Accounts
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        You are responsible for maintaining the confidentiality of your account
        and password. You agree to accept responsibility for all activities that
        occur under your account.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
        2. User Content
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        You retain ownership of any content you submit, post, or display on or
        through the service. By submitting content, you grant us a worldwide,
        non-exclusive, royalty-free license to use, reproduce, modify, and
        display such content.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
        3. Termination
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        We may terminate or suspend your account immediately, without prior
        notice or liability, for any reason whatsoever, including without
        limitation if you breach these Terms.
      </p>
    </LegalLayout>
  );
}
