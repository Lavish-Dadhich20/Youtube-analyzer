function TermsOfService() {
  return (
    <div className="min-h-screen text-white px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
      <p className="text-gray-400 mb-8">Last updated: July 2026</p>

      <div className="space-y-6 text-gray-300">
        <section>
          <h2 className="text-xl font-bold text-white mb-2">1. Acceptance</h2>
          <p>
            By using YTAnalyzer, you agree to these terms. If you disagree,
            please do not use this service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">2. Service Description</h2>
          <p>
            YTAnalyzer provides AI-powered YouTube video analysis, channel analytics,
            and content recommendations. The service is provided "as is" without
            warranties of any kind.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">3. User Responsibilities</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>You must provide accurate information when registering</li>
            <li>You are responsible for maintaining your account security</li>
            <li>You must not use the service for illegal purposes</li>
            <li>You must not attempt to abuse or overload our API</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">4. YouTube API</h2>
          <p>
            YTAnalyzer uses YouTube Data API v3. By connecting your YouTube account,
            you also agree to{" "}
            <a
              href="https://www.youtube.com/t/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-400"
            >
              YouTube's Terms of Service
            </a>
            {" "}and{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-400"
            >
              Google's Privacy Policy
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">5. Limitation of Liability</h2>
          <p>
            YTAnalyzer is not responsible for any decisions made based on our
            AI analysis. All predictions and recommendations are for informational
            purposes only.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">6. Contact</h2>
          <p>
            For questions about these terms:{" "}
            <a href="mailto:lavishdadhich2006@gmail.com" className="text-red-500 hover:text-red-400">
              lavishdadhich2006@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

export default TermsOfService;