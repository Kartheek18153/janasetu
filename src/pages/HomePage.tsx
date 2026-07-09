import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import {
  DocumentTextIcon, MagnifyingGlassIcon, MegaphoneIcon, CalendarDaysIcon,
  CheckCircleIcon, ClockIcon, UserGroupIcon, ArrowRightIcon,
  SparklesIcon, ChevronRightIcon, PhoneIcon,
} from '@heroicons/react/24/outline';
import { AnnouncementService, DepartmentService, ExternalSchemeService } from '../services';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Reveal from '../hooks/useScrollReveal';
import { Announcement, Grievance } from '../types';

function AshokaChakra({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="50" r="6" fill="currentColor" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
        <line key={angle} x1="50" y1="10" x2="50" y2="18" stroke="currentColor" strokeWidth="2"
          transform={`rotate(${angle} 50 50)`} />
      ))}
      {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((angle) => (
        <line key={angle} x1="50" y1="10" x2="50" y2="24" stroke="currentColor" strokeWidth="1.2"
          transform={`rotate(${angle} 50 50)`} />
      ))}
      {[7.5, 37.5, 67.5, 97.5, 127.5, 157.5, 187.5, 217.5, 247.5, 277.5, 307.5, 337.5].map((angle) => (
        <line key={angle} x1="50" y1="10" x2="50" y2="22" stroke="currentColor" strokeWidth="0.8"
          transform={`rotate(${angle} 50 50)`} />
      ))}
    </svg>
  );
}

function Emblem({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="55" r="18" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <ellipse cx="50" cy="55" rx="30" ry="12" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M20 55 Q50 40 80 55" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M25 50 Q50 38 75 50" stroke="currentColor" strokeWidth="1" fill="none" />
      <text x="50" y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">सत्यमेव जयते</text>
      <path d="M35 22 L50 14 L65 22" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="14" r="2" fill="currentColor" />
    </svg>
  );
}

const serviceColors: { bg: string; iconBg: string; iconColor: string; accent: string; badge: string; border: string; shadow: string; topBar: string }[] = [
  { bg: 'from-amber-50 to-orange-50', iconBg: 'from-[#FF9933] to-[#ea580c]', iconColor: 'text-white', accent: 'text-[#FF9933]', badge: 'bg-[#FF9933]/10 text-[#ea580c]', border: 'hover:border-[#FF9933]/40', shadow: 'hover:shadow-[#FF9933]/20', topBar: 'from-[#FF9933] to-[#f97316]' },
  { bg: 'from-blue-50 to-indigo-50', iconBg: 'from-[#1a237e] to-[#283593]', iconColor: 'text-white', accent: 'text-[#1a237e]', badge: 'bg-[#1a237e]/10 text-[#1a237e]', border: 'hover:border-[#1a237e]/40', shadow: 'hover:shadow-[#1a237e]/20', topBar: 'from-[#1a237e] to-[#3949ab]' },
  { bg: 'from-emerald-50 to-green-50', iconBg: 'from-[#138808] to-[#16a34a]', iconColor: 'text-white', accent: 'text-[#138808]', badge: 'bg-[#138808]/10 text-[#138808]', border: 'hover:border-[#138808]/40', shadow: 'hover:shadow-[#138808]/20', topBar: 'from-[#138808] to-[#15803d]' },
  { bg: 'from-primary-50 to-amber-50', iconBg: 'from-[#f97316] to-[#FF9933]', iconColor: 'text-white', accent: 'text-[#f97316]', badge: 'bg-[#f97316]/10 text-[#f97316]', border: 'hover:border-[#f97316]/40', shadow: 'hover:shadow-[#f97316]/20', topBar: 'from-[#f97316] to-[#FF9933]' },
];

