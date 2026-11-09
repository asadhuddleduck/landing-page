export const plans = {
  clarity: {name:'A clear next step', price:25000, minutes:20, calls:1, description:'One important question. An experienced second opinion. A clear next move.'},
  // 9 Nov 2026: the middle package is the decoy (Asad's decoy-effect lesson): close to the
  // 3-month package in price, far less value, so the 3-month package reads as the best value.
  deep: {name:'1 month of support', price:200000, minutes:60, calls:3, description:'Three 60-minute conversations within 30 days of the first call.'},
  advisory: {name:'Three months of support', price:250000, minutes:60, calls:10, description:'A regular sounding board as you decide, test and adjust. Someone who knows the context.'},
} as const;
export type Plan = keyof typeof plans;
