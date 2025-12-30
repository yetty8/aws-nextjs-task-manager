// app/privacy/page.tsx
import LegalLayout from "@/components/legal/LegalLayout";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Your privacy is important to us. This Privacy Policy explains how we
        collect, use, disclose, and safeguard your information when you use our
        service.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
        Information We Collect
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        We collect information that you provide directly to us, such as when you
        create an account, update your profile, or communicate with us.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
        How We Use Your Information
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        We use the information we collect to:
      </p>
      <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-6">
        <li>Provide, maintain, and improve our services</li>
        <li>Send you technical notices and support messages</li>
        <li>Respond to your comments, questions, and requests</li>
        <li>Communicate with you about products and services</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
        Sharing Your Information
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        We do not share your personal information with third parties except as
        described in this Privacy Policy.
      </p>
    </LegalLayout>
  );
}
