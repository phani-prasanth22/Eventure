import api from './api';

const USE_MOCK = false;

export const registrationService = {
  async createRegistration(registrationData) {
    if (USE_MOCK) {
      return {
        id: String(Date.now()),
        ...registrationData,
        status: 'registered',
        registered_at: new Date().toISOString(),
        qrCode: null,
      };
    }

    const payload = {
      event: registrationData.eventId,
      full_name: registrationData.fullName?.trim(),
      email: registrationData.email?.trim(),
      phone: registrationData.phone?.trim(),
      college: registrationData.college?.trim(),
      year: registrationData.year?.trim() || '',
    };

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
      qrCode: d.qr_code,  // full URL like http://localhost:8000/media/qrcodes/registration_3.png
    };
  },

  async getUserRegistrations() {
    if (USE_MOCK) return [];
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
      qrCode: d.qr_code,
    }));
  },

  async cancelRegistration(id) {
    if (USE_MOCK) return { id, status: 'cancelled' };
    const response = await api.post(`/registrations/${id}/cancel/`);
    return response.data;
  },

  async getEventAttendees(eventId, params = {}) {
    if (USE_MOCK) {
      return { registrations: [], total: 0, page: 1, totalPages: 1 };
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
      qrCode: d.qr_code,
    }));
    return { registrations, total: registrations.length, page: 1, totalPages: 1 };
  },

  async downloadEventAttendees(eventId) {
    if (USE_MOCK) return null;
    const response = await api.get(
      `/registrations/event/${eventId}/attendees/download/`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  async getAllRegistrations(params = {}) {
    if (USE_MOCK) return { registrations: [], total: 0, page: 1, totalPages: 1 };
    const response = await api.get('/registrations/', { params });
    return response.data;
  },

  async getRegistrationStats() {
    if (USE_MOCK) return { total: 0, confirmed: 0, pending: 0 };
    const response = await api.get('/registrations/stats/');
    return response.data;
  },
};

export default registrationService;