import api from './api';
import { mockEvents, eventCategories, locations } from '../assets/data/mockEvents';

const USE_MOCK = false;

const STORAGE_KEY = 'eventure_mock_events';

function getEventsData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { }
  return [...mockEvents];
}

function saveEventsData(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

let eventsData = getEventsData();

const buildEventPayload = (eventData) => {
  const payload = {
    title: eventData.title,
    description: eventData.description,
    category: eventData.category,
    date: eventData.date,
    time: eventData.time,
    location: eventData.location,
    capacity: eventData.capacity,
    price: eventData.price || 0,
    registration_deadline: eventData.registrationDeadline || eventData.registration_deadline || null,
  };
  Object.keys(payload).forEach((key) => {
    if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
      delete payload[key];
    }
  });
  return payload;
};

export const eventService = {
  async getAllEvents(params = {}) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      eventsData = getEventsData();
      const page = params.page || 1;
      const limit = params.limit || 10;
      const start = (page - 1) * limit;
      return {
        events: eventsData.slice(start, start + limit),
        total: eventsData.length,
        page,
        totalPages: Math.ceil(eventsData.length / limit),
      };
    }
    const response = await api.get('/events/admin/all/');
    let events = response.data;
    if (params.approvalStatus && params.approvalStatus !== 'all') {
      events = events.filter((event) => event.status === params.approvalStatus);
    }
    return { events, total: events.length, page: 1, totalPages: 1 };
  },

  async getPublicEvents(params = {}) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      eventsData = getEventsData();
      let filtered = eventsData.filter((e) => e.status === 'approved');
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.title?.toLowerCase().includes(search) ||
            e.description?.toLowerCase().includes(search) ||
            e.location?.toLowerCase().includes(search)
        );
      }
      if (params.category) filtered = filtered.filter((e) => e.category === params.category);
      if (params.location) filtered = filtered.filter((e) => e.location?.includes(params.location));
      if (params.sortBy) {
        switch (params.sortBy) {
          case 'date_asc': filtered.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
          case 'date_desc': filtered.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
          case 'price_asc': filtered.sort((a, b) => a.price - b.price); break;
          case 'price_desc': filtered.sort((a, b) => b.price - a.price); break;
          default: break;
        }
      }
      const page = params.page || 1;
      const limit = params.limit || 12;
      const start = (page - 1) * limit;
      return {
        events: filtered.slice(start, start + limit),
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / limit),
      };
    }

    const response = await api.get('/events/', { params });
    let events = response.data || [];
    events = events.filter((event) => event.status === 'approved');
    if (params.search) {
      const search = params.search.toLowerCase();
      events = events.filter(
        (e) =>
          e.title?.toLowerCase().includes(search) ||
          e.description?.toLowerCase().includes(search) ||
          e.location?.toLowerCase().includes(search)
      );
    }
    if (params.category) events = events.filter((e) => e.category === params.category);
    if (params.location) events = events.filter((e) => e.location?.includes(params.location));
    if (params.sortBy) {
      switch (params.sortBy) {
        case 'date_asc': events.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
        case 'date_desc': events.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
        case 'price_asc': events.sort((a, b) => a.price - b.price); break;
        case 'price_desc': events.sort((a, b) => b.price - a.price); break;
        default: break;
      }
    }
    const page = params.page || 1;
    const limit = params.limit || 12;
    const start = (page - 1) * limit;
    return {
      events: events.slice(start, start + limit),
      total: events.length,
      page,
      totalPages: Math.ceil(events.length / limit),
    };
  },

  async getPendingApprovals(params = {}) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      eventsData = getEventsData();
      let pending = eventsData.filter((e) => e.approvalStatus === 'pending');
      const page = params.page || 1;
      const limit = params.limit || 10;
      const start = (page - 1) * limit;
      return {
        events: pending.slice(start, start + limit),
        total: pending.length,
        page,
        totalPages: Math.ceil(pending.length / limit),
      };
    }
    const response = await api.get('/events/admin/all/');
    const events = response.data.filter((event) => event.status === 'pending');
    return { events, total: events.length, page: 1, totalPages: 1 };
  },

  async getOrganizerEvents(organizerId, params = {}) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      eventsData = getEventsData();
      let filtered = eventsData.filter((e) => e.organizerId === organizerId);
      if (params.approvalStatus) {
        filtered = filtered.filter((e) => e.approvalStatus === params.approvalStatus);
      }
      const page = params.page || 1;
      const limit = params.limit || 10;
      const start = (page - 1) * limit;
      return {
        events: filtered.slice(start, start + limit),
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / limit),
      };
    }
    const response = await api.get('/events/my-events/');
    let events = response.data;
    if (params.approvalStatus && params.approvalStatus !== 'all') {
      events = events.filter((event) => event.status === params.approvalStatus);
    }
    return { events, total: events.length, page: 1, totalPages: 1 };
  },

  async submitEventForApproval(eventData) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    eventsData = getEventsData();
    const newEvent = {
      id: String(Date.now()),
      ...eventData,
      registered: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      schedule: eventData.schedule || [],
      speakers: eventData.speakers || [],
      rules: eventData.rules || [],
    };
    eventsData.unshift(newEvent);
    saveEventsData(eventsData);
    return newEvent;
  }
  // Send as-is — UserCreateEvent.jsx already maps to model field names
  const response = await api.post('/events/create/', eventData);
  return response.data;
},

  async approveEvent(eventId, reviewNotes = '') {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      eventsData = getEventsData();
      const idx = eventsData.findIndex((e) => e.id === eventId);
      if (idx !== -1) {
        eventsData[idx] = { ...eventsData[idx], approvalStatus: 'approved', reviewNotes };
        saveEventsData(eventsData);
        return eventsData[idx];
      }
      throw new Error('Event not found');
    }
    const response = await api.patch(`/events/admin/${eventId}/status/`, { status: 'approved' });
    return response.data;
  },

  async rejectEvent(eventId, reviewNotes) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      eventsData = getEventsData();
      const idx = eventsData.findIndex((e) => e.id === eventId);
      if (idx !== -1) {
        eventsData[idx] = { ...eventsData[idx], approvalStatus: 'rejected', reviewNotes };
        saveEventsData(eventsData);
        return eventsData[idx];
      }
      throw new Error('Event not found');
    }
    const response = await api.patch(`/events/admin/${eventId}/status/`, {
      status: 'rejected',
      rejection_reason: reviewNotes,
    });
    return response.data;
  },

  async cancelEvent(eventId, reviewNotes) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      eventsData = getEventsData();
      const idx = eventsData.findIndex((e) => e.id === eventId);
      if (idx !== -1) {
        eventsData[idx] = { ...eventsData[idx], approvalStatus: 'cancelled', reviewNotes };
        saveEventsData(eventsData);
        return eventsData[idx];
      }
      throw new Error('Event not found');
    }
    const response = await api.patch(`/events/admin/${eventId}/status/`, {
      status: 'cancelled',
      cancellation_reason: reviewNotes,
    });
    return response.data;
  },

  async getEventById(id) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      eventsData = getEventsData();
      const event = eventsData.find((e) => String(e.id) === String(id));
      if (!event) throw new Error('Event not found');
      return event;
    }
    const response = await api.get(`/events/${id}/`);
    return response.data;
  },

  async getUpcomingEvents(limit = 6) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      eventsData = getEventsData();
      return eventsData
        .filter((e) => e.status === 'approved' && new Date(e.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, limit);
    }
    const response = await api.get('/events/');
    return (response.data || [])
      .filter((e) => e.status === 'approved' && new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, limit);
  },

  async createEvent(eventData) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      eventsData = getEventsData();
      const newEvent = {
        id: String(Date.now()),
        ...eventData,
        registered: 0,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'pending',
        schedule: eventData.schedule || [],
        speakers: eventData.speakers || [],
        rules: eventData.rules || [],
      };
      eventsData.unshift(newEvent);
      saveEventsData(eventsData);
      return newEvent;
    }
    const response = await api.post('/events/create/', buildEventPayload(eventData));
    return response.data;
  },

  async updateEvent(id, eventData) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      eventsData = getEventsData();
      const index = eventsData.findIndex((e) => e.id === id);
      if (index === -1) throw new Error('Event not found');
      const originalOrganizerId = eventsData[index].organizerId;
      eventsData[index] = { ...eventsData[index], ...eventData, organizerId: originalOrganizerId };
      saveEventsData(eventsData);
      return eventsData[index];
    }
    const response = await api.put(`/events/${id}/`, buildEventPayload(eventData));
    return response.data;
  },

  async deleteEvent(id) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      eventsData = getEventsData();
      const index = eventsData.findIndex((e) => e.id === id);
      if (index === -1) throw new Error('Event not found');
      eventsData.splice(index, 1);
      saveEventsData(eventsData);
      return { success: true };
    }
    const response = await api.delete(`/events/${id}/`);
    return response.data;
  },

  async saveDraft(id, eventData) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      eventsData = getEventsData();
      const data = { ...eventData, status: 'draft' };
      if (id) {
        const index = eventsData.findIndex((e) => e.id === id);
        if (index !== -1) {
          const originalOrganizerId = eventsData[index].organizerId;
          eventsData[index] = { ...eventsData[index], ...data, organizerId: originalOrganizerId };
          saveEventsData(eventsData);
          return eventsData[index];
        }
      }
      const newEvent = {
        id: String(Date.now()),
        ...data,
        registered: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      eventsData.unshift(newEvent);
      saveEventsData(eventsData);
      return newEvent;
    }
    const response = await api.post(`/events/${id || ''}/draft`, eventData);
    return response.data;
  },

  async publishEvent(id) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      eventsData = getEventsData();
      const event = eventsData.find((e) => e.id === id);
      if (!event) throw new Error('Event not found');
      event.status = 'published';
      saveEventsData(eventsData);
      return event;
    }
    const response = await api.post(`/events/${id}/publish/`);
    return response.data;
  },

  async unpublishEvent(id) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      eventsData = getEventsData();
      const event = eventsData.find((e) => e.id === id);
      if (!event) throw new Error('Event not found');
      event.status = 'draft';
      saveEventsData(eventsData);
      return event;
    }
    const response = await api.post(`/events/${id}/unpublish/`);
    return response.data;
  },

  async getEventStats() {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      eventsData = getEventsData();
      return {
        totalEvents: eventsData.length,
        upcomingEvents: eventsData.filter((e) => e.status === 'upcoming' || e.status === 'published').length,
        draftEvents: eventsData.filter((e) => e.status === 'draft').length,
        completedEvents: eventsData.filter((e) => e.status === 'completed').length,
        totalRegistrations: eventsData.reduce((sum, e) => sum + (e.registered || 0), 0),
      };
    }
    const response = await api.get('/events/stats/');
    return response.data;
  },

  getCategories: () => eventCategories,
  getLocations: () => locations,
};

export default eventService;