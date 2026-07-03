import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import {
  DocumentTextIcon, MagnifyingGlassIcon, MegaphoneIcon, CalendarDaysIcon,
  CheckCircleIcon, ClockIcon, UserGroupIcon, ArrowRightIcon,
  SparklesIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
import AppService from '../services/appService';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Announcement, Grievance } from '../types';

const serviceColors = [
  { bg: 'from-primary-50 to-primary-100', iconBg: 'from-primary-500 to-primary-600', iconColor: 'text-white', accent: 'text-primary-600', badge: 'bg-primary-500/10 text-primary-700', border: 'hover:border-primary-300', shadow: 'hover:shadow-primary-200/50' },
  { bg: 'from-citizen-teal/5 to-citizen-teal/10', iconBg: 'from-citizen-teal to-citizen-teal', iconColor: 'text-white', accent: 'text-citizen-teal', badge: 'bg-citizen-teal/10 text-citizen-teal', border: 'hover:border-citizen-teal/40', shadow: 'hover:shadow-citizen-teal/20' },
  { bg: 'from-citizen-blue/5 to-citizen-blue/10', iconBg: 'from-citizen-blue to-citizen-blue', iconColor: 'text-white', accent: 'text-citizen-blue', badge: 'bg-citizen-blue/10 text-citizen-blue', border: 'hover:border-citizen-blue/40', shadow: 'hover:shadow-citizen-blue/20' },
  { bg: 'from-citizen-green/5 to-citizen-green/10', iconBg: 'from-citizen-green to-citizen-green', iconColor: 'text-white', accent: 'text-citizen-green', badge: 'bg-citizen-green/10 text-citizen-green', border: 'hover:border-citizen-green/40', shadow: 'hover:shadow-citizen-green/20' },
];

const services = [
  { icon: DocumentTextIcon, title: 'File Grievance', desc: 'Submit your complaint online and get a unique tracking ID to monitor its progress.', link: '/file-grievance', colorIdx: 0 },
  { icon: MagnifyingGlassIcon, title: 'Track Grievance', desc: 'Track the real-time status of any complaint using your unique tracking ID.', link: '/track', colorIdx: 1 },
  { icon: MegaphoneIcon, title: 'Announcements', desc: 'Stay updated with official announcements, notices and public interest messages.', link: '/announcements', colorIdx: 2 },
  { icon: CalendarDaysIcon, title: 'Book Appointment', desc: 'Schedule appointments with government officers for in-person consultations.', link: '/appointments', colorIdx: 3 },
];

const stepColors = ['#f3722c', '#43aa8b', '#577590', '#90be6d'];

const steps = [
  { num: '01', title: 'Register / Login', desc: 'Create your citizen account using your email and mobile number.' },
  { num: '02', title: 'File a Grievance', desc: 'Submit your complaint with details, documents and supporting evidence.' },
  { num: '03', title: 'Track Progress', desc: 'Monitor real-time updates as your grievance moves through the process.' },
  { num: '04', title: 'Get Resolution', desc: 'Receive an official resolution and provide your feedback on the process.' },
];

const testimonials = [
  { name: 'Ravi Shankar', role: 'Bengaluru, Karnataka', text: 'Filed a water supply complaint and it was resolved in 3 days. The tracking feature gave me full transparency.' },
  { name: 'Ayesha Mirza', role: 'Lucknow, Uttar Pradesh', text: 'The tracking dashboard kept me updated at every stage of my grievance. No confusion at all.' },
  { name: 'Priya Kulkarni', role: 'Nagpur, Maharashtra', text: 'Booking an appointment with the municipal office was so easy. No more standing in long queues.' },
];

