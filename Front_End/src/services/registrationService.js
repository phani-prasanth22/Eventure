import api from './api';

const USE_MOCK = false;

export const registrationService = {
  async createRegistration(registrationData) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return {
        id: String(Date.now()),
        ...registrationData,
        status: 'registered',
        registered_at: new Date().toISOString(),
      };
    }

    const payload = {
      event: registrationData.eventId,
      full_name: registrationData.fullName?.trim(),
      email: registrationData.email?.trim(),
      phone: registrationData.phone?.trim(),
      college: registrationData.college?.trim(),
      year: registrationData.year?.trim(),
    };

    console.log('REGISTRATION PAYLOAD:', payload);

    const response = await api.post('/registrations/register/', payload);

    const d = response.data;
    return {
      id: d.id,
      eventId: d.event,
      userId: d.user,
      fullName: d.full_name,
      email: d.email,
      phone: d.phone,
      college: d.college,
      year: d.year,
      status: d.status,
      registeredAt: d.registered_at,
    };
  },
  async getUserRegistrations() {
    if (USE_MOCK) {
      return [];
    }
    const response = await api.get('/registrations/my-registrations/');
    return response.data.map((d) => ({
      id: d.id,
      eventId: d.event,
      userId: d.user,
      fullName: d.full_name,
      email: d.email,
      phone: d.phone,
      college: d.college,
      year: d.year,
      status: d.status,
      registeredAt: d.registered_at,
    }));
  },

  async cancelRegistration(id) {
    if (USE_MOCK) {
      return { id, status: 'cancelled' };
    }
    const response = await api.post(`/registrations/${id}/cancel/`);
    return response.data;
  },

  async getEventAttendees(eventId, params = {}) {
    if (USE_MOCK) {
      return {
        registrations: [],
        total: 0,
        page: 1,
        totalPages: 1,
      };
    }

    const response = await api.get(
      `/registrations/event/${eventId}/attendees/`,
      { params }
    );

    const registrations = response.data.map((d) => ({
      id: d.id,
      fullName: d.full_name,
      email: d.email,
      phone: d.phone,
      college: d.college,
      year: d.year,
      status: d.status,
      registeredAt: d.registered_at,
    }));

    return {
      registrations,
      total: registrations.length,
      page: 1,
      totalPages: 1,
    };
  },

  async downloadEventAttendees(eventId) {
    if (USE_MOCK) {
      return null;
    }
    const response = await api.get(
      `/registrations/event/${eventId}/attendees/download/`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  async getAllRegistrations(params = {}) {
    if (USE_MOCK) {
      return { registrations: [], total: 0, page: 1, totalPages: 1 };
    }
    const response = await api.get('/registrations/', { params });
    return response.data;
  },

  async getRegistrationStats() {
    if (USE_MOCK) {
      return { total: 0, confirmed: 0, pending: 0 };
    }
    const response = await api.get('/registrations/stats/');
    return response.data;
  },
};

export default registrationService;