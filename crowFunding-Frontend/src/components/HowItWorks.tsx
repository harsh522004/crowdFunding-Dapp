const STEPS = [
  {
    number: "01",
    title: "Create a Campaign",
    description:
      "Set your funding goal, deadline, and reward rate. Deploy your campaign to the blockchain with one click.",
    color: "blue",
  },
  {
    number: "02",
    title: "Contribute ETH",
    description:
      "Browse live campaigns and back the projects you believe in. Every contribution is recorded on-chain.",
    color: "purple",
  },
  {
    number: "03",
    title: "Earn KARMA Tokens",
    description:
      "Contributors automatically receive KARMA reward tokens proportional to their ETH contribution.",
    color: "green",
  },
  {
    number: "04",
    title: "Funds Released",
    description:
      "When a campaign succeeds, the creator withdraws funds. If it fails, contributors get a full refund.",
    color: "amber",
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  green: "bg-green-500/10 border-green-500/20 text-green-400",
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
};

export default function HowItWorks() {
  return (
    <section className="py-16 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            How It Works
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Four simple steps from idea to funded project — all on-chain, no
            middlemen.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="relative bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
            >
              <div
                className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border text-sm font-bold mb-4 ${colorMap[step.color]}`}
              >
                {step.number}
              </div>
              <h3 className="text-white font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
