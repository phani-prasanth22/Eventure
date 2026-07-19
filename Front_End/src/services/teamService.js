import api from './api';

export const teamService = {
  async getTeamMembers(eventId) {
    const response = await api.get(`/events/${eventId}/team/`);
    return response.data;
  },

  async addTeamMember(eventId, email, role = 'volunteer') {
    const response = await api.post(`/events/${eventId}/team/`, { email, role });
    return response.data;
  },

  async removeTeamMember(eventId, memberId) {
    await api.delete(`/events/${eventId}/team/${memberId}/`);
    return true;
  },

  async getAssignedEvents() {
    const response = await api.get('/events/my-assigned-events/');
    return response.data;
  },
};

export default teamService;