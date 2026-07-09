import { Link } from 'react-router-dom';

export default function Footer({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <footer className="bg-[#0F172A] text-white">
        <div className="h-0.5 w-full flex">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#138808]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <p className="text-[10px] text-white/30">
            &copy; {new Date().getFullYear()} JanaSetu — Open Source
          </p>
          <div className="flex gap-3 text-[10px] text-white/30">
            <Link to="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <span>·</span>
            <Link to="/contact" className="hover:text-white/60 transition-colors">Contact</Link>
            <span>·</span>
            <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#0F172A] text-white">
      {/* Tricolor stripe */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: About / Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center p-1">
                <img src="/brand-logo.svg" alt="" className="h-full w-full object-contain" />
              </div>
              <span className="text-sm font-semibold text-white">JanaSetu</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              An open-source citizen grievance and services portal — bridging the gap between citizens and government.
            </p>
            <div className="flex gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors" aria-label="GitHub">
                <svg className="h-4 w-4 text-white/60" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors" aria-label="Twitter">
                <svg className="h-4 w-4 text-white/60" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Website Policies */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#FF9933] mb-4">
              Website Policies
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/privacy" className="text-sm text-white/60 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/hyperlinking" className="text-sm text-white/60 hover:text-white transition-colors">
                  Hyperlinking Policy
                </Link>
              </li>
              <li>
                <Link to="/copyright" className="text-sm text-white/60 hover:text-white transition-colors">
                  Copyright Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-white/60 hover:text-white transition-colors">
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#FF9933] mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-white transition-colors">
                  India.gov.in ↗
                </a>
              </li>
              <li>
                <a href="https://www.mygov.in" target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-white transition-colors">
                  MyGov.in ↗
                </a>
              </li>
              <li>
                <a href="https://www.digitalindia.gov.in" target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-white transition-colors">
                  Digital India ↗
                </a>
              </li>
              <li>
                <a href="https://data.gov.in" target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-white transition-colors">
                  Open Data Portal ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Support */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#FF9933] mb-4">
              Help & Support
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/contact" className="text-sm text-white/60 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-white/60 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="text-sm text-white/60 hover:text-white transition-colors">
                  Sitemap
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-sm text-white/60 hover:text-white transition-colors">
                  Feedback
                </Link>
              </li>
            </ul>
            <div className="mt-6 p-3 rounded-lg bg-white/5">
              <p className="text-xs text-white/40 leading-relaxed">
                This portal is developed as an open-source project for demonstrative purposes. Content and scheme information are for reference only. Users are advised to verify details with official sources.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} JanaSetu — An Open-Source Civic Tech Project.
          </p>
          <div className="flex gap-4 text-xs text-white/30">
            <span>Last Updated: July 2026</span>
            <span className="hidden sm:inline">•</span>
            <span>Made with ❤️ for India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
