import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import {
  DocumentTextIcon, MagnifyingGlassIcon, MegaphoneIcon, CalendarDaysIcon,
  CheckCircleIcon, ClockIcon, UserGroupIcon, ArrowRightIcon,
} from '@heroicons/react/24/outline';
import AppService from '../services/appService';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Announcement, Grievance } from '../types';

const features = [
  { icon: DocumentTextIcon, title: 'File Grievance', desc: 'Submit your complaint online and get a unique tracking ID', link: '/file-grievance', color: 'bg-primary-500' },
  { icon: MagnifyingGlassIcon, title: 'Track Status', desc: 'Track your grievance status anytime with your tracking ID', link: '/track', color: 'bg-citizen-teal' },
  { icon: MegaphoneIcon, title: 'Announcements', desc: 'Stay updated with official announcements and notices', link: '/announcements', color: 'bg-citizen-yellow' },
  { icon: CalendarDaysIcon, title: 'Book Appointment', desc: 'Schedule appointments with government officers', link: '/appointments', color: 'bg-citizen-blue' },
];

const emptyStats = [
  { icon: DocumentTextIcon, label: 'Total Grievances', value: '-', color: 'text-secondary-300' },
  { icon: CheckCircleIcon, label: 'Resolved', value: '-', color: 'text-secondary-300' },
  { icon: ClockIcon, label: 'Pending', value: '-', color: 'text-secondary-300' },
  { icon: UserGroupIcon, label: 'Active Officers', value: '-', color: 'text-secondary-300' },
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(emptyStats);
  const [myGrievances, setMyGrievances] = useState<Grievance[]>([]);

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
      } catch {} finally {
        setLoading(false);
      }
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
        { icon: DocumentTextIcon, label: 'My Grievances', value: total.toString(), color: 'text-primary-600' },
        { icon: CheckCircleIcon, label: 'Resolved', value: resolved.toString(), color: 'text-citizen-teal' },
        { icon: ClockIcon, label: 'Pending', value: pending.toString(), color: 'text-primary-400' },
        { icon: UserGroupIcon, label: 'Active Officers', value: prev[3]?.value || '0', color: 'text-citizen-blue' },
      ]);
    });
    return unsub;
  }, [isAuthenticated, user]);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 px-8 py-12 sm:px-12 sm:py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white" />
        </div>
        <div className="relative">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Welcome to <span className="text-primary-200">JanaSetu</span>
          </h1>
          <p className="mt-4 text-lg text-primary-100 max-w-2xl">
            Smart Grievance Tracking & Citizen-Government Bridge System. 
            File complaints, track their progress, book appointments, and stay informed — all from home.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/file-grievance" className="inline-flex items-center px-6 py-3 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-colors">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              File a Complaint
            </Link>
            <Link to="/track" className="inline-flex items-center px-6 py-3 bg-primary-500/20 text-white rounded-xl font-semibold hover:bg-primary-500/30 transition-colors border border-primary-400/30">
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              Track Grievance
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-6">How can we help you?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <Link key={f.title} to={f.link} className="card p-6 hover:shadow-lg transition-all group">
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-1">{f.title}</h3>
              <p className="text-sm text-secondary-500">{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5 text-center">
            <s.icon className={`h-8 w-8 mx-auto mb-2 ${s.color}`} />
            <p className="text-2xl font-bold text-secondary-900">{s.value}</p>
            <p className="text-sm text-secondary-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Latest Announcements */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-secondary-900">Latest Announcements</h2>
          <Link to="/announcements" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all</Link>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : announcements.length === 0 ? (
          <div className="card p-8 text-center text-secondary-500">No announcements yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {announcements.map((a) => (
              <div key={a.id} className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge status={a.type} size="sm" />
                  <Badge status={a.priority} size="sm" />
                </div>
                <h3 className="font-semibold text-secondary-900 mb-1 line-clamp-2">{a.title}</h3>
                <p className="text-sm text-secondary-500 line-clamp-3">{a.content}</p>
                <p className="text-xs text-secondary-400 mt-3">
                  {new Date(a.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Grievances */}
      {myGrievances.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-secondary-900">My Grievances</h2>
            <Link to="/track" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              Track a Grievance <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {myGrievances.slice(0, 5).map(g => (
              <Link key={g.id} to="/track" className="card card-body block hover:shadow-md transition-shadow">
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
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-secondary-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/file-grievance" className="flex items-center gap-3 p-4 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors">
            <DocumentTextIcon className="h-6 w-6 shrink-0" />
            <span className="font-medium">File New Complaint</span>
          </Link>
          <Link to="/track" className="flex items-center gap-3 p-4 rounded-lg bg-citizen-teal/10 text-citizen-teal hover:bg-citizen-teal/20 transition-colors">
            <MagnifyingGlassIcon className="h-6 w-6 shrink-0" />
            <span className="font-medium">Track Existing Complaint</span>
          </Link>
          <Link to="/appointments" className="flex items-center gap-3 p-4 rounded-lg bg-citizen-blue/10 text-citizen-blue hover:bg-citizen-blue/20 transition-colors">
            <CalendarDaysIcon className="h-6 w-6 shrink-0" />
            <span className="font-medium">Book Appointment</span>
          </Link>
        </div>
      </div>
    </div>
  );
}