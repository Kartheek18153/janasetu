import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Footer() {
  const { isAdmin } = useAuth();
  const location = useLocation();

  if (location.pathname !== '/') return null;

  return (
    <footer className={`relative z-10 border-t transition-colors duration-300 ${
      isAdmin ? 'bg-white/90 border-admin-200/30' : 'bg-white/90 border-secondary-200/30'
    }`}>
      {/* Subtle top gradient line */}
      <div className={`h-0.5 w-full bg-gradient-to-r ${
        isAdmin
          ? 'from-admin-400/0 via-admin-400/30 to-admin-400/0'
          : 'from-primary-400/0 via-primary-400/30 to-primary-400/0'
      }`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to={isAdmin ? '/admin' : '/'} className="flex items-center gap-2 mb-3 group">
              <div className="h-8 w-8 rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-110">
                <img src="/logo.png" alt="JanaSetu" className="h-full w-full object-cover" />
              </div>
              <span className="text-lg font-bold text-secondary-900">JanaSetu</span>
            </Link>
            <p className="text-sm text-secondary-500 leading-relaxed">
              Smart Grievance Tracking & Citizen-Government Bridge System. Empowering citizens with transparent and efficient governance.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-secondary-400 mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { name: 'File a Complaint', href: '/file-grievance' },
                { name: 'Track Grievance', href: '/track' },
                { name: 'Public Announcements', href: '/announcements' },
                { name: 'Book Appointment', href: '/appointments' },
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.href} className={`text-sm transition-all duration-200 hover:translate-x-0.5 inline-block ${
                    isAdmin
                      ? 'text-secondary-500 hover:text-admin-600'
                      : 'text-secondary-500 hover:text-primary-600'
                  }`}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-secondary-400 mb-4">For Officers</h3>
            <ul className="space-y-2.5">
              {[
                { name: 'Admin Dashboard', href: '/admin' },
                { name: 'Manage Grievances', href: '/admin/grievances' },
                { name: 'Officers Directory', href: '/admin/officers' },
                { name: 'Daily Schedule', href: '/admin/schedule' },
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.href} className={`text-sm transition-all duration-200 hover:translate-x-0.5 inline-block ${
                    isAdmin
                      ? 'text-secondary-500 hover:text-admin-600'
                      : 'text-secondary-500 hover:text-primary-600'
                  }`}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-secondary-400 mb-4">Contact</h3>
            <ul className="space-y-2.5 text-sm text-secondary-500">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">📍</span>
                <span>District Collectorate</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">📞</span>
                <span>Helpline: <span className="font-medium text-secondary-700">1070</span></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">✉️</span>
                <span>support@janasetu.gov.in</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">🕐</span>
                <span>10:00 AM - 5:00 PM (Mon-Fri)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-secondary-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-secondary-400">&copy; {new Date().getFullYear()} JanaSetu. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-secondary-400">
            <a href="#" className={`transition-colors duration-200 ${
              isAdmin ? 'hover:text-admin-600' : 'hover:text-primary-600'
            }`}>Privacy Policy</a>
            <a href="#" className={`transition-colors duration-200 ${
              isAdmin ? 'hover:text-admin-600' : 'hover:text-primary-600'
            }`}>Terms of Service</a>
            <a href="#" className={`transition-colors duration-200 ${
              isAdmin ? 'hover:text-admin-600' : 'hover:text-primary-600'
            }`}>Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}