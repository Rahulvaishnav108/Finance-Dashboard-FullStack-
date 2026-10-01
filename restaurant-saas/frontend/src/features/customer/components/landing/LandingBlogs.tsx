import React from "react";
import { Calendar, Clock, ArrowRight } from "lucide-react";

export interface BlogPost {
  id: number;
  category: string;
  title: string;
  date: string;
  readTime: string;
  image: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    category: "Restaurant Tips",
    title: "5 Tips to Improve Your Restaurant Customer Experience",
    date: "May 12, 2025",
    readTime: "5 min read",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcXmInFASBYi8E9Fzug-QxzyIcRojCluhV3l8mXmDA1p1t9Rr22Cd6J-HHJVjvHr_UkUGVC187DCnzQ8DptR7jtXWsApRVC-lSGdXTIFUm2LHbh2sh5Gpmbfx_r53X2q06QTT34r01oT_SEdkeWf4FFzjZoqGwAs1_MKe2UPomlupzWeZaCsCZtL8dUan_MXCWXqnYB5f5Y59y15aYjo0wD0UHCoMyazumvcw9Ctl5GQLalJx5hEFZL-2iACpi4O1uPAJn0BX02j2b",
  },
  {
    id: 2,
    category: "Food Trends",
    title: "Top Restaurant Trends to Watch in 2025",
    date: "May 10, 2025",
    readTime: "6 min read",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5AKex2IRrmbBlUkKvrHqwVFdkoYut8SSQh4nh2hmsx2VIcMWKoFsNn8IBYKQC44j6bJowLYWsbtZxRft2rAr9igxpjBi5rbxShgSWNhNt8r9BdoCXdD_0r7RrE36kXJPYcB5bILlUiPyYENNZrXn22mpaI-FXvukf0zmyogNtH9e2DGElgJU1EYdk6oXpNnn9Oe1pu_zSK4qx-hNkn5QC51t35UIokFzqui4d82125f4RavAuZxEtjkRpH4Pv5NfQcO6pxD9GUYBZ",
  },
  {
    id: 3,
    category: "Food & Culture",
    title: "Exploring the Rise of Local Cuisines",
    date: "May 5, 2025",
    readTime: "4 min read",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnWIdXerKKjCYur31Wyh0YEZNm5tKhNb9zjGpO8WuCaBFwjMai8ueNtELdmXtYhbXt7WwisPmfG6MRtEYK6iaND1ZEx6I70RJ-vg8vwTUedBwTdYlEZZyfa0eVkqxmKaRHpw4lZlv_sZh6ROqWNPQy0RXshPsv66Lqc76ZKHEcpHkhpLOP_3A3LOBtNntwRiLcQnGOqWUpnaikyXxtyw1Dt1l8qC0fCN6XeYO4XHiKAtGvCbd2UaVRycYXLhm9zy-oRzDrSHi6d6tz",
  },
];

export default function LandingBlogs(): JSX.Element {
  return (
    <section id="blog" className="py-16 bg-gray-50/70" data-purpose="blog-section">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 font-display">Latest from our Blog</h2>
            <p className="text-gray-500 mt-1">Industry insights, culture stories, and restaurant tips</p>
          </div>
          <a
            href="#blog"
            className="text-[#FF5722] hover:text-orange-600 font-bold text-sm flex items-center gap-1 transition-colors"
          >
            View All Blogs
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <div key={post.id} className="group cursor-pointer flex flex-col h-full bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="relative overflow-hidden h-60 bg-gray-100">
                <img
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={post.image}
                  loading="lazy"
                />
                <span className="absolute top-4 left-4 bg-[#FF5722] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-sm">
                  {post.category}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-1 justify-between">
                <h3 className="font-bold text-gray-800 text-lg mb-3 leading-snug group-hover:text-[#FF5722] transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <div className="flex items-center text-gray-400 text-xs gap-4 pt-3 border-t border-gray-50 font-semibold mt-auto">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.date}
                  </span>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
