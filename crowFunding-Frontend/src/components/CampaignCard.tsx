import { formatWeiToEther, shortenAddress , calculateProgressPercentage} from '../utils/formatters';

type CampaignCardProps = {
    address : string;
    creator: string;
    goal: string; // wei as string
    deadline : number ;// timestamp
    totalRaised : string; // wei as string
    status: 'Funding' | 'Successful' | 'Failed' | 'Withdrawn';
    rewardRate : number ;
    onMoreDetails?: () => void;
};

function CampaignCard(props: CampaignCardProps) {
    // Calculate progress percentage
    const progressPercentage = calculateProgressPercentage(props.totalRaised, props.goal);
    const displayProgress = Math.min(progressPercentage, 100);

    // Status badge styling
    const getStatusBadge = () => {
        const badges = {
            'Funding': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'Successful': 'bg-green-500/20 text-green-400 border-green-500/30',
            'Failed': 'bg-red-500/20 text-red-400 border-red-500/30',
            'Withdrawn': 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        };
        return badges[props.status];
    };

    // Progress bar color
    const getProgressColor = () => {
        if (props.status === 'Successful' || displayProgress >= 100) return 'bg-green-500';
        if (props.status === 'Failed') return 'bg-red-500';
        return 'bg-blue-500';
    };

    return (
        <li className="group">
            <div className="h-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
                onClick={props.onMoreDetails}
            >
                {/* Header with Address and Status */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <p className="text-xs text-slate-500 mb-1">Campaign Address</p>
                        <p className="text-sm font-mono text-slate-300">{shortenAddress(props.address)}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge()}`}>
                        {props.status}
                    </span>
                </div>

                {/* Funding Progress */}
                <div className="mb-4">
                    <div className="flex justify-between items-baseline mb-2">
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {formatWeiToEther(props.totalRaised)} ETH
                            </p>
                            <p className="text-xs text-slate-400">raised of {formatWeiToEther(props.goal)} ETH goal</p>
                        </div>
                        <span className="text-sm font-semibold text-blue-400">{displayProgress}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full ${getProgressColor()} transition-all duration-500 rounded-full`}
                            style={{ width: `${displayProgress}%` }}
                        />
                    </div>
                </div>

                {/* Creator Info */}
                <div className="mb-4 pb-4 border-b border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">Created by</p>
                    <p className="text-sm font-mono text-slate-300">{shortenAddress(props.creator)}</p>
                </div>

                {/* Reward Rate */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs text-slate-500">Reward Rate</p>
                        <p className="text-sm font-semibold text-purple-400">{props.rewardRate} tokens/ETH</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-400">🎁</span>
                    </div>
                </div>

                {/* View Details Button */}
                <button
                    onClick={props.onMoreDetails}
                    className="w-full px-4 py-2.5 bg-slate-700/50 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200 group-hover:bg-blue-600"
                >
                    View Details →
                </button>
            </div>
        </li>
    );
}

export default CampaignCard;
