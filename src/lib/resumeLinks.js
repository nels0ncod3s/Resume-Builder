export function linkLabel(link) {
  return link?.label?.trim() || link?.url?.trim() || "Link";
}

export function linkHref(url) {
  const value = typeof url === "string" ? url.trim() : "";
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export function activeResumeLinks(resume) {
  return (resume?.links || []).filter((link) => link?.url?.trim());
}
