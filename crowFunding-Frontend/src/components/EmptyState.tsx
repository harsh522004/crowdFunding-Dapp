import { useNavigate } from 'react-router-dom';

type EmptyStateProps = {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionPath?: string;
};

function EmptyState({ icon, title, description, actionLabel, actionPath }: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="text-6xl mb-6 animate-bounce">{icon}</div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>

        {/* Description */}
        <p className="text-slate-400 mb-6">{description}</p>

        {/* Action Button */}
        {actionLabel && actionPath && (
          <button
            onClick={() => navigate(actionPath)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default EmptyState;
