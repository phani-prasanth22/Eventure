import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './pages/admin/AdminLayout';


// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/user/LoginPage';
import RegisterPage from './pages/user/RegisterPage';
import DashboardPage from './pages/user/DashboardPage';
import EventsPage from './pages/user/EventsPage';
import EventDetailsPage from './pages/user/EventDetailsPage';
import EventRegistrationPage from './pages/user/EventRegistrationPage';
import MyEventsPage from './pages/user/MyEventsPage';
import ManageTeamPage from './pages/user/ManageTeamPage';
import MyAssignedEventsPage from './pages/user/MyAssignedEventsPage';
import ProfilePage from './pages/user/ProfilePage';
import UserCreateEvent from './pages/user/UserCreateEvent';
import MyCreatedEvents from './pages/user/MyCreatedEvents';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRegistrations from './pages/admin/AdminRegistrations';
import CreateEvent from './pages/admin/CreateEvent';
import AdminEventApproval from './pages/admin/AdminEventApproval';
import EventAttendeesPage from './pages/user/EventAttendeesPage';
import NotFoundPage from './pages/NotFoundPage';
import EventCheckInPage from './pages/admin/EventCheckInPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'dashboard', element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
      { path: 'events', element: <EventsPage /> },
      { path: 'events/:id', element: <EventDetailsPage /> },
      { path: 'events/:id/register', element: <ProtectedRoute><EventRegistrationPage /></ProtectedRoute> },
      { path: 'my-events', element: <ProtectedRoute><MyEventsPage /></ProtectedRoute> },
      { path: 'my-created-events', element: <ProtectedRoute><MyCreatedEvents /></ProtectedRoute> },
      { path: 'create-event', element: <ProtectedRoute><UserCreateEvent /></ProtectedRoute> },
      { path: 'edit-event/:id', element: <ProtectedRoute><UserCreateEvent /></ProtectedRoute> },
      { path: 'events/:id/attendees', element: <ProtectedRoute><EventAttendeesPage /></ProtectedRoute> },
      { path: 'profile', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
      { path: '/events/:id/checkin', element: <EventCheckInPage /> },
      { path: 'events/:id/team', element: <ProtectedRoute><ManageTeamPage /></ProtectedRoute> },
      { path: 'my-assigned-events', element: <ProtectedRoute><MyAssignedEventsPage /></ProtectedRoute> },
      {
        path: 'admin',
        element: <ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'events', element: <AdminEvents /> },
          { path: 'events/create', element: <CreateEvent /> },
          { path: 'events/edit/:id', element: <CreateEvent /> },
          { path: 'event-approvals', element: <AdminEventApproval /> },
          { path: 'users', element: <AdminUsers /> },
          { path: 'registrations', element: <AdminRegistrations /> }
        ]
      },
      { path: '*', element: <NotFoundPage /> }
    ]
  }
]);

export default router;
