import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white">
      {/* Tricolor stripe */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Website Policies */}
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
            </ul>
          </div>

          {/* Column 2: Help & Support */}
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
                <Link to="/sitemap" className="text-sm text-white/60 hover:text-white transition-colors">
                  Sitemap
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-sm text-white/60 hover:text-white transition-colors">
                  Feedback
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-white/60 hover:text-white transition-colors">
                  FAQ
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
                  National Portal of India ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Compliance Disclaimer */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#FF9933] mb-4">
              Disclaimer
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-white/50 leading-relaxed">
                An Open-Source Civic Tech Project Initiative.
              </p>
              <p className="text-xs text-white/30 leading-relaxed">
                This portal is developed as an open-source project for demonstrative purposes. 
                Content and scheme information are for reference only. 
                Users are advised to verify details with official government sources.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <div className="h-6 w-6 rounded overflow-hidden bg-white/10 flex items-center justify-center">
                  <img src="/brand-logo.svg" alt="" className="h-full w-full object-contain" />
                </div>
                <span className="text-xs text-white/30">
                  JanaSetu v0.1 • Open Source
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} JanaSetu — An Open-Source Civic Tech Project.
          </p>
          <div className="flex gap-4 text-xs text-white/30">
            <span>Last Updated: July 2026</span>
            <span>•</span>
            <span>Powered by Open Source</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