const services = [
  { icon: DocumentTextIcon, titleKey: 'home.services.fileGrievance', descKey: 'home.services.fileGrievance.desc', link: '/file-grievance', colorIdx: 0, img: '/feature-grievance.jpg' },
  { icon: MagnifyingGlassIcon, titleKey: 'home.services.trackGrievance', descKey: 'home.services.trackGrievance.desc', link: '/track', colorIdx: 1, img: '/images (2).jpg' },
  { icon: MegaphoneIcon, titleKey: 'home.services.announcements', descKey: 'home.services.announcements.desc', link: '/announcements', colorIdx: 2, img: '/images (3).jpg' },
  { icon: CalendarDaysIcon, titleKey: 'home.services.bookAppointment', descKey: 'home.services.bookAppointment.desc', link: '/appointments', colorIdx: 3, img: '/feature-appointment.jpg' },
  { icon: SparklesIcon, titleKey: 'home.services.schemes', descKey: 'home.services.schemes.desc', link: '/schemes', colorIdx: 0, img: '/feature-schemes.jpg' },
];

const stepColors = ['#FF9933', '#1a237e', '#138808', '#f97316'];

const steps = [
  { num: '01', titleKey: 'home.process.step1.title', descKey: 'home.process.step1.desc', link: '/file-grievance' },
  { num: '02', titleKey: 'home.process.step2.title', descKey: 'home.process.step2.desc', link: '/track' },
  { num: '03', titleKey: 'home.process.step3.title', descKey: 'home.process.step3.desc', link: '/track' },
  { num: '04', titleKey: 'home.process.step4.title', descKey: 'home.process.step4.desc', link: '/file-grievance' },
];

const testimonials = [
  { nameKey: 'testimonial.1.name', roleKey: 'testimonial.1.role', textKey: 'testimonial.1.text' },
  { nameKey: 'testimonial.2.name', roleKey: 'testimonial.2.role', textKey: 'testimonial.2.text' },
  { nameKey: 'testimonial.3.name', roleKey: 'testimonial.3.role', textKey: 'testimonial.3.text' },
];

const emptyStats = [
  { icon: DocumentTextIcon, labelKey: 'home.stats.totalGrievances', value: '-', color: 'text-secondary-300' },
  { icon: CheckCircleIcon, labelKey: 'home.stats.resolved', value: '-', color: 'text-secondary-300' },
  { icon: ClockIcon, labelKey: 'home.stats.pending', value: '-', color: 'text-secondary-300' },
  { icon: UserGroupIcon, labelKey: 'home.stats.activeOfficers', value: '-', color: 'text-secondary-300' },
];

