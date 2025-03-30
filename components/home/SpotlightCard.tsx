"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import avtarImg from "@/public/avtar.png";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";


// TODO: get types from prism for spotlight
interface SpotlightResponse {
  id: string;
  expiresAt: string;
  user: {
    name: string;
    email: string;
    image?: string;
    // other user fields except password
  };
}

export default function SpotlightCard() {
  const { data: spotlight, isLoading } = useQuery<SpotlightResponse>({
    queryKey: ["publicSpotlight"],
    queryFn: async () => {
      const { data } = await axios.get("/api/public/spotlight");
      return data;
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0A0B1C] rounded-[32px] md:px-8 px-4 text-white relative overflow-hidden h-full"
    >
      <div className="">
        <h2 className="text-[32px] font-bold leading-tight my-8">
          Spotlight of
          <br />
          the Day.
        </h2>

        <p className="text-[#B4B4B4] text-[16px] mb-6">
          Meet the inspiring solopreneur leading the way today.
        </p>

        <div className="flex items-center space-x-5 mb-6">
          <div className="relative w-[80px] h-[80px]">
            <Image
              src={avtarImg}
              alt="Profile"
              fill
              className="rounded-full object-cover"
              priority
            />
          </div>
          <div>
            <h3 className="text-[24px] font-bold">
              {isLoading
                ? "Loading..."
                : spotlight?.user?.name || "No Spotlight Available"}
            </h3>
            <p className="text-[#B4B4B4] text-[16px]">Marketing Coordinator</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6  md:mt-[160px]">
          <p className="text-[#636363] text-[16px] leading-relaxed mb-6">
            This creates a sense of recognition and highlights the individual in
            focus, while maintaining the overall theme of growth and
            inspiration. Let&apos;s know if you&apos;d like any changes!
          </p>

          <button className="w-full bg-[#1E2875] text-white py-3 rounded-lg font-medium hover:bg-[#1E2875]/90 transition-colors">
            Let&apos;s Connect
          </button>
        </div>
      </div>
    </motion.div>
  );
}
