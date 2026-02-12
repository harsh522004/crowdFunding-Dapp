import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { useCreateCampaign } from '../features/campaigns/hooks';
import TransactionButton from '../components/TransactionButton';


function CreateCampaignPage() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const { createCampaign, newCampaignAddress, txState, txHash, isSuccess, error } = useCreateCampaign();

  // Form state
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('');
  const [tokensPerEth, setTokensPerEth] = useState('');

  // Error state
  const [errors, setErrors] = useState({
    goal: '',
    duration: '',
    tokensPerEth: '',
  });

  // Individual field validation functions
  const validateGoal = (value: string) => {
    if (!value) {
      return 'Goal is required';
    } else if (Number(value) <= 0) {
      return 'Goal must be greater than 0';
    } else if (isNaN(Number(value))) {
      return 'Please enter a valid number';
    } else if (Number(value) > 1000) {
      return 'Goal seems too high (max 1000 ETH)';
    }
    return '';
  };

  const validateDuration = (value: string) => {
    if (!value) {
      return 'Duration is required';
    } else if (Number(value) <= 0) {
      return 'Duration must be greater than 0';
    } else if (isNaN(Number(value))) {
      return 'Please enter a valid number';
    } else if (Number(value) > 365) {
      return 'Duration cannot exceed 365 days';
    } else if (!Number.isInteger(Number(value))) {
      return 'Duration must be a whole number';
    }
    return '';
  };

  const validateTokensPerEth = (value: string) => {
    if (!value) {
      return 'Reward rate is required';
    } else if (Number(value) <= 0) {
      return 'Reward rate must be greater than 0';
    } else if (isNaN(Number(value))) {
      return 'Please enter a valid number';
    } else if (!Number.isInteger(Number(value))) {
      return 'Reward rate must be a whole number';
    }
    return '';
  };

  // Handle field changes with real-time validation
  const handleGoalChange = (value: string) => {
    setGoal(value);
    setErrors(prev => ({ ...prev, goal: validateGoal(value) }));
  };

  const handleDurationChange = (value: string) => {
    setDuration(value);
    setErrors(prev => ({ ...prev, duration: validateDuration(value) }));
  };

  const handleTokensPerEthChange = (value: string) => {
    setTokensPerEth(value);
    setErrors(prev => ({ ...prev, tokensPerEth: validateTokensPerEth(value) }));
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      goal !== '' &&
      duration !== '' &&
      tokensPerEth !== '' &&
      !errors.goal &&
      !errors.duration &&
      !errors.tokensPerEth
    );
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields one more time before submission
    const goalError = validateGoal(goal);
    const durationError = validateDuration(duration);
    const tokensError = validateTokensPerEth(tokensPerEth);

    setErrors({
      goal: goalError,
      duration: durationError,
      tokensPerEth: tokensError,
    });

    if (!goalError && !durationError && !tokensError) {
      createCampaign({
        goalInEth: goal,
        durationInDays: duration,
        tokensPerEth: tokensPerEth,
      });
    }
  };


  useEffect(() => {
    if (isSuccess && newCampaignAddress) {
      setTimeout(() => {
        navigate(`/campaign/${newCampaignAddress}`);
      }, 2000);
    }
  }, [isSuccess, newCampaignAddress, navigate]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            Create New Campaign
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Launch your project and start raising funds
          </p>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto animate-fadeIn">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Goal Field */}
              <div>
                <label htmlFor="goal" className="block text-sm font-medium text-slate-300 mb-2">
                  Funding Goal (ETH) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="goal"
                    value={goal}
                    onChange={(e) => handleGoalChange(e.target.value)}
                    placeholder="e.g., 10"
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-3 bg-slate-900/50 border ${errors.goal ? 'border-red-500' : 'border-slate-600'
                      } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                    ETH
                  </span>
                </div>
                {errors.goal && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <span>⚠️</span> {errors.goal}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  The total amount you want to raise for your project
                </p>
              </div>

              {/* Duration Field */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-slate-300 mb-2">
                  Campaign Duration (Days) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="duration"
                    value={duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    placeholder="e.g., 30"
                    step="1"
                    min="0"
                    className={`w-full px-4 py-3 bg-slate-900/50 border ${errors.duration ? 'border-red-500' : 'border-slate-600'
                      } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                    Days
                  </span>
                </div>
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <span>⚠️</span> {errors.duration}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  How long your campaign will run (1-365 days)
                </p>
              </div>

              {/* Tokens Per ETH Field */}
              <div>
                <label htmlFor="tokensPerEth" className="block text-sm font-medium text-slate-300 mb-2">
                  Reward Rate (Tokens per ETH) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="tokensPerEth"
                    value={tokensPerEth}
                    onChange={(e) => handleTokensPerEthChange(e.target.value)}
                    placeholder="e.g., 100"
                    step="1"
                    min="0"
                    className={`w-full px-4 py-3 bg-slate-900/50 border ${errors.tokensPerEth ? 'border-red-500' : 'border-slate-600'
                      } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                    Tokens/ETH
                  </span>
                </div>
                {errors.tokensPerEth && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <span>⚠️</span> {errors.tokensPerEth}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  How many reward tokens contributors receive per 1 ETH
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 text-xl">ℹ️</span>
                  <div>
                    <p className="text-sm text-blue-300 font-medium mb-1">Campaign Preview</p>
                    <ul className="text-xs text-slate-400 space-y-1">
                      <li>• Goal: {goal || '0'} ETH</li>
                      <li>• Duration: {duration || '0'} days</li>
                      <li>• Reward: {tokensPerEth || '0'} tokens per ETH contributed</li>
                      {goal && tokensPerEth && (
                        <li className="text-purple-400 mt-2">
                          • Total tokens needed: {Number(goal) * Number(tokensPerEth)} tokens
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                {
                  !isConnected ? (
                    <p className="mb-4 text-center text-sm text-red-400">
                      ⚠️ Please connect your wallet to create a campaign.
                    </p>
                  ) : (
                    <TransactionButton
                      onClick={() => handleSubmit({} as React.FormEvent)}
                      label='Create Campaign'
                      txState={txState}
                      txHash={txHash}
                      error={error}
                      disabled={!isFormValid()}
                      fullWidth
                    />

                  )
                }
                {error && (
                  <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                    Error: {error}
                  </div>
                )}
                {isSuccess && newCampaignAddress && (
                  <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
                    ✅ Campaign created! Redirecting to campaign page...
                    <div className="text-sm mt-2">
                      Address: {newCampaignAddress}
                    </div>
                  </div>
                )}


                <p className="mt-3 text-xs text-center text-slate-500">
                  Note: Wallet connection and blockchain integration coming in Phase 3 & 5
                </p>
              </div>
            </form>
          </div>

          {/* Tips Section */}
          <div className="mt-8 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">💡 Tips for Success</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Set a realistic funding goal based on your project needs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Choose a duration that gives enough time but maintains urgency</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Reward rate should be attractive but sustainable for your project</span>
              </li>
            </ul>
          </div>
        </div>
      </div >
    </div >
  );
}

export default CreateCampaignPage;
