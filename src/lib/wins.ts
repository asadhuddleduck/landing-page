// Every public win on huddleduck.co.uk/wins. One entry per item.
// Rules (docs/WINS.md): quotes are verbatim, client-reported numbers say so,
// views/impressions/followers/registrations are never sales or attendance,
// no client spend, no dates on client results, OGS and BellaMira never appear.

export type Brand = "Huddle Duck" | "SuperPulse" | "MR. ASAD";

export type WinNumber = {
  figure: string;
  what: string;
  client: string;
  brand: Brand;
  label: string;
};

export const NUMBERS: WinNumber[] = [
  {
    figure: "615,668",
    what: "local impressions, and 25,735 visits to their Instagram profile.",
    client: "Heavenly Desserts",
    brand: "SuperPulse",
    label: "Campaign figures",
  },
  {
    figure: "12,000",
    what: "followers before the first pizza was served.",
    client: "Dough Club",
    brand: "Huddle Duck",
    label: "Client reported. They also reported selling out for weeks.",
  },
  {
    figure: "1 to 5",
    what: "sites, with 4,000+ people at one new-location launch.",
    client: "Shakedown",
    brand: "Huddle Duck",
    label: "Client reported",
  },
  {
    figure: "676",
    what: "franchise enquiries through the pipeline.",
    client: "Chai Green",
    brand: "Huddle Duck",
    label: "Enquiries, not signed franchisees",
  },
  {
    figure: "100K",
    what: "views in two weeks, up from zero.",
    client: "Ten Ten Burgers",
    brand: "SuperPulse",
    label: "Client reported as almost 100K",
  },
  {
    figure: "50,800",
    what: "local impressions and 3,086 profile visits for one event.",
    client: "PHAT Buns",
    brand: "Huddle Duck",
    label: "Campaign figures",
  },
  {
    figure: "250+",
    what: "locations have run SuperPulse local ads.",
    client: "SuperPulse",
    brand: "SuperPulse",
    label: "Locations, not clients",
  },
];

export type WinVideo = {
  title: string;
  quote: string;
  person: string;
  client: string;
  src: string;
  captions: string;
  poster: string;
  duration: string;
};

export const VIDEOS: WinVideo[] = [
  {
    title: "Bobby from Lunar Park on working with us",
    quote: "I know it works.",
    person: "Bobby",
    client: "Lunar Park",
    src: "/wins/lunar-park.mp4",
    captions: "/wins/lunar-park.vtt",
    poster: "/wins/lunar-park-poster.webp",
    duration: "2:22",
  },
  {
    title: "Ibraheem on the PHAT Buns and McCain Deji event",
    quote: "It was just a line down the street.",
    person: "Ibraheem",
    client: "PHAT Buns",
    src: "/wins/phat-buns.mp4",
    captions: "/wins/phat-buns.vtt",
    poster: "/wins/phat-buns-poster.webp",
    duration: "0:50",
  },
];

export type WinFootage = {
  client: string;
  src: string;
  poster: string;
  note: string;
};

// Queue footage cut from the original compilations (Drive, Team Folder/Wins/Proof Wall).
export const FOOTAGE: WinFootage[] = [
  { client: "PHAT Buns", src: "/wins/queue-phat-buns.mp4", poster: "/wins/queue-phat-buns.jpg", note: "Queue footage, filmed on the day" },
  { client: "Shakedown", src: "/wins/queue-shakedown.mp4", poster: "/wins/queue-shakedown.jpg", note: "Queue footage, filmed on the day" },
  { client: "Dough Club", src: "/wins/queue-dough-club.mp4", poster: "/wins/queue-dough-club.jpg", note: "Queue footage, filmed on the day" },
  { client: "Chai Green", src: "/wins/queue-chai-green.mp4", poster: "/wins/queue-chai-green.jpg", note: "Queue footage, filmed on the day" },
];

export type WinMessage = {
  title: string;
  client: string;
  image: string;
  width: number;
  height: number;
  alt: string;
  note?: string;
};

