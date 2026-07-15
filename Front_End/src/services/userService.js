import api from './api';
import { mockUsers } from '../assets/data/mockEvents';

const USE_MOCK = false;
let usersData = [...mockUsers];

export const userService = {
  async getAllUsers(params = {}) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      let filtered = [...usersData];
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter((u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));
      }
      const page = params.page || 1;
      const limit = params.limit || 10;
      const start = (page - 1) * limit;
      return { users: filtered.slice(start, start + limit), total: filtered.length, page, totalPages: Math.ceil(filtered.length / limit) };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    let users = data || [];
    if (params.search) {
      const search = params.search.toLowerCase();
      users = users.filter((u) => (u.full_name || '').toLowerCase().includes(search) || u.email.toLowerCase().includes(search));
    }
    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;
    return {
      users: users.slice(start, start + limit).map(u => ({
        id: u.id,
        name: u.full_name || 'Unknown',
        email: u.email,
        phone: u.phone || '',
        role: u.role,
        status: u.is_approved ? 'active' : 'banned',
        createdAt: u.created_at,
      })),
      total: users.length,
      page,
      totalPages: Math.ceil(users.length / limit),
    };
  },

  async banUser(id) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      const user = usersData.find((u) => u.id === id);
      if (user) user.status = 'banned';
      return user;
    }
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async unbanUser(id) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      const user = usersData.find((u) => u.id === id);
      if (user) user.status = 'active';
      return user;
    }
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true })
      .eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async deleteUser(id) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      const index = usersData.findIndex((u) => u.id === id);
      if (index === -1) throw new Error('User not found');
      usersData.splice(index, 1);
      return { success: true };
    }
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async getUserStats() {
    if (USE_MOCK) {
      return { total: usersData.length, active: usersData.filter((u) => u.status === 'active').length, banned: usersData.filter((u) => u.status === 'banned').length };
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('role, is_approved');
    if (error) throw new Error(error.message);
    return {
      total: data.length,
      active: data.filter(u => u.is_approved).length,
      banned: data.filter(u => !u.is_approved).length,
      admin: data.filter(u => u.role === 'admin').length,
      users: data.filter(u => u.role === 'user').length,
    };
  }
};

export default userService;
