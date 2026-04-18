export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => window.close()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#111] hover:bg-white/5 border border-white/5 transition-colors"
            aria-label="Close tab"
          >
            <svg className="w-5 h-5 text-[#808080]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div>
            <p className="text-xs text-[#404050] mb-0.5 font-mono tracking-widest uppercase">noothing</p>
            <h1 className="text-2xl font-bold">Privacy Policy</h1>
            <p className="text-sm text-indigo-400">Your data is your business. Always.</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#111] border border-white/5 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-[#d0d0e0] leading-relaxed">

          {/* TL;DR */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-indigo-300 text-sm font-semibold mb-1">TL;DR — The short version:</p>
            <p className="text-indigo-200/70 text-sm">
              We don't track you. We don't read your messages. We don't sell your data.
              We collect the bare minimum needed to run the app. That's it.
            </p>
          </div>

          <PrivacySection icon="🗄️" title="What We Collect (Almost Nothing)">
            To create an account on Noothing, you only need a <strong className="text-white">username
            and a password</strong>. We do not require your email address, phone number, date of
            birth, or real name. We only store data that is absolutely necessary to deliver messages
            and maintain your account — nothing more.
          </PrivacySection>

          <PrivacySection icon="🔒" title="Message Security">
            Our infrastructure is built to be "End-to-End Ready." All connections use encrypted
            WebSockets (WSS) and your data is protected at the database level. We do{' '}
            <strong className="text-white">not</strong> scan, index, or read your messages for
            advertising, profiling, or any other purpose. Your conversations are yours alone.
          </PrivacySection>

          <PrivacySection icon="📍" title="No Tracking, No Ads">
            Noothing contains <strong className="text-white">zero</strong> advertising networks,
            zero tracking pixels, and zero third-party analytics SDKs. We do not build behavioral
            profiles. We do not sell, rent, or share your personal information with data brokers
            or advertisers.
          </PrivacySection>

          <PrivacySection icon="🍪" title="Cookies">
            We use a single, <strong className="text-white">HTTP-only, Secure cookie</strong>{' '}
            strictly for keeping your session active. This cookie cannot be accessed by JavaScript
            and is never shared cross-site. We do not use persistent tracking cookies or
            fingerprinting techniques.
          </PrivacySection>

          <PrivacySection icon="🗑️" title="Your Right to Erasure">
            You have total, immediate control over your data. Deleting your account from
            Settings permanently and irreversibly removes your profile, username, message history,
            contacts, and all associated data from our active databases. There is no archive.
            There is no recovery. Deletion is final.
          </PrivacySection>

          <PrivacySection icon="👶" title="Children's Privacy">
            Noothing is not intended for users under the age of 13. We do not knowingly collect
            information from children. If you believe a child under 13 has created an account,
            please contact an administrator so the account can be removed.
          </PrivacySection>

          <PrivacySection icon="🔄" title="Changes to This Policy">
            If we ever update this Privacy Policy in a meaningful way, we will notify active users
            through an in-app announcement. Continued use of the Service after changes constitutes
            your acceptance of the new policy.
          </PrivacySection>

          {/* Data table */}
          <section>
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span>📋</span> What We Store vs. What We Don't
            </h2>
            <div className="rounded-2xl border border-white/5 overflow-hidden text-sm">
              <div className="grid grid-cols-2 bg-[#1a1a1a]">
                <div className="px-4 py-2.5 font-semibold text-green-400 border-r border-white/5">✅ We Store</div>
                <div className="px-4 py-2.5 font-semibold text-red-400">❌ We Never Store</div>
              </div>
              {[
                ['Your username (hashed reference)', 'Your real name'],
                ['Your encrypted password (bcrypt)', 'Your phone number'],
                ['Your messages (for delivery)', 'Your location or IP history'],
                ['Your avatar image', 'Behavioral or ad profiles'],
                ['Your block list', 'Third-party tracking data'],
              ].map(([yes, no], i) => (
                <div
                  key={i}
                  className={`grid grid-cols-2 border-t border-white/5 ${i % 2 === 0 ? 'bg-[#0f0f0f]' : 'bg-[#111]'}`}
                >
                  <div className="px-4 py-2.5 text-[#909090] border-r border-white/5">{yes}</div>
                  <div className="px-4 py-2.5 text-[#909090]">{no}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-[#404050]">© 2026 Noothing. Privacy is a right, not a feature.</p>
            <button
              onClick={() => window.close()}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              Close this tab ✕
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function PrivacySection({ icon, title, children }) {
  return (
    <section>
      <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2.5">
        <span className="text-xl">{icon}</span>
        {title}
      </h2>
      <p className="text-sm text-[#909090] leading-relaxed pl-8">{children}</p>
    </section>
  );
}