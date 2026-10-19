export const siteConfig = {
  name: "Office of Student Affairs - Scholarships and Financial Assistance Unit",
  shortName: "OSA-SFAU",
  institution: "University of the Philippines Visayas",
  description:
    "Official information on scholarships and financial assistance services from the UP Visayas Office of Student Affairs.",
  contact: {
    email: "sts.visayas@up.edu.ph",
    phone: "513-7019",
    office: "Basement, College Union Building, UP Visayas",
    hours: "Monday–Friday, 8:00 AM–5:00 PM",
  },
};

export const scholarshipCategories = [
  { slug: "up-administered", label: "UP-administered" },
  { slug: "government", label: "Government" },
  { slug: "private", label: "Private" },
] as const;
