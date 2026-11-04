export const plans = {
  clarity: {name:'A clear next step', price:25000, minutes:20, calls:1, description:'One important question. An experienced second opinion. A clear next move.'},
  deep: {name:'Room to work it through', price:50000, minutes:60, calls:2, description:'Explore the bigger picture. Make a plan. Come back and talk through what happened.'},
  advisory: {name:'Three months of support', price:250000, minutes:60, calls:10, description:'A regular sounding board as you decide, test and adjust. Someone who knows the context.'},
} as const;
export type Plan = keyof typeof plans;
