import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';

export default function Footer() {
  const { isAdmin } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  if (location.pathname !== '/') return null;

  return (
    <footer className={`relative z-10 border-t ${isAdmin ? 'bg-admin-900 text-white' : 'bg-[#1a237e] text-white'}`}>
      {/* Tricolor stripe */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="mb-4">
              <img src="/brand-logo.svg" alt="JanaSetu" className="h-12 w-auto brightness-0 invert" />
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              JanaSetu is a citizen grievance portal developed under the Digital India Programme to provide citizens with open and easy access to government services.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { name: 'File Grievance', href: '/file-grievance' },
                { name: 'Track Grievance', href: '/track' },
                { name: 'Smart Schemes', href: '/schemes' },
                { name: 'Documents', href: '/documents' },
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">Government Links</h3>
            <ul className="space-y-2.5">
              {[
                { name: 'India Portal', href: 'https://www.india.gov.in' },
                { name: 'MyGov', href: 'https://www.mygov.in' },
                { name: 'Digital India', href: 'https://www.digitalindia.gov.in' },
                { name: 'CPGRAMS', href: 'https://pgportal.gov.in' },
              ].map(link => (
                <li key={link.name}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 hover:text-white transition-colors">
                    {link.name} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">Contact</h3>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li>📍 District Collectorate</li>
              <li>📞 1800-XXX-XXXX</li>
              <li>✉️ support@janasetu.gov.in</li>
              <li>🕐 10:00 AM - 5:00 PM (Mon-Fri)</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} JanaSetu. Portal is developed under the Digital India Programme.
            Designed, developed, and maintained by NIC.
          </p>
          <div className="flex gap-6 text-xs text-white/50">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
          </div>
        </div>

        <div className="mt-4 text-center text-[10px] text-white/30">
          Last reviewed and updated on July 2026. Content on this portal is owned by respective departments.
        </div>
      </div>
    </footer>
  );
}
