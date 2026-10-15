import { HUDDLE_START } from "./huddle-start";

// Illustrative assumptions, not measured or forecast campaign performance.
const originalRegulars = 5;
const friends = originalRegulars * 4;
const friendsOfFriends = friends * 2;
const visitsPerMonth = 3;
const contributionPerVisit = 10;
const activeCustomerMonths =
  originalRegulars * 12 + friends * 11 + friendsOfFriends * 10;

export const CAMPAIGN_ECONOMICS = {
  dailyFee: Math.round(HUDDLE_START.monthlyFee / 31),
  hourlyFee: HUDDLE_START.monthlyFee / 31 / 24,
  annualFee: HUDDLE_START.monthlyFee * 12,
  originalRegulars,
  friends,
  friendsOfFriends,
  totalRegulars: originalRegulars + friends + friendsOfFriends,
  visitsPerMonth,
  averageOrder: 20,
  contributionPerVisit,
  activeCustomerMonths,
  yearlyVisits: activeCustomerMonths * visitsPerMonth,
  yearlyContribution:
    activeCustomerMonths * visitsPerMonth * contributionPerVisit,
  franchiseContribution: 20000,
  mediaBudget: 100,
  mediaExamples: [
    {
      label: "Local digital ads",
      costPerThousand: 5,
      count: 20000,
      unit: "ad impressions",
      detail: "Assume £5 per 1,000 impressions.",
      width: "100%",
    },
    {
      label: "Leaflets",
      costPerThousand: 100,
      count: 1000,
      unit: "leaflets printed & delivered",
      detail: "Assume 10p per printed and delivered leaflet.",
      width: "5%",
    },
    {
      label: "Billboards",
      costPerThousand: 20,
      count: 5000,
      unit: "estimated ad impressions",
      detail: "Assume £20 per 1,000 estimated impressions.",
      width: "25%",
    },
  ],
} as const;

export const pounds = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
