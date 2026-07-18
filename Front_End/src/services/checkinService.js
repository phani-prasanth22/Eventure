import api from './api';

export const checkinService = {
  async scanQR(eventId, qrData) {
    const response = await api.post(
      `/registrations/event/${eventId}/checkin/`,
      { qr_data: qrData }
    );
    return response.data;
  },

  async getStats(eventId) {
    const response = await api.get(
      `/registrations/event/${eventId}/checkin/stats/`
    );
    return response.data;
  },

  async search(eventId, query) {
    const response = await api.post(
      `/registrations/event/${eventId}/checkin/search/`,
      { query }
    );
    return response.data;
  },

  async manualCheckIn(eventId, registrationId) {
    const response = await api.post(
      `/registrations/event/${eventId}/checkin/manual/`,
      { registration_id: registrationId }
    );
    return response.data;
  },
};

export default checkinService;