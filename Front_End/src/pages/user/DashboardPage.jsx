import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import EventCard from "../../components/events/EventCard";
import { EventCardSkeleton } from "../../components/common/Loader";

import registrationService from "../../services/registrationService";
import eventService from "../../services/eventService";

import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  const { user } = useAuth();

  const [registrations, setRegistrations] = useState([]);
  const [assignedEvents, setAssignedEvents] = useState([]);

  const [loadingRegistered, setLoadingRegistered] = useState(true);
  const [loadingAssigned, setLoadingAssigned] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      //-----------------------------------
      // Registered Events
      //-----------------------------------

      const regs = await registrationService.getUserRegistrations();

      const registered = await Promise.all(
        regs.slice(0, 3).map(async (reg) => {
          const event = await eventService.getEventById(reg.eventId);
          return event;
        })
      );

      setRegistrations(registered);

      //-----------------------------------
      // Assigned Events
      //-----------------------------------

      const assigned = await eventService.getAssignedEvents();

      setAssignedEvents(assigned);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRegistered(false);
      setLoadingAssigned(false);
    }
  };

  const quickActions = [
    {
      label: "Browse Events",
      href: "/events",
      icon: <Calendar size={20} />,
    },
    {
      label: "My Registrations",
      href: "/my-events",
      icon: <CheckCircle size={20} />,
    },
    {
      label: "My Assigned Events",
      href: "/my-assigned-events",
      icon: <Users size={20} />,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: <Users size={20} />,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Welcome back, {user?.username?.split("@")[0] || "User"}!
          </h1>

          <p className={styles.subtitle}>
            Here's what's happening with your events.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Main */}

          <div className={styles.mainSection}>
            {/* Registered */}

            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                My Registered Events
              </h2>

              <Link
                to="/my-events"
                className={styles.viewAll}
              >
                View All
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className={styles.eventsList}>
              {loadingRegistered ? (
                [...Array(3)].map((_, i) => (
                  <EventCardSkeleton key={i} />
                ))
              ) : registrations.length ? (
                registrations.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                  />
                ))
              ) : (
                <div className={styles.empty}>
                  <Calendar size={40} />
                  <h3>No registrations yet</h3>

                  <Link to="/events">
                    <button className={styles.browseBtn}>
                      Browse Events
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Assigned */}

            <div
              className={styles.sectionHeader}
              style={{ marginTop: "40px" }}
            >
              <h2 className={styles.sectionTitle}>
                My Assigned Events
              </h2>
            </div>

            <div className={styles.eventsList}>
              {loadingAssigned ? (
                [...Array(2)].map((_, i) => (
                  <EventCardSkeleton key={i} />
                ))
              ) : assignedEvents.length ? (
                assignedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                  />
                ))
              ) : (
                <div className={styles.empty}>
                  <Users size={40} />
                  <h3>No assigned events</h3>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}

          <div className={styles.sidebar}>
            <div className={styles.quickActions}>
              <h3 className={styles.sidebarTitle}>
                Quick Actions
              </h3>

              <div className={styles.actionsList}>
                {quickActions.map((action, i) => (
                  <Link
                    key={i}
                    to={action.href}
                    className={styles.actionItem}
                  >
                    <span>{action.icon}</span>
                    <span>{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}