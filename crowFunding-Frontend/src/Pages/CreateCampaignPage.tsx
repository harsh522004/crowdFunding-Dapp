import { useState } from 'react';

// Form which allows users to create a new campaign with goal in ETH, Duration in days and Reward Rate PER ETH with Require validation
function CreateCampaignPage() {
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

  // Validation function
  const validateForm = () => {
    const newErrors = {
      goal: '',
      duration: '',
      tokensPerEth: '',
    };

    let isValid = true;

    // Validate Goal
    if (!goal) {
      newErrors.goal = 'Goal is required';
      isValid = false;
    } else if (Number(goal) <= 0) {
      newErrors.goal = 'Goal must be greater than 0';
      isValid = false;
    } else if (Number(goal) > 1000) {
      newErrors.goal = 'Goal seems too high (max 1000 ETH)';
      isValid = false;
    }

    // Validate Duration
    if (!duration) {
      newErrors.duration = 'Duration is required';
      isValid = false;
    } else if (Number(duration) <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
      isValid = false;
    } else if (Number(duration) > 365) {
      newErrors.duration = 'Duration cannot exceed 365 days';
      isValid = false;
    }

    // Validate Tokens Per ETH
    if (!tokensPerEth) {
      newErrors.tokensPerEth = 'Reward rate is required';
      isValid = false;
    } else if (Number(tokensPerEth) <= 0) {
      newErrors.tokensPerEth = 'Reward rate must be greater than 0';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // TODO: In Phase 5, we'll call the smart contract here
      console.log('Form is valid! Creating campaign...');
      console.log({ goal, duration, tokensPerEth });
      alert(`Campaign Details:\nGoal: ${goal} ETH\nDuration: ${duration} days\nReward: ${tokensPerEth} tokens/ETH`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Create New Campaign</h2>
          <p className="text-slate-400">Launch your project and start raising funds</p>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto">
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
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., 10"
                    step="0.01"
                    className={`w-full px-4 py-3 bg-slate-900/50 border ${
                      errors.goal ? 'border-red-500' : 'border-slate-600'
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
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 30"
                    step="1"
                    className={`w-full px-4 py-3 bg-slate-900/50 border ${
                      errors.duration ? 'border-red-500' : 'border-slate-600'
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
                    onChange={(e) => setTokensPerEth(e.target.value)}
                    placeholder="e.g., 100"
                    step="1"
                    className={`w-full px-4 py-3 bg-slate-900/50 border ${
                      errors.tokensPerEth ? 'border-red-500' : 'border-slate-600'
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
                <button
                  type="submit"
                  className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Create Campaign
                </button>
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
      </div>
    </div>
  );
}

export default CreateCampaignPage;
