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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('');
  const [tokensPerEth, setTokensPerEth] = useState('');

  // Error state
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    goal: '',
    duration: '',
    tokensPerEth: '',
  });

  // Individual field validation functions
  const validateTitle = (value: string) => {
    if (!value) {
      return 'Title is required';
    } else if (value.length < 3) {
      return 'Title must be at least 3 characters';
    } else if (value.length > 100) {
      return 'Title cannot exceed 100 characters';
    }
    return '';
  };

  const validateDescription = (value: string) => {
    if (!value) {
      return 'Description is required';
    } else if (value.length < 10) {
      return 'Description must be at least 10 characters';
    } else if (value.length > 500) {
      return 'Description cannot exceed 500 characters';
    }
    return '';
  };

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
  const handleTitleChange = (value: string) => {
    setTitle(value);
    setErrors(prev => ({ ...prev, title: validateTitle(value) }));
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setErrors(prev => ({ ...prev, description: validateDescription(value) }));
  };

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
      title !== '' &&
      description !== '' &&
      goal !== '' &&
      duration !== '' &&
      tokensPerEth !== '' &&
      !errors.title &&
      !errors.description &&
      !errors.goal &&
      !errors.duration &&
      !errors.tokensPerEth
    );
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields one more time before submission
    const titleError = validateTitle(title);
    const descriptionError = validateDescription(description);
    const goalError = validateGoal(goal);
    const durationError = validateDuration(duration);
    const tokensError = validateTokensPerEth(tokensPerEth);

    setErrors({
      title: titleError,
      description: descriptionError,
      goal: goalError,
      duration: durationError,
      tokensPerEth: tokensError,
    });

    if (!titleError && !descriptionError && !goalError && !durationError && !tokensError) {
      createCampaign({
        title: title,
        description: description,
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

              {/* Title Field */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                  Campaign Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g., Build a Community Center"
                  maxLength={100}
                  className={`w-full px-4 py-3 bg-slate-900/50 border ${errors.title ? 'border-red-500' : 'border-slate-600'
                    } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <span>⚠️</span> {errors.title}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  A catchy title for your campaign (3-100 characters)
                </p>
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="Describe your project, its goals, and how the funds will be used..."
                  maxLength={500}
                  rows={4}
                  className={`w-full px-4 py-3 bg-slate-900/50 border ${errors.description ? 'border-red-500' : 'border-slate-600'
                    } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <span>⚠️</span> {errors.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  {description.length}/500 characters - Tell potential contributors about your project
                </p>
              </div>

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
                      <li>• Title: {title || 'Not set'}</li>
                      <li>• Description: {description ? `${description.substring(0, 50)}...` : 'Not set'}</li>
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