function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [display, setDisplay] = useState('0');
  const target = parseInt(value) || 0;
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (target === 0) { setDisplay('0'); return; }
        let current = 0;
        const step = Math.ceil(target / (1500 / 16));
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { setDisplay(target.toString()); clearInterval(timer); }
          else setDisplay(current.toString());
        }, 16);
        observer.unobserve(el);
        return () => clearInterval(timer);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{display}{suffix}</span>;
}

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(emptyStats);
  const [myGrievances, setMyGrievances] = useState<Grievance[]>([]);
  const [grievanceTab, setGrievanceTab] = useState<'all' | 'resolved' | 'pending'>('all');
  const [noticeIndex, setNoticeIndex] = useState(0);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [schemesUpdated, setSchemesUpdated] = useState<string>('');

  const notices = [
    { textKey: 'notice.extendedDeadline', link: '/announcements' },
    { textKey: 'notice.maintenance', link: '/announcements' },
    { textKey: 'notice.helpline', link: '/announcements' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setNoticeIndex(prev => (prev + 1) % notices.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { threshold: 0.3 });
    sectionRefs.current.forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const filteredHomeGrievances = useMemo(() => {
    if (grievanceTab === 'resolved') return myGrievances.filter(g => g.status === 'resolved' || g.status === 'closed');
    if (grievanceTab === 'pending') return myGrievances.filter(g => g.status === 'submitted' || g.status === 'under_review');
    return myGrievances;
  }, [myGrievances, grievanceTab]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [announcementsData, officersData] = await Promise.all([
          AnnouncementService.getAnnouncements(),
          DepartmentService.getOfficers(),
        ]);
        setAnnouncements(announcementsData.slice(0, 3));
        if (isAuthenticated) {
          setStats(prev => {
            const next = [...prev];
            next[3] = { icon: UserGroupIcon, labelKey: 'home.stats.activeOfficers', value: officersData.length.toString(), color: 'text-citizen-blue' };
            return next;
          });
        }
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, [isAuthenticated]);

  useEffect(() => {
    (async () => {
      const data = await ExternalSchemeService.getBudgetSchemes();
      setSchemes(data);
      const last = ExternalSchemeService.getLastUpdated();
      if (last) {
        setSchemesUpdated(last.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
      }
    })();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setStats(emptyStats);
      return;
    }
    const q = query(collection(db, 'grievances'), where('citizenId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Grievance));
      const total = all.length;
      const resolved = all.filter(g => g.status === 'resolved' || g.status === 'closed').length;
      const pending = all.filter(g => g.status === 'submitted' || g.status === 'under_review').length;
      setMyGrievances(all);
      setStats(prev => [
        { icon: DocumentTextIcon, labelKey: 'home.stats.totalGrievances', value: total.toString(), color: 'text-primary-600' },
        { icon: CheckCircleIcon, labelKey: 'home.stats.resolved', value: resolved.toString(), color: 'text-citizen-teal' },
        { icon: ClockIcon, labelKey: 'home.stats.pending', value: pending.toString(), color: 'text-primary-400' },
        { icon: UserGroupIcon, labelKey: 'home.stats.activeOfficers', value: prev[3]?.value || '0', color: 'text-citizen-blue' },
      ]);
    });
    return unsub;
  }, [isAuthenticated, user]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const authHref = (path: string) => {
    if (isAuthenticated) return path;
    return `/login?redirect=${encodeURIComponent(path)}`;
  };

  return (
    <div className="home-page">

      {/* ===== NOTICE BOARD ===== */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 sm:px-6 lg:px-8">
          <span className="shrink-0 bg-primary-600 text-white text-[0.65rem] font-bold tracking-wider px-2.5 py-1 rounded uppercase">
            {t('notice.board')}
          </span>
          <div className="overflow-hidden flex-1 relative h-8">
              <Link
                to={authHref(notices[noticeIndex].link)}
                className="absolute inset-0 flex items-center transition-all duration-500 ease-in-out"
                style={{ transform: 'translateY(0)', opacity: 1 }}
              >
                <span className="text-xs text-amber-800 font-medium">{t(notices[noticeIndex].textKey)}</span>
              </Link>
          </div>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <section
        id="home"
        ref={el => { sectionRefs.current[0] = el; }}
        className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-red-900"
      >
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="flex items-center gap-12">
            <div className="flex-1 max-w-3xl">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-primary-200 text-xs font-medium mb-5">
                  <SparklesIcon className="h-3.5 w-3.5" />
                  <span>{t('hero.portalStatus')}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                  {t('hero.heading')}
                </h1>
                <p className="mt-5 text-base sm:text-lg text-primary-100/90 max-w-xl leading-relaxed">
                  {t('hero.subtitle')}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to={isAuthenticated ? '/file-grievance' : '/register'}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-xl font-bold text-sm hover:bg-primary-50 transition-all hover:shadow-2xl hover:shadow-black/20 active:scale-[0.97]"
                  >
                    <DocumentTextIcon className="h-5 w-5" />
                    {isAuthenticated ? t('hero.fileComplaint') : t('hero.getStarted')}
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => scrollTo('how')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-sm border border-white/15 hover:bg-white/20 transition-all"
                  >
                    {t('hero.howItWorks')}
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative -mr-8 [perspective:1000px] group">
              <div className="[transform-style:preserve-3d] transition-transform duration-700 group-hover:[transform:rotateY(180deg)] relative">
                <div className="[backface-visibility:hidden]">
                  <div className="relative w-[30rem] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 via-transparent to-primary-500/10 z-10" />
                    <img
                      src="/hero-people.jpg"
                      alt="citizens"
                      className="w-full h-auto"
                    />
                    <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-red-900/70 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Emblem className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white text-xs font-bold tracking-wider uppercase">Digital India</p>
                          <p className="text-white/70 text-[10px]">Power to Empower</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-white to-green-600 rounded-3xl flex items-center justify-center p-8">
                  <p className="text-green-900 text-center text-sm leading-relaxed">
                    "Digital governance empowers every citizen with transparent, accessible, and efficient public services — bridging the gap between people and government."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isAuthenticated && (
        <Reveal variant="slide-up" delay={100}>
        <section className="bg-secondary-900 py-10 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((s, i) => {
                const statLinks = ['/track', '/track', '/track', '/appointments'];
                const statColors = ['#FF9933', '#1a237e', '#138808', '#f97316'];
                return (
                  <Link key={s.labelKey} to={statLinks[i]} className="group relative block">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full" style={{ backgroundColor: statColors[i] }} />
                    <div className="text-3xl sm:text-4xl font-bold font-serif" style={{ color: statColors[i] }}>
                      {isNaN(parseInt(s.value)) ? s.value : <AnimatedCounter value={s.value} />}
                      <span className="text-citizen-yellow">+</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <s.icon className="h-3.5 w-3.5 hidden sm:block" style={{ color: statColors[i] }} />
                      <div className="text-xs sm:text-sm text-secondary-400 tracking-wide group-hover:text-secondary-600 transition-colors">{t(s.labelKey)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
        </Reveal>
      )}

      {/* ===== FEATURED SCHEMES ===== */}
      {schemes.length > 0 && (
        <Reveal variant="slide-up" delay={200}>
        <section className="py-14 sm:py-20 bg-gradient-to-b from-secondary-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold tracking-[1.4px] uppercase block mb-2 text-citizen-blue">
                {t('home.services.label')}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-secondary-900">
                Featured Government Schemes
              </h2>
              <p className="mt-3 text-secondary-500 text-sm sm:text-base">
                Real-time data from the Union Budget — major central welfare schemes with allocation details
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {schemes.map((s: any) => (
                <Link key={s.id} to={`/schemes/${s.id}`} className="block bg-white border border-secondary-200 rounded-xl p-5 hover:shadow-lg transition-all hover:-translate-y-0.5">
                  <h3 className="text-sm font-bold text-secondary-900 mb-1.5 leading-tight">{s.name}</h3>
                  <p className="text-xs text-secondary-500 mb-3 line-clamp-2 leading-relaxed">{s.humanContext}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary-400">{s.ministryName}</span>
                    <span className="font-semibold text-citizen-green">₹{(s.allocation / 1000).toFixed(1)}K Cr</span>
                  </div>
                </Link>
              ))}
            </div>
            {schemesUpdated && (
              <p className="text-center text-[11px] text-secondary-400 mt-4">Updated: {schemesUpdated} &middot; Source: Union Budget 2025-26</p>
            )}
          </div>
        </section>
        </Reveal>
      )}

      {/* ===== HOW IT WORKS ===== */}
      <Reveal variant="slide-up" delay={300}>
      <section id="how" ref={el => { sectionRefs.current[1] = el; }} className="py-14 sm:py-20 bg-white border-y border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-[1.4px] uppercase block mb-2" style={{ color: stepColors[0] }}>
              {t('home.process.label')}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-secondary-900">
              {t('home.process.title')}
            </h2>
            <p className="mt-3 text-secondary-500 text-sm sm:text-base">
              {t('home.process.desc')}
            </p>
          </div>

          <Link to="/schemes" className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-r from-secondary-50 to-white border border-secondary-200 block hover:shadow-lg transition-all">
            <div className="flex items-center gap-6 p-6">
              <div className="hidden md:block w-48 h-36 flex-shrink-0 overflow-hidden rounded-xl">
                <img src="/network-map.svg" alt="network" className="w-full h-full object-cover opacity-80" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-secondary-600 leading-relaxed group-hover:text-secondary-900 transition-colors">
                  JanaSetu connects citizens with over 20 central and state government welfare schemes. 
                  Our intelligent recommendation engine matches your profile with the right schemes, 
                  ensuring you never miss out on benefits you're entitled to.
                </p>
              </div>
            </div>
            <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-48 overflow-hidden opacity-30">
              <img src="/Gemini_Generated_Image_r1pkvfr1pkvfr1pk.png" alt="" className="w-full h-full object-cover" />
            </div>
          </Link>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => {
              const stepColor = stepColors[i];
              const nextColor = i < steps.length - 1 ? stepColors[i + 1] : stepColor;
              return (
                <Link key={s.num} to={authHref(s.link)} className="group relative block">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px border-t-2 border-dashed"
                      style={{ borderColor: nextColor + '40' }} />
                  )}
                  <div className="text-center group-hover:scale-105 transition-transform duration-300">
                    <div className="font-serif text-5xl font-black mb-3"
                      style={{ color: stepColor + '15', WebkitTextStroke: '1.5px ' + stepColor }}>
                      {s.num}
                    </div>
                    <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ backgroundColor: stepColor + '30' }} />
                    <h4 className="text-base font-bold text-secondary-900 mb-1.5 group-hover:text-citizen-blue transition-colors">{t(s.titleKey)}</h4>
                    <p className="text-sm text-secondary-500 leading-relaxed max-w-[220px] mx-auto">{t(s.descKey)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      </Reveal>

      {/* ===== SECTION DIVIDER ===== */}
      <div className="relative h-16 overflow-hidden">
        <img src="/section-divider.svg" alt="" className="w-full h-full object-cover" />
      </div>

      {/* ===== DIGITAL INDIA POSTER ===== */}
      <Reveal variant="slide-left" delay={100}>
      <section className="relative py-0">
        <a href="https://www.digitalindia.gov.in" target="_blank" rel="noopener noreferrer" className="block">
          <div className="relative overflow-hidden bg-gradient-to-r from-[#1a237e] via-blue-900 to-[#0f1b33] group">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-10 right-20 opacity-[0.06]">
                <AshokaChakra className="w-40 h-40 text-white" />
              </div>
              <div className="absolute bottom-10 left-20 opacity-[0.04]">
                <AshokaChakra className="w-28 h-28 text-white" />
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/20 bg-white p-3 group-hover:ring-[#FF9933] transition-all">
                    <img src="/brand-logo.svg" alt="Digital India" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center gap-3 justify-center lg:justify-start mb-3">
                    <span className="px-3 py-1 bg-[#FF9933] text-white text-[10px] font-bold uppercase tracking-wider rounded">Initiative</span>
                    <span className="px-3 py-1 bg-[#138808] text-white text-[10px] font-bold uppercase tracking-wider rounded">Digital India</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    <span className="text-[#FF9933]">Digital</span> India Programme
                  </h2>
                  <p className="mt-3 text-blue-200/80 text-sm sm:text-base max-w-2xl leading-relaxed">
                    JanaSetu is part of the Government of India's Digital India initiative, 
                    aimed at transforming the nation into a digitally empowered society and knowledge economy. 
                    Every citizen has the right to transparent, accessible, and efficient public services.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-4 justify-center lg:justify-start text-sm">
                    <div className="flex items-center gap-2 text-blue-200">
                      <CheckCircleIcon className="h-4 w-4 text-[#138808]" />
                      <span>Transparent Governance</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-200">
                      <CheckCircleIcon className="h-4 w-4 text-[#138808]" />
                      <span>Citizen-Centric Services</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-200">
                      <CheckCircleIcon className="h-4 w-4 text-[#138808]" />
                      <span>Real-Time Tracking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a>
      </section>
      </Reveal>

      {/* ===== SERVICES ===== */}
      <Reveal variant="slide-up" delay={200}>
      <section id="services" ref={el => { sectionRefs.current[2] = el; }} className="py-14 sm:py-20 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -right-20 top-1/4 opacity-[0.03]">
            <AshokaChakra className="w-56 h-56 text-citizen-blue" />
          </div>
          <div className="absolute -left-20 bottom-1/4 opacity-[0.02]">
            <AshokaChakra className="w-40 h-40 text-citizen-green" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold tracking-[1.4px] uppercase block mb-2" style={{ color: stepColors[2] }}>
              {t('home.services.label')}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-secondary-900">
              {t('home.services.title')}
            </h2>
            <p className="mt-3 text-secondary-500 text-sm sm:text-base">
              {t('home.services.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s) => {
              const c = serviceColors[s.colorIdx];
              return (
                <Link
                  key={s.titleKey}
                  to={authHref(s.link)}
                  className={'group bg-white border border-secondary-200 rounded-xl overflow-hidden transition-all duration-300 ' + c.border + ' hover:shadow-xl ' + c.shadow + ' hover:-translate-y-1'}
                >
                  {s.img ? (
                    <div className="h-36 overflow-hidden">
                      <img src={s.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className={'h-2 bg-gradient-to-r ' + (c as any).topBar} />
                  )}
                  <div className="p-6">
                    <div className={'w-11 h-11 rounded-xl bg-gradient-to-br ' + c.iconBg + ' flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg'}>
                      <s.icon className={'h-6 w-6 ' + c.iconColor} />
                    </div>
                    <h3 className="text-base font-bold text-secondary-900 mb-1.5">{t(s.titleKey)}</h3>
                    <p className="text-sm text-secondary-500 leading-relaxed mb-3">{t(s.descKey)}</p>
                    <span className={'text-xs font-bold ' + c.accent + ' inline-flex items-center gap-1 group-hover:gap-2 transition-all'}>
                      {t('home.services.applyNow')} <ChevronRightIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      </Reveal>

      {/* ===== POSTERS & GALLERY ===== */}
      <Reveal variant="slide-up" delay={300}>
      <section className="py-10 sm:py-14 bg-gradient-to-b from-secondary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold tracking-[1.4px] uppercase block mb-2 text-citizen-blue">
              Information Gallery
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-secondary-900">
              Posters & Announcements
            </h2>
            <p className="mt-3 text-secondary-500 text-sm sm:text-base">
              Important public information and awareness campaigns
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Voter Registration Drive', tag: 'Election Commission', img: '/Gemini_Generated_Image_h1gq3jh1gq3jh1gq.png', link: '/announcements' },
              { title: 'Ayushman Bharat Health', tag: 'Health Ministry', img: '/images (4).jpg', link: '/announcements' },
              { title: 'Swachh Bharat Mission', tag: 'Urban Development', img: '/Gemini_Generated_Image_39q49w39q49w39q4.png', link: '/announcements' },
              { title: 'Skill India Campaign', tag: 'Skill Development', img: '/Gemini_Generated_Image_8qtbvm8qtbvm8qtb.png', link: '/announcements' },
            ].map((poster) => (
              <Link key={poster.title} to={poster.link} className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="h-44 relative overflow-hidden">
                  <img src={poster.img} alt={poster.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                  <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
                    <AshokaChakra className="w-full h-full text-white" />
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-citizen-blue">{poster.tag}</span>
                  <h3 className="text-sm font-bold text-secondary-900 mt-1 group-hover:text-citizen-blue transition-colors">{poster.title}</h3>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/announcements" className="inline-flex items-center gap-2 text-sm font-semibold text-citizen-blue hover:text-blue-700 transition-colors">
              View All Announcements <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
      </Reveal>

      {/* ===== MY GRIEVANCES ===== */}
      {myGrievances.length > 0 && (
        <Reveal variant="slide-up" delay={150}>
        <section className="pb-14 relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -right-16 top-0 opacity-[0.02]">
              <AshokaChakra className="w-48 h-48 text-citizen-blue" />
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-secondary-900">{t('home.myGrievances.title')}</h2>
                <p className="text-sm text-secondary-500 mt-1">{t('home.myGrievances.desc')}</p>
              </div>
              <div className="flex gap-1 p-0.5 bg-secondary-100/80 rounded-lg">
                {(['all', 'resolved', 'pending'] as const).map((tab, ti) => {
                  const tabColors = ['#FF9933', '#1a237e', '#138808'];
                  return (
                    <button
                      key={tab}
                      onClick={() => setGrievanceTab(tab)}
                      className={'px-3 py-1.5 text-xs font-medium rounded-md transition-all ' + (grievanceTab === tab ? 'bg-white shadow-sm' : 'text-secondary-500 hover:text-secondary-700')}
                      style={grievanceTab === tab ? { color: tabColors[ti] } : {}}
                    >
                      {tab === 'all' ? t('home.myGrievances.all') : tab === 'resolved' ? t('home.myGrievances.resolved') : t('home.myGrievances.pending')}
                      <span className="ml-1 text-[10px] opacity-60">
                        ({tab === 'all' ? myGrievances.length : tab === 'resolved' ? myGrievances.filter(g => g.status === 'resolved' || g.status === 'closed').length : myGrievances.filter(g => g.status === 'submitted' || g.status === 'under_review').length})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-3">
              {filteredHomeGrievances.map(g => (
                <Link key={g.id} to={'/track?trackingId=' + g.trackingId} className="block bg-white border border-secondary-200 rounded-xl p-5 hover:shadow-lg transition-all hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-secondary-900 truncate">{g.title}</h3>
                        <Badge status={g.priority} size="sm" />
                      </div>
                      <p className="text-xs text-secondary-500 font-mono">{g.trackingId}</p>
                      <p className="text-sm text-secondary-600 line-clamp-1 mt-1">{g.description}</p>
                    </div>
                    <Badge status={g.status} size="md" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        </Reveal>
      )}

      {/* ===== CTA BANNER ===== */}
      <Reveal variant="scale-in" delay={100}>
      <section className="pb-14 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 px-8 py-12 sm:px-14 sm:py-16 text-center">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 -left-20 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
              <div className="absolute bottom-0 -right-20 w-96 h-96 rounded-full bg-citizen-yellow/5 blur-3xl" />
              <div className="absolute top-1/3 right-8 w-16 h-16 opacity-[0.08] hidden sm:block">
                <img src="/gemini-svg.svg" alt="" className="w-full h-full object-contain" />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04]">
                <AshokaChakra className="w-48 h-48 text-white" />
              </div>
              <div className="absolute -bottom-10 -left-10 opacity-[0.03]">
                <Emblem className="w-32 h-32 text-white" />
              </div>
            </div>
            <div className="relative max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-white">
                {t('home.cta.title')}
              </h2>
              <p className="mt-4 text-base sm:text-lg text-primary-100/90">
                {t('home.cta.desc')}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  to={isAuthenticated ? '/file-grievance' : '/register'}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-xl font-bold text-sm hover:bg-primary-50 transition-all hover:shadow-2xl hover:shadow-black/20 active:scale-[0.97]"
                >
                  {isAuthenticated ? t('home.cta.fileComplaint') : t('home.cta.createAccount')}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  to={authHref('/track')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-sm border border-white/15 hover:bg-white/20 transition-all"
                >
                  {t('home.cta.trackGrievance')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      </Reveal>

      <style>{`
        .notice-enter { opacity: 0; transform: translateY(8px); }
        .notice-active { opacity: 1; transform: translateY(0); }
        .notice-exit { opacity: 0; transform: translateY(-8px); }
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out forwards;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </div>
  );
}
