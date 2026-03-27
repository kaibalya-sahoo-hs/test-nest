import React from 'react';

const PricingPage = () => {
  const plans = [
    {
      name: "Basic",
      price: "14.99",
      features: [
        { text: "Free Setup", available: true },
        { text: "Bandwidth Limit 10 GB", available: true },
        { text: "20 User Connection", available: true },
        { text: "Analytics Report", available: false },
        { text: "Public API Access", available: false },
        { text: "Plugins Intregation", available: false },
        { text: "Custom Content Management", available: false },
      ],
      buttonStyle: "border border-[#4379EE] text-[#4379EE] hover:bg-blue-50",
      isPremium: false
    },
    {
      name: "Standard",
      price: "49.99",
      features: [
        { text: "Free Setup", available: true },
        { text: "Bandwidth Limit 10 GB", available: true },
        { text: "20 User Connection", available: true },
        { text: "Analytics Report", available: true },
        { text: "Public API Access", available: true },
        { text: "Plugins Intregation", available: false },
        { text: "Custom Content Management", available: false },
      ],
      buttonStyle: "border border-[#4379EE] text-[#4379EE] hover:bg-blue-50",
      isPremium: false
    },
    {
      name: "Premium",
      price: "89.99",
      features: [
        { text: "Free Setup", available: true },
        { text: "Bandwidth Limit 10 GB", available: true },
        { text: "20 User Connection", available: true },
        { text: "Analytics Report", available: true },
        { text: "Public API Access", available: true },
        { text: "Plugins Intregation", available: true },
        { text: "Custom Content Management", available: true },
      ],
      buttonStyle: "bg-[#4379EE] text-white hover:bg-blue-600",
      isPremium: true
    }
  ];

  return (
    <div className="p-10 mt-15 bg-[#F5F6FA] min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-[#202224] mb-10">Pricing</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-xl p-10 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden"
          >
            {/* Topographical Wavy Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none scale-150">
               <svg width="100%" height="100%" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 200 Q 250 150 500 300 T 1000 250" fill="none" stroke="black" strokeWidth="2" />
                <path d="M0 400 Q 300 350 600 500 T 1000 450" fill="none" stroke="black" strokeWidth="2" />
                <path d="M0 600 Q 200 550 400 700 T 1000 650" fill="none" stroke="black" strokeWidth="2" />
              </svg>
            </div>

            <div className="relative z-10 w-full flex flex-col items-center">
              <h2 className="text-2xl font-bold text-[#202224] mb-1">{plan.name}</h2>
              <p className="text-sm text-gray-500 font-medium mb-4">Monthly Charge</p>
              
              <div className="text-[#4379EE] text-5xl font-extrabold mb-10">
                ${plan.price}
              </div>

              <div className="w-full border-t border-gray-100 mb-8"></div>

              {/* Features List */}
              <div className="space-y-5 mb-10 w-full">
                {plan.features.map((feature, fIdx) => (
                  <p 
                    key={fIdx} 
                    className={`text-[15px] font-medium transition-colors ${
                      feature.available 
                      ? "text-[#202224]" 
                      : "text-gray-300 line-through decoration-1"
                    }`}
                  >
                    {feature.text}
                  </p>
                ))}
              </div>

              <div className="w-full border-t border-gray-100 mb-8"></div>

              {/* Action Buttons */}
              <button className={`w-52 py-3 rounded-full font-bold text-sm transition-all mb-4 ${plan.buttonStyle}`}>
                Get Started
              </button>
              
              <button className="text-[13px] font-bold text-[#202224] underline underline-offset-4 decoration-2 hover:text-[#4379EE]">
                Start Your 30 Day Free Trial
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;