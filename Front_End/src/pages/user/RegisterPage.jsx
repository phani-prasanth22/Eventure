import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(formData);
      toast.success('Account created successfully. Please sign in.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const passwordReqs = [
    { met: formData.password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
    { met: /[0-9]/.test(formData.password), text: 'One number' }
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.formSide}>
          <Link to="/" className={styles.logo}><span className={styles.logoIcon}>E</span><span className={styles.logoText}>Eventure</span></Link>
          <div className={styles.formWrapper}>
            <h1 className={styles.title}>Create an account</h1>
            <p className={styles.subtitle}>Join Eventure and start managing events today</p>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <form onSubmit={handleSubmit} className={styles.form}>
              <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter your name" leftIcon={<User size={18} />} fullWidth required />
              <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter your email" leftIcon={<Mail size={18} />} fullWidth required />
              <Input label="Phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Enter your phone" leftIcon={<Phone size={18} />} fullWidth />
              <Input label="Password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Create a password" leftIcon={<Lock size={18} />} rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>} fullWidth required />
              <Input label="Confirm Password" type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="Confirm your password" leftIcon={<Lock size={18} />} fullWidth required />
              <Button type="submit" fullWidth loading={loading}>Create Account</Button>
            </form>
            <p className={styles.authLink}>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
