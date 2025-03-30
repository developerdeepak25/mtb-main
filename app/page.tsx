import { Metadata } from "next";
import Hero from "@/components/home/Hero";
import SpotlightCard from "@/components/home/SpotlightCard";
import Layout from "@/components/layout/Layout";

export const metadata: Metadata = {
  title: "MyThriveBuddy - Solopreneurship Made Amazing",
  description:
    "Join the world's only platform / ecosystem that aims to provide growth, joy, sense of belonging.",
  openGraph: {
    title: "MyThriveBuddy - Solopreneurship Made Amazing",
    description:
      "Join the world's only platform / ecosystem that aims to provide growth, joy, sense of belonging.",
    images: ["/images/og-image.jpg"],
  },
};


// TODO: add current active spotlight get it with api
export default function Home() {
  return (
    <Layout>
      {/* 
    <main className="min-h-screen bg-gradient-to-br from-[#4A90E2] via-[#F8F2FF] to-[#FF69B4] py-4 sm:py-6 md:py-8 px-4">
      <div className="max-w-[1280px] mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-[32px] p-2 sm:p-6 md:p-8"> */}
      {/* <Navbar /> */}
      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mt-6 sm:mt-8">
        <div className="flex flex-col justify-between">
          <Hero />
        </div>
        <div className="flex flex-col">
          <SpotlightCard />
        </div>
      </div>
      {/* </div>
        <CategoryTags />
      </div>
    </main> */}
    </Layout>
  );
}
