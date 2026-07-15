import styles from './Button.module.css';

const variants = {
  primary: styles.primary,
  secondary: styles.secondary,
  outline: styles.outline,
  ghost: styles.ghost,
  danger: styles.danger
};

const sizes = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg
};

export default function Button({
  children,
  type = 'button',   // <-- important default
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${variants[variant]} ${sizes[size]} ${fullWidth ? styles.fullWidth : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className={styles.spinner} />}
      {!loading && leftIcon && <span className={styles.icon}>{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span className={styles.icon}>{rightIcon}</span>}
    </button>
  );
}