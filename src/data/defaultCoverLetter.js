function today() {
  return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export const createDefaultCoverLetter = () => ({
  senderName: "Your Name",
  senderTagline: "Your Job Title",
  senderEmail: "youremail@example.com",
  senderPhone: "+000 000 0000",
  senderLocation: "City, Country",
  date: today(),
  recipientName: "Hiring Manager",
  companyName: "Company Name",
  salutation: "Dear Hiring Manager,",
  body:
    "Opening paragraph — say which role you're applying for and where you saw it, plus one sentence on why you're a strong fit.\n\nMiddle paragraph(s) — back that up with a specific achievement or two, ideally with a number attached.\n\nClosing paragraph — restate your interest and invite them to reach out for a conversation.",
  closing: "Sincerely,",
});
