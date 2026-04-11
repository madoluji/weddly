/// Sample project data for reference and messages

interface CountryOption {
  name: string;
}

export const countries: CountryOption[] = [
  { name: "Nepal" },
  { name: "India" },
  { name: "United States" },
  { name: "United Kingdom" },
  { name: "Canada" },
  { name: "Australia" },
  { name: "Germany" },
  { name: "France" },
  { name: "Japan" },
  { name: "China" },
  { name: "Singapore" },
  { name: "Thailand" },
  { name: "Malaysia" },
  { name: "Indonesia" },
  { name: "Philippines" },
  { name: "Vietnam" },
  { name: "South Korea" },
  { name: "Taiwan" },
  { name: "Hong Kong" },
  { name: "New Zealand" },
];

export const jobCategories = [
  "Reception",
  "Haldi",
  "Mehendi",
  "Sangeet",
  "Pre-Wedding",
  "Wedding Day (Janti & Bibaha)",
  "Engagement",
  "Bridal Shower",
  "Bachelor/Bachelorette",
  "Rehearsal Dinner",
];

export const skills = [
  "Photography",
  "Candid",
  "Videography",
  "Drone",
  "Makeup",
  "Hair Styling",
  "Music",
  "DJ",
  "Live Band",
  "Floral Design",
  "Event Planning",
  "Catering",
  "Decoration",
  "Venue Coordination",
  "Transportation",
  "Lighting Design",
  "Sound Engineering",
  "Choreography",
];

export const languageTags = [
  "English",
  "Nepali",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Mandarin",
  "Japanese",
  "Korean",
  "Vietnamese",
  "Thai",
  "Tagalog",
  "Indonesian",
  "Portuguese",
  "Italian",
];

interface BudgetMilestone {

  milestone: string;
  amount: string;
  status: string;
  date: string;
}

interface Budget {
  total: string;
  paid: string;
  pending: string;
  schedule: BudgetMilestone[];
}

interface TimelinePhase {
  phase: string;
  startDate: string;
  endDate: string;
  status: string;
  description: string;
}

interface ClientInfo {
  name: string;
  position: string;
  email: string;
  phone: string;
}

interface ProjectData {
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  company: string;
  description: string;
  budget: Budget;
  timeline: TimelinePhase[];
  client: ClientInfo;
  requirements: string[];
  deliverables: string[];
  nextSteps: string[];
}

// Sample data structure for reference
export const sampleProjectData: ProjectData = {
  title: "Destination Wedding Planning",
  status: "In Progress",
  startDate: "June 10, 2026",
  endDate: "November 20, 2026",
  company: "EverAfter Weddings Nepal",
  description:
    "Complete wedding planning project covering venue coordination, vendor management, guest logistics, and day-of execution.",
  budget: {
    total: "$9,000",
    paid: "$2,700",
    pending: "$6,300",
    schedule: [
      {
        milestone: "Planning Kickoff",
        amount: "$2,700 (30%)",
        status: "Paid",
        date: "June 10, 2026",
      },
      {
        milestone: "Vendor Finalization",
        amount: "$2,700 (30%)",
        status: "Pending",
        date: "August 15, 2026",
      },
      {
        milestone: "Event Completion",
        amount: "$3,600 (40%)",
        status: "Pending",
        date: "November 20, 2026",
      },
    ],
  },
  timeline: [
    {
      phase: "Consultation & Planning",
      startDate: "June 10, 2026",
      endDate: "June 30, 2026",
      status: "Completed",
      description:
        "Initial consultations, style preference mapping, and budget planning.",
    },
    {
      phase: "Venue & Vendor Booking",
      startDate: "July 1, 2026",
      endDate: "August 20, 2026",
      status: "In Progress",
      description:
        "Finalize venue, photographer, caterer, decorator, makeup, and entertainment.",
    },
    {
      phase: "Design & Logistics",
      startDate: "August 21, 2026",
      endDate: "October 31, 2026",
      status: "Not Started",
      description:
        "Invitation design, seating layout, transportation plans, and guest coordination.",
    },
    {
      phase: "Final Preparation",
      startDate: "November 1, 2026",
      endDate: "November 18, 2026",
      status: "Not Started",
      description:
        "Vendor confirmations, rehearsal planning, and final checklist review.",
    },
    {
      phase: "Wedding Day Execution",
      startDate: "November 19, 2026",
      endDate: "November 20, 2026",
      status: "Not Started",
      description: "On-site event management and complete wedding day coordination.",
    },
  ],
  client: {
    name: "Aarav & Sita",
    position: "Bride & Groom",
    email: "aarav.sita@email.com",
    phone: "+977 9800000000",
  },
  requirements: [
    "Traditional ceremony with modern stage setup",
    "Indoor venue with backup weather plan",
    "Photography and cinematic videography coverage",
    "Vegetarian and non-vegetarian catering options",
    "Guest transportation for out-of-town attendees",
    "End-to-end day-of coordination support",
  ],
  deliverables: [
    "Wedding planning timeline and checklist",
    "Confirmed vendor list with contact details",
    "Decor and stage concept board",
    "Guest logistics and seating plan",
    "Full wedding day coordination",
    "Post-event vendor settlement summary",
  ],
  nextSteps: [
    "Finalize venue booking and deposit",
    "Send vendor RFPs (Request for Proposals)",
    "Schedule engagement photo shoot",
    "Plan invitation design and send-out",
  ],
};
