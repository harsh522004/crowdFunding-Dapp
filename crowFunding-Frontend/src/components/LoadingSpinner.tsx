type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'white' | 'purple';
};

function LoadingSpinner({ size = 'md', color = 'blue' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  const colorClasses = {
    blue: 'border-blue-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    purple: 'border-purple-500 border-t-transparent',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
}

export default LoadingSpinner;
