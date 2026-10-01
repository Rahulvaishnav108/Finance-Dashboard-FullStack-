import React, { useState } from "react";
import { Copy, Check, Percent } from "lucide-react";

export interface Offer {
  id: number;
  discount: string;
  minOrder: string;
  code: string;
  image: string;
  bgColorClass: string;
  textColorClass: string;
}

export const OFFERS: Offer[] = [
  {
    id: 1,
    discount: "FLAT 20% OFF",
    minOrder: "On all orders above $30",
    code: "RESTO20",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlgSlHOutzfW0jOKKV4stacQtIIWCp_9nXgBdGyPxmsJ8tXytMGRUxk93R8lslNhRKwq-PkjrIsysepHJXMXO7ODl0lUPI__tpR0YnjFcCpbTJV6dx6OAGMUMtXZ45oU5stg_QxpOMv_9b6elQciNDmpJHfrcW_dWIf7Uqj6sd8UQQ2frRfxK26KjQPfkHrVHjoRYSnUW_yVbyfXNXQ2TGEefYSs-cjOc8R7t5FQSgYrAs51WJeelm8j_XRZr3GqscDIy759gXmWtu",
    bgColorClass: "bg-neutral-900",
    textColorClass: "text-white",
  },
  {
    id: 2,
    discount: "FLAT 25% OFF",
    minOrder: "On your first reservation",
    code: "FIRST25",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCViSYA0GPvsOBXbwG_XvhI3UZx22FFGBdTJOpyZwCQEl3hHjUaJROdJ-l4SLJAQTXbuyir07ubv3rH8ZZ0l5RElPSry6H0tBbKRDvdwfsdChW1-pCCxst3m1QY9TQFoUhb_0fueh0St5GTv_PfgHZDwptiSJ55YUuiLROj6Rozdemk4sFHQnVNookUAMSWyz1-QdUwMiRobThCZEymKfaWtt0k1D1B6MDhVi0iReNN9qIOu9av99MFQTbuqVu-oLiF2dq-naldlhnV",
    bgColorClass: "bg-[#FF5722]",
    textColorClass: "text-white",
  },
  {
    id: 3,
    discount: "Buy 1 Get 1 Free",
    minOrder: "On selected dishes",
    code: "BOGO",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVWHz_6aH-Yurfk1JruHieDFBTPmqPOj-mfLT_qL_C_9AJ1UZAZ5QqabA2VI4eL2mTX0dzLFs3rURgTL6OxoCepPqdSiy_LJLaCT9IWdDxjTT5F5ou40S-3ru0sv3nsLXczNWZ6fM9o34euRjYXk4lYj8dySzRzEbhpo8Qcym8nK_m3XUVfvCufEI9hfw0n4vTL1U91272GU52_rkmnDGGgbiFuh_4exp_n6Yt1NHXKZLvNqKVhplsf7e5rkbtwtKqYF50IdDb979t",
    bgColorClass: "bg-[#1C201A]",
    textColorClass: "text-white",
  },
];

export default function LandingOffers(): JSX.Element {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="offers" className="py-16 bg-white" data-purpose="offers-section">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 font-display">Offers &amp; Deals</h2>
            <p className="text-gray-500 mt-1">Exclusive deals for you</p>
          </div>
          <a
            href="#offers"
            className="text-[#FF5722] hover:text-orange-600 font-bold text-sm flex items-center gap-1 transition-colors"
          >
            View All Offers
            <Percent className="w-4 h-4" />
          </a>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OFFERS.map((offer) => {
            const isCopied = copiedId === offer.id;
            return (
              <div
                key={offer.id}
                className={`${offer.bgColorClass} ${offer.textColorClass} rounded-2xl p-6 flex justify-between items-center overflow-hidden relative shadow-md`}
              >
                {/* Visual Circle Overlays for Premium Depth */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>

                <div className="relative z-10 flex-1">
                  <h3 className="text-2xl font-black mb-1 leading-tight uppercase font-sans tracking-tight">
                    {offer.discount}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 font-semibold">{offer.minOrder}</p>
                  <button
                    onClick={() => handleCopy(offer.code, offer.id)}
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 rounded-xl backdrop-blur-sm transition-colors text-xs font-mono"
                    title="Click to copy code"
                  >
                    <span>Code: {offer.code}</span>
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-green-300" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-300" />
                    )}
                  </button>
                </div>

                <div className="w-24 h-24 relative shrink-0 z-10 ml-4">
                  <img
                    alt="Promo Image"
                    className="w-full h-full object-cover rounded-full border-4 border-white/10 shadow-lg transform rotate-12 transition-transform duration-300 hover:rotate-0"
                    src={offer.image}
                    loading="lazy"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
