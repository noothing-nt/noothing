export default function TermsPage() {
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
            <h1 className="text-2xl font-bold">Terms of Service</h1>
            <p className="text-sm text-indigo-400">Last updated: April 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#111] border border-white/5 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-[#d0d0e0] leading-relaxed">

          {/* Intro banner */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
            By using Noothing, you agree to these terms. Please read them carefully.
          </div>

          <Section number="1" title="Acceptance of Terms">
            By accessing and using Noothing ("the Service"), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not use the Service.
            We reserve the right to modify these terms at any time, and continued use constitutes
            acceptance of any changes.
          </Section>

          <Section number="2" title="Account Responsibility">
            You are solely responsible for maintaining the confidentiality of your password and
            username. Because Noothing employs strict encryption protocols,{' '}
            <strong className="text-white">we cannot recover lost passwords</strong>. You are
            responsible for all activity that occurs under your account.
          </Section>

          <Section number="3" title="Privacy-First Architecture">
            Noothing does not require an email address or real name for standard account creation.
            We collect only what is absolutely necessary to deliver the Service. We do not sell,
            rent, or share your data with third-party advertisers under any circumstances.
          </Section>

          <Section number="4" title="Acceptable Use">
            <p className="text-sm mb-3">You agree not to use the Service to:</p>
            <ul className="list-none space-y-2 text-sm">
              {[
                'Violate any local, national, or international law or regulation.',
                'Harass, abuse, threaten, or harm another person.',
                'Impersonate any person, entity, or Noothing staff.',
                'Transmit spam, malware, or any malicious code.',
                'Interfere with or disrupt the servers or networks connected to the Service.',
                'Attempt to gain unauthorized access to any part of the Service.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[#909090]">
                  <span className="mt-0.5 w-4 h-4 flex-shrink-0 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section number="5" title="Content Ownership">
            You retain full ownership of all content you send through Noothing. By using the
            Service, you grant Noothing a limited, non-exclusive license to transmit your content
            solely for the purpose of delivering it to your intended recipient. We do not claim
            ownership of your messages, media, or any other content.
          </Section>

          <Section number="6" title="Account Termination">
            We reserve the right to suspend or terminate your account at any time, with or without
            notice, for conduct that we believe violates these Terms or is harmful to other users,
            the Service, or third parties. You may delete your own account at any time from Settings.
          </Section>

          <Section number="7" title="Disclaimers & Limitation of Liability">
            The Service is provided "as is" without warranties of any kind. Noothing shall not be
            liable for any indirect, incidental, special, or consequential damages arising from
            your use of, or inability to use, the Service.
          </Section>

          <Section number="8" title="Contact">
            <p className="text-sm">
              If you have any questions about these Terms, you can reach us through the in-app
              support channel or by contacting an administrator.
            </p>
          </Section>

          {/* Footer */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-[#404050]">© 2026 Noothing. All rights reserved.</p>
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

function Section({ number, title, children }) {
  return (
    <section>
      <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-xs font-bold text-indigo-400">
          {number}
        </span>
        {title}
      </h2>
      <div className="text-sm text-[#909090] leading-relaxed pl-8">{children}</div>
    </section>
  );
}