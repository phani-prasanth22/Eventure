import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, QrCode, BarChart3 } from 'lucide-react';
import Button from '../components/common/Button';
import EventCard from '../components/events/EventCard';
import { EventCardSkeleton } from '../components/common/Loader';
import eventService from '../services/eventService';
import { mockTestimonials, mockEvents } from '../assets/data/mockEvents';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await eventService.getUpcomingEvents(6);
        setUpcomingEvents(events);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const features = [
    { icon: <Calendar size={28} />, title: 'Event Creation', description: 'Create and manage events effortlessly.' },
    { icon: <Users size={28} />, title: 'Online Registration', description: 'Seamless registration for attendees.' },
    { icon: <QrCode size={28} />, title: 'QR Ticketing', description: 'Generate and scan tickets instantly.' },
    { icon: <BarChart3 size={28} />, title: 'Analytics Dashboard', description: 'Track registrations in real-time.' }
  ];

  const stats = [
    { value: '10K+', label: 'Events Created' },
    { value: '500K+', label: 'Registrations' },
    { value: '98%', label: 'Satisfaction' }
  ];

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Create Memorable <span className={styles.gradient}>Events</span> with Ease</h1>
          <p className={styles.heroSubtitle}>Eventure empowers organizers to create, manage, and sell out events effortlessly.</p>
          <div className={styles.heroActions}>
            <Link to="/events"><Button size="lg" rightIcon={<ArrowRight size={18} />}>Explore Events</Button></Link>
            <Link to="/register"><Button variant="outline" size="lg">Get Started Free</Button></Link>
          </div>
          <div className={styles.heroStats}>
            {stats.map((stat, i) => (
              <div key={i} className={styles.stat}>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.features}`}>
        <div className="container">
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-subtitle">Powerful features to manage events of any size.</p>
          <div className={styles.featuresGrid}>
            {features.map((feature, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.events}`}>
        <div className="container">
          <h2 className="section-title">Upcoming Events</h2>
          <p className="section-subtitle">Don't miss out on these exciting upcoming events.</p>
          <div className={styles.eventsGrid}>
            {loading ? [...Array(6)].map((_, i) => <EventCardSkeleton key={i} />) : upcomingEvents.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
          <div className={styles.eventsCta}>
            <Link to="/events"><Button variant="outline" size="lg" rightIcon={<ArrowRight size={18} />}>View All Events</Button></Link>
          </div>
        </div>
      </section>

      <section className={`section ${styles.cta}`}>
        <div className="container">
          <h2 className={styles.ctaTitle}>Ready to Create Your First Event?</h2>
          <p className={styles.ctaText}>Join thousands of organizers who trust Eventure.</p>
          <Link to="/register"><Button size="lg" rightIcon={<ArrowRight size={18} />}>Get Started Free</Button></Link>
        </div>
      </section>
    </div>
  );
}