export const MESSAGES: WinMessage[] = [
  {
    title: "Two weeks into SuperPulse",
    client: "Yusuf, Ten Ten Burgers",
    image: "/wins/ten-ten-message.jpg",
    width: 1226,
    height: 736,
    alt: "Original WhatsApp messages. Yusuf says SuperPulse ads are working really well, going from 0 exposure to almost 100K views in two weeks, and recommends the service.",
  },
  {
    title: "Please pull the ad. Then: I want to do more!",
    client: "Sam, Shakedown",
    image: "/wins/pull-the-ad.png",
    width: 1284,
    height: 1802,
    alt: "Original redacted messages. Shakedown asks to pull the ad, then says the campaign killed it and they want to do more.",
  },
  {
    title: "600 tickets today and counting",
    client: "A launch we ran",
    image: "/wins/shakedown-tickets.jpg",
    width: 1320,
    height: 2868,
    alt: "Original text messages reporting 600 opening-day ticket registrations and 3.8k page views on the opening day page.",
    note: "Ticket registrations, not attendance.",
  },
  {
    title: "Eid Mubarak, and thank you",
    client: "Hasnain, Chai Green",
    image: "/wins/chai-green-eid.jpg",
    width: 644,
    height: 1400,
    alt: "Original WhatsApp message from Hasnain at Chai Green thanking Asad for his continued support in helping grow Chai Green.",
  },
  {
    title: "Dough Club on Instagram today",
    client: "Dough Club",
    image: "/wins/dough-club-followers.jpg",
    width: 1552,
    height: 672,
    alt: "Dough Club's Instagram profile showing 21.6K followers.",
    note: "Public Instagram profile.",
  },
  {
    title: "Views while the ads were running",
    client: "A food brand, name hidden",
    image: "/wins/views-while-running.jpg",
    width: 1600,
    height: 891,
    alt: "Facebook content overview chart showing daily views climbing to around 30K while the ads ran, then falling sharply at the end.",
  },
  {
    title: "And after they paused",
    client: "The same brand",
    image: "/wins/views-after-pause.jpg",
    width: 1600,
    height: 448,
    alt: "Views chart showing a drop of 85.2% compared with the previous 28 days after the ads were paused.",
    note: "Views, not sales.",
  },
];

export type WinQuote = {
  quote: string;
  person: string;
  role: string;
  brand: Brand;
};

export const QUOTES: WinQuote[] = [
  {
    quote: "Is 20 an option?",
    person: "Adam",
    role: "Marketing Manager, Burger & Sauce, asked to rate us out of 10",
    brand: "Huddle Duck",
  },
  {
    quote: "Bro. It was mental! Still very busy since opening but that campaign killed it. I want to do more!",
    person: "Sam",
    role: "Shakedown",
    brand: "Huddle Duck",
  },
  {
    quote: "It's official to say this was the biggest launch we have had.",
    person: "Hasnain",
    role: "Chai Green, on the Coventry launch",
    brand: "Huddle Duck",
  },
  {
    quote:
      "I want to personally reach out to you and say thank you for your continued support in helping me grow chai green into what it is and this is just the starting as we look to grow bigger Insh Allah.",
    person: "Hasnain",
    role: "Chai Green",
    brand: "Huddle Duck",
  },
  {
    quote: "We've had a lot of students coming in from that.",
    person: "Bobby",
    role: "Lunar Park",
    brand: "Huddle Duck",
  },
  {
    quote: "It was just a line down the street.",
    person: "Ibraheem",
    role: "PHAT Buns",
    brand: "Huddle Duck",
  },
  {
    quote:
      "Assad I just wanted to let you know that super pulse ads are working really well, 2 weeks ago we had 0 exposure and now Alhamdulliah 2 week in we are almost touching 100K views I would recommend this service to anyone who is looking to get more traffic from locals.. thanks for your great service Assad ❤️",
    person: "Yusuf",
    role: "Ten Ten Burgers",
    brand: "SuperPulse",
  },
];

