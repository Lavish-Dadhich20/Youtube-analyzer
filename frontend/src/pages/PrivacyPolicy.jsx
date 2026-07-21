function PrivacyPolicy() {
  return (
    <div className="min-h-screen text-white px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-gray-400 mb-8">Last updated: July 2026</p>

      <div className="space-y-6 text-gray-300">
        <section>
          <h2 className="text-xl font-bold text-white mb-2">1. Information We Collect</h2>
          <p>When you use YTAnalyzer, we collect:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Email address and name (when you register)</li>
            <li>YouTube channel data (only if you connect via Google OAuth)</li>
            <li>Videos you analyze using our tool</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">2. How We Use Your Information</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>To provide AI-powered YouTube analysis</li>
            <li>To show your channel analytics on the dashboard</li>
            <li>To generate personalized recommendations</li>
            <li>We never sell your data to third parties</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">3. Google OAuth & YouTube Data</h2>
          <p>
            When you connect your YouTube channel via Google, we access your public
            channel statistics (subscribers, views, video count) using YouTube Data API v3.
            We only request read-only access. We do not post, delete, or modify
            anything on your YouTube channel.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">4. Data Storage</h2>
          <p>
            Your data is stored securely in MongoDB Atlas. Passwords are hashed
            using PBKDF2-SHA256. We never store your Google password.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">5. Data Deletion</h2>
          <p>
            You can delete your account at any time from Dashboard → Settings → Danger Zone.
            All your data will be permanently removed from our servers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">6. Contact</h2>
          <p>
            For any privacy concerns, contact us at:{" "}
            <a href="mailto:lavishdadhich2006@gmail.com" className="text-red-500 hover:text-red-400">
              lavishdadhich2006@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;