const emptyStats = [
  { icon: DocumentTextIcon, label: 'Total Grievances', value: '-', color: 'text-secondary-300' },
  { icon: CheckCircleIcon, label: 'Resolved', value: '-', color: 'text-secondary-300' },
  { icon: ClockIcon, label: 'Pending', value: '-', color: 'text-secondary-300' },
  { icon: UserGroupIcon, label: 'Active Officers', value: '-', color: 'text-secondary-300' },
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
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(emptyStats);
  const [myGrievances, setMyGrievances] = useState<Grievance[]>([]);
  const [grievanceTab, setGrievanceTab] = useState<'all' | 'resolved' | 'pending'>('all');
  const [showBackTop, setShowBackTop] = useState(false);
  const [noticeIndex, setNoticeIndex] = useState(0);

  const notices = [
    { text: 'Last date for grievance updates extended to 31st July 2026.', link: '/announcements' },
    { text: 'Scheduled portal maintenance: Sunday, 2:00 AM - 4:00 AM IST.', link: '/announcements' },
    { text: 'Citizen helpline for grievance redressal: 1800-11-4000 (toll free).', link: '/announcements' },
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

  useEffect(() => {
    const onScroll = () => {
      setShowBackTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
          AppService.getAnnouncements(),
          AppService.getOfficers(),
        ]);
        setAnnouncements(announcementsData.slice(0, 3));
        if (isAuthenticated) {
          setStats(prev => {
            const next = [...prev];
            next[3] = { icon: UserGroupIcon, label: 'Active Officers', value: officersData.length.toString(), color: 'text-citizen-blue' };
            return next;
          });
        }
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, [isAuthenticated]);

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
        { icon: DocumentTextIcon, label: 'Total Grievances', value: total.toString(), color: 'text-primary-600' },
        { icon: CheckCircleIcon, label: 'Resolved', value: resolved.toString(), color: 'text-citizen-teal' },
        { icon: ClockIcon, label: 'Pending', value: pending.toString(), color: 'text-primary-400' },
        { icon: UserGroupIcon, label: 'Active Officers', value: prev[3]?.value || '0', color: 'text-citizen-blue' },
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
            Notice
          </span>
          <div className="overflow-hidden flex-1 relative h-8">
              <Link
                to={authHref(notices[noticeIndex].link)}
                className="absolute inset-0 flex items-center transition-all duration-500 ease-in-out"
                style={{ transform: 'translateY(0)', opacity: 1 }}
              >
                <span className="text-xs text-amber-800 font-medium">{notices[noticeIndex].text}</span>
              </Link>
          </div>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <section
        id="home"
        ref={el => { sectionRefs.current[0] = el; }}
        className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-citizen-yellow/5 blur-3xl" />
          <div className="absolute top-1/4 right-1/3 w-2 h-2 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '5s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="flex items-center gap-12">
            <div className="flex-1 max-w-3xl">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-primary-200 text-xs font-medium mb-5">
                  <SparklesIcon className="h-3.5 w-3.5" />
                  <span>Portal Status: All Services Operational</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                  Bridging Citizens &{' '}
                  <span className="text-citizen-yellow">Government</span>
                </h1>
                <p className="mt-5 text-base sm:text-lg text-primary-100/90 max-w-xl leading-relaxed">
                  File complaints, track their progress in real-time, book appointments with officers, and stay informed — all from the comfort of your home.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to={isAuthenticated ? '/file-grievance' : '/register'}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-xl font-bold text-sm hover:bg-primary-50 transition-all hover:shadow-2xl hover:shadow-black/20 active:scale-[0.97]"
                  >
                    <DocumentTextIcon className="h-5 w-5" />
                    {isAuthenticated ? 'File a Complaint' : 'Get Started'}
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => scrollTo('how')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-sm border border-white/15 hover:bg-white/20 transition-all"
                  >
                    How It Works
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex flex-shrink-0 items-center justify-center opacity-0 animate-fade-in-right relative -mr-12" style={{ perspective: '1200px' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-700/40 via-primary-700/20 to-transparent blur-3xl scale-150" />
              <div className="relative w-[36rem] group" style={{ perspective: '1200px' }}>
                <div className="relative transition-all duration-700 ease-out" style={{ transformStyle: 'preserve-3d' }}>
                  <div className="group-hover:[transform:rotateY(180deg)] transition-all duration-700 ease-out" style={{ transformStyle: 'preserve-3d' }}>
                    <div className="backface-hidden rounded-3xl overflow-hidden">
                      <img
                        src="/hero-illustration.png"
                        alt="hero illustration"
                        className="w-full h-auto opacity-75 animate-float rounded-3xl"
                      />
                    </div>
                    <div className="absolute inset-0 backface-hidden flex items-center justify-center p-8" style={{ transform: 'rotateY(180deg)' }}>
                      <div className="bg-secondary-50/95 rounded-2xl p-6 shadow-xl">
                        <p className="text-primary-700 text-sm font-medium leading-relaxed text-center">
                          Digital governance empowers every citizen with transparent, accessible, and efficient public services — bridging the gap between people and government.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isAuthenticated && (
        <section className="bg-secondary-900 py-10 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((s, i) => {
                const statColors = ['#f3722c', '#43aa8b', '#f9c74f', '#577590'];
                return (
                  <div key={s.label} className="relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full" style={{ backgroundColor: statColors[i] }} />
                    <div className="text-3xl sm:text-4xl font-bold font-serif" style={{ color: statColors[i] }}>
                      {isNaN(parseInt(s.value)) ? s.value : <AnimatedCounter value={s.value} />}
                      <span className="text-citizen-yellow">+</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <s.icon className="h-3.5 w-3.5 hidden sm:block" style={{ color: statColors[i] }} />
                      <div className="text-xs sm:text-sm text-secondary-400 tracking-wide">{s.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" ref={el => { sectionRefs.current[1] = el; }} className="py-14 sm:py-20 bg-white border-y border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-[1.4px] uppercase block mb-2" style={{ color: stepColors[0] }}>
              Process
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-secondary-900">
              Four Simple Steps
            </h2>
            <p className="mt-3 text-secondary-500 text-sm sm:text-base">
              Every service on this portal follows the same straightforward journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => {
              const stepColor = stepColors[i];
              const nextColor = i < steps.length - 1 ? stepColors[i + 1] : stepColor;
              return (
                <div key={s.num} className="relative">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px border-t-2 border-dashed"
                      style={{ borderColor: nextColor + '40' }} />
                  )}
                  <div className="text-center">
                    <div className="font-serif text-5xl font-black mb-3"
                      style={{ color: stepColor + '15', WebkitTextStroke: '1.5px ' + stepColor }}>
                      {s.num}
                    </div>
                    <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ backgroundColor: stepColor + '30' }} />
                    <h4 className="text-base font-bold text-secondary-900 mb-1.5">{s.title}</h4>
                    <p className="text-sm text-secondary-500 leading-relaxed max-w-[220px] mx-auto">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" ref={el => { sectionRefs.current[2] = el; }} className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold tracking-[1.4px] uppercase block mb-2" style={{ color: stepColors[2] }}>
              Citizen Services
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-secondary-900">
              How can we help you?
            </h2>
            <p className="mt-3 text-secondary-500 text-sm sm:text-base">
              Everything you need to connect with the government, all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s) => {
              const c = serviceColors[s.colorIdx];
              return (
                <Link
                  key={s.title}
                  to={authHref(s.link)}
                  className={'group bg-white border border-secondary-200 rounded-xl p-6 transition-all duration-300 ' + c.border + ' hover:shadow-xl ' + c.shadow + ' hover:-translate-y-1'}
                >
                  <div className={'w-11 h-11 rounded-xl bg-gradient-to-br ' + c.iconBg + ' flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg'}>
                    <s.icon className={'h-6 w-6 ' + c.iconColor} />
                  </div>
                  <h3 className="text-base font-bold text-secondary-900 mb-1.5">{s.title}</h3>
                  <p className="text-sm text-secondary-500 leading-relaxed mb-3">{s.desc}</p>
                  <span className={'text-xs font-bold ' + c.accent + ' inline-flex items-center gap-1 group-hover:gap-2 transition-all'}>
                    Apply now <ChevronRightIcon className="h-3.5 w-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== MY GRIEVANCES ===== */}
      {myGrievances.length > 0 && (
        <section className="pb-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-secondary-900">My Grievances</h2>
                <p className="text-sm text-secondary-500 mt-1">Track and manage your complaints</p>
              </div>
              <div className="flex gap-1 p-0.5 bg-secondary-100/80 rounded-lg">
                {(['all', 'resolved', 'pending'] as const).map((tab, ti) => {
                  const tabColors = ['#f3722c', '#43aa8b', '#f9c74f'];
                  return (
                    <button
                      key={tab}
                      onClick={() => setGrievanceTab(tab)}
                      className={'px-3 py-1.5 text-xs font-medium rounded-md transition-all ' + (grievanceTab === tab ? 'bg-white shadow-sm' : 'text-secondary-500 hover:text-secondary-700')}
                      style={grievanceTab === tab ? { color: tabColors[ti] } : {}}
                    >
                      {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
      )}

      {/* ===== CTA BANNER ===== */}
      <section className="pb-14 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 px-8 py-12 sm:px-14 sm:py-16 text-center">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 -left-20 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
              <div className="absolute bottom-0 -right-20 w-96 h-96 rounded-full bg-citizen-yellow/5 blur-3xl" />
            </div>
            <div className="relative max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-white">
                Ready to make your voice heard?
              </h2>
              <p className="mt-4 text-base sm:text-lg text-primary-100/90">
                Join thousands of citizens who are using JanaSetu to connect with the government and get their issues resolved.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  to={isAuthenticated ? '/file-grievance' : '/register'}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-xl font-bold text-sm hover:bg-primary-50 transition-all hover:shadow-2xl hover:shadow-black/20 active:scale-[0.97]"
                >
                  {isAuthenticated ? 'File a Complaint' : 'Create Free Account'}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  to={authHref('/track')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-sm border border-white/15 hover:bg-white/20 transition-all"
                >
                  Track a Grievance
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Back to top ===== */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={'fixed bottom-6 right-6 w-11 h-11 rounded-full bg-secondary-900 text-white shadow-xl flex items-center justify-center z-50 transition-all duration-300 hover:bg-citizen-yellow hover:text-secondary-900 ' + (showBackTop ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-3')}
        aria-label="Back to top"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="20" x2="12" y2="4" /><polyline points="18 10 12 4 6 10" />
        </svg>
      </button>

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
