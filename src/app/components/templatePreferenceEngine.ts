import type { UserPreferences } from "./userPreferences";

export function applyPreferencesToTemplateHtml(baseHtml: string, prefs: UserPreferences | null): string {
  if (!prefs) return baseHtml;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = baseHtml;

  wrapper.style.lineHeight = String(prefs.preferred_formatting.lineHeight || 2);

  const paragraphSpacing = prefs.preferred_formatting.paragraphSpacing ?? 8;
  wrapper.querySelectorAll("p").forEach((p) => {
    (p as HTMLElement).style.marginBottom = `${paragraphSpacing}px`;
  });

  if (prefs.structural_patterns.heading_style === "uppercase") {
    wrapper.querySelectorAll("h1,h2,h3").forEach((h) => {
      h.textContent = (h.textContent || "").toUpperCase();
    });
  }

  if (prefs.tone_style === "concise") {
    replacePhrasing(wrapper, [[/\bin order to\b/gi, "to"], [/\bwith a view to\b/gi, "to"]]);
  }

  if (prefs.tone_style === "verbose") {
    replacePhrasing(wrapper, [[/\bto\b/gi, "in order to"]]);
  }

  if (prefs.common_phrasing_patterns.length > 0) {
    const preferredLeadIn = prefs.common_phrasing_patterns[0];
    const firstParagraph = wrapper.querySelector("p");
    if (firstParagraph && firstParagraph.textContent && !firstParagraph.textContent.toLowerCase().includes(preferredLeadIn)) {
      firstParagraph.textContent = `${capitalize(preferredLeadIn)}, ${firstParagraph.textContent}`;
    }
  }

  return wrapper.innerHTML;
}

function replacePhrasing(root: HTMLElement, replacements: [RegExp, string][]) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    nodes.push(node as Text);
    node = walker.nextNode();
  }

  for (const textNode of nodes) {
    let value = textNode.nodeValue || "";
    for (const [regex, replacement] of replacements) {
      value = value.replace(regex, replacement);
    }
    textNode.nodeValue = value;
  }
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