// Source: Notion "NPS Responses" database, every check-in recorded (23 rows, 9 clients).
export const SCORES = {
  checkIns: 23,
  clients: 9,
  nineOrTen: 14,
  sevenOrEight: 9,
  belowSeven: 0,
  tens: [
    { client: "PHAT Buns", times: 6 },
    { client: "Burger & Sauce", times: 2 },
    { client: "Lunar Park", times: 1 },
    { client: "Henny's Chicken", times: 1 },
    { client: "Fusion Treats", times: 1 },
    { client: "Boo", times: 1 },
  ],
};

export type WinStory = {
  client: string;
  brand: Brand;
  brief: string;
  did: string;
  happened: string;
  label?: string;
};

export const STORIES: WinStory[] = [
  {
    client: "Shakedown",
    brand: "Huddle Duck",
    brief: "Open new sites with a crowd on day one.",
    did: "Pre-launch awareness campaigns ahead of each opening, including Newcastle.",
    happened: "The brand grew from one site to five, with 4,000+ people at one launch. Then they asked us to pull the ad.",
    label: "Client reported",
  },
  {
    client: "Dough Club",
    brand: "Huddle Duck",
    brief: "Build a local audience before the doors open.",
    did: "Pre-opening campaigns aimed at people who live and work nearby.",
    happened: "12,000 followers before the first pizza was served. They reported selling out for weeks afterwards.",
    label: "Client reported",
  },
  {
    client: "Chai Green",
    brand: "Huddle Duck",
    brief: "Find people who want to open a franchise.",
    did: "A franchise campaign and an enquiry flow through forms and DMs.",
    happened: "676 franchise enquiries through the pipeline.",
    label: "Enquiries, not signed franchisees",
  },
  {
    client: "PHAT Buns",
    brand: "Huddle Duck",
    brief: "Pack out the McCain and Deji event.",
    did: "A managed local campaign for the event.",
    happened: "50,800 local impressions and 3,086 profile visits. In Ibraheem's words: \"It was just a line down the street.\" They scored us 10 out of 10 six times.",
  },
  {
    client: "Heavenly Desserts",
    brand: "SuperPulse",
    brief: "Keep every site in front of local people.",
    did: "SuperPulse turned their posts into local Instagram ads around each location.",
    happened: "615,668 local impressions and 25,735 visits to their Instagram profile.",
    label: "Campaign figures",
  },
  {
    client: "Ten Ten Burgers",
    brand: "SuperPulse",
    brief: "Get seen locally, starting from nothing.",
    did: "SuperPulse local ads from the posts they already had.",
    happened: "From 0 exposure to almost 100K views in two weeks. In Yusuf's words: \"I would recommend this service to anyone who is looking to get more traffic from locals.\"",
    label: "Client reported",
  },
  {
    client: "Lunar Park",
    brand: "Huddle Duck",
    brief: "Reach a wider audience beyond organic posts.",
    did: "Paid local campaigns, and a plan for opening more sites sooner.",
    happened: "\"We've had a lot of students coming in from that.\" Bobby scored us 10 out of 10.",
  },
  {
    client: "Boo",
    brand: "Huddle Duck",
    brief: "Came to us on a referral from Shakedown.",
    did: "Campaigns for offers and new launches.",
    happened: "Boo then referred two more businesses who became paying clients.",
  },
  {
    client: "Henny's Chicken",
    brand: "Huddle Duck",
    brief: "More local customers for their sites.",
    did: "Managed local campaigns.",
    happened: "Scored us 10 out of 10 and recommended us to another business.",
  },
];

export type WinReview = {
  name: string;
  text: string;
  source: string;
  stars?: number;
};

