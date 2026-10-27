import type { Metadata } from "next";
import AgencyEnquiry from "./AgencyEnquiry";
import "@/components/huddle/coin.css";

export const metadata: Metadata = {
  title: "Grow your food brand | Huddle Duck",
  description: "Tell us about your food brand and the locations you have open. See whether Huddle Duck can help with your local marketing.",
  alternates: { canonical: "https://huddleduck.co.uk/workwithus-waitlist" },
};
export default function Page() { return <AgencyEnquiry />; }
