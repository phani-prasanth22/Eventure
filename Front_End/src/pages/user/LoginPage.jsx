import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from === '/admin' || from?.startsWith('/admin') ? '/dashboard' : from, { replace: true });
      }
      toast.success('Welcome back!');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.formSide}>
          <Link to="/" className={styles.logo}><span className={styles.logoIcon}>E</span><span className={styles.logoText}>Eventure</span></Link>
          <div className={styles.formWrapper}>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>Sign in to your account to continue</p>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <form onSubmit={handleSubmit} className={styles.form}>
              <Input
                label="Email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Email"
                leftIcon={<Mail size={18} />}
                fullWidth
                required
              />
              <Input label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" leftIcon={<Lock size={18} />} rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>} fullWidth required />
              <Button type="submit" fullWidth loading={loading}>Sign In</Button>
            </form>
            <p className={styles.authLink}>Don't have an account? <Link to="/register">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