// Google reviews of Asad's ads course and calls, July 2024 (Drive archive, original screenshots).
export const GOOGLE_REVIEWS: WinReview[] = [
  {
    name: "Ogundeko Samuel",
    stars: 5,
    source: "Google review, 2024",
    text: "Mr. Asad Shah is truly remarkable; his mind works with precision, and his course provides comprehensive insights into content creation and effective ad utilization. The step-by-step process outlined in the course is so clear that even a beginner can implement it successfully. I'm immensely grateful for this course... I've significantly increased traffic to my business page. Thank you, Asad, for sharing your expertise!",
  },
  {
    name: "Meha Patel",
    stars: 5,
    source: "Google review, 2024",
    text: "The most I've learnt on ads within a hour - a 30 mins call that Asad over ran. If you really want to learn how to create ads what they can do - the pits - Asad does explain it all in detail. Ads don't always give profits but Asad teaches you solutions and ways to over come barriers. If you are a beginner or even experience you will learn something from this call!! I look forward to see what results I get and feedback to Asad next week. 😀",
  },
  {
    name: "Norton Massamba",
    stars: 5,
    source: "Google review, 2024",
    text: "All of Asad's assistance was an amazing experience. An extremely intelligent and beneficial experience. I highly suggest using this him for your marketing.",
  },
  {
    name: "Ahmet Cinalp",
    stars: 5,
    source: "Google review, 2024",
    text: "I have met quite a few people in my search of a good social media ad companies and He definitely knows his craft ve genuin and helpfull . he already give me free advice guidance I look forward to work with Asad .",
  },
  {
    name: "Mikey Small",
    stars: 5,
    source: "Google review, 2024",
    text: "Asad is knowledgeable, highly experienced I can help anyone when it comes to understanding, curating and creating a captivating ad for your audience!",
  },
];

// Instagram messages and course reviews to MR. ASAD, 2021-22 (iCloud, Mr Asad/Testimonials).
// First names only, no handles or photos.
export const EARLY_REVIEWS: WinReview[] = [
  {
    name: "Antonia",
    source: "Instagram message, 2022",
    text: "Thank you so much Asad for helping me grow my account ORGANICALLY, helping me understand the world of ads to best maximise my business and overall for your genuine help! There's not many out there that will help you the way you've helped and LOTS of misinformation. I've tried to grow my account for years on my own and after your advice starting an account from scratch in August 2022 I'm now at 30,000 followers in November 2022 🤯 and have converted some of my audience into paying clients. Thank you so much again 😊",
  },
  {
    name: "Tilika",
    source: "Course review, 2021",
    text: "Just finished the course after a break! But came here straight away just to thank you Asad for bringing such an amazing course. I have always been skeptical of IG courses given I already knew a lot about IG and how it works so it used to be disappointing to get only fluff from other people. I loved how the course has start to finish everything one needs to learn and work on. My biggest biggest concern was Instagram ads and how to nail them to grow followers through quality content and your course helped me do exactly that. I even got a hundred followers and a few DMs after putting out quality content for a month.",
  },
  {
    name: "The Friendship Society",
    source: "Instagram message, 2022",
    text: "I cannot tell you how much your Instagram audit helped me! I wasn't prepared for the information you provided to BE SO impactful. So, I thank you ...immensely!!! I've given you so many honorable mentions in my lives and talked about your helpful advice when it comes to Social media content and Ads! So an enormous thank you - to you!!!",
  },
  {
    name: "Athar",
    source: "Instagram message, 2022",
    text: "Your content and services are amazing - so beneficial I have definitely have been intrigued with every post and love your delivery. Believe to have followed you for over a year and half now. Seen you grow with your content. ... Definitely inspired me to have more faith in creating more content. ... 💯 recommend your content and services.",
  },
  {
    name: "A follower who now works in marketing",
    source: "Instagram message, 2022",
    text: "You've been an inspiration for me. I got inspired by your videos and started my career in social media marketing. ... It all started with YOU.",
  },
  {
    name: "A follower",
    source: "Instagram comment, 2022",
    text: "Just a review. You guys can trust him. Because when I started Instagram i used to watch and listen what he wants to educate. Just because of him i m here now. Thanks alot @mr.asadshah.",
  },
];

export function winCount() {
  return (
    NUMBERS.length +
    VIDEOS.length +
    FOOTAGE.length +
    MESSAGES.length +
    QUOTES.length +
    SCORES.checkIns +
    STORIES.length +
    GOOGLE_REVIEWS.length +
    EARLY_REVIEWS.length
  );
}
