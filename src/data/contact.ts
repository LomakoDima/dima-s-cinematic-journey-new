/*
 * CONTACT — content lives here, nowhere else.
 * ===========================================
 *
 * A row with a string `value` renders as a real link and the cursor picks it
 * up; the big LET'S TALK button activates as soon as `email` is set.
 *
 * TO DEACTIVATE A ROW: set its `value` back to `null`. It then renders as
 * inert muted text reading the placeholder, never a broken link.
 *
 * `label` is what the row shows; `value` is where it points. For `email` you
 * only need the bare address — the mailto: prefix is added for you.
 */

export type ContactLink = {
  key: string;
  label: string;
  /** Displayed when the value is still null. */
  placeholder: string;
  value: string | null;
  /** Prefix applied to `value` when building the href. */
  href: "mailto:" | "";
};

export const EMAIL: string | null = "lomakodima898@gmail.com";

export const CONTACT_LINKS: ContactLink[] = [
  {
    key: "email",
    label: "Email",
    placeholder: "lomakodima898@gmail.com",
    value: EMAIL,
    href: "mailto:",
  },
  {
    key: "github",
    label: "GitHub",
    placeholder: "https://github.com/LomakoDima",
    value: "https://github.com/LomakoDima",
    href: "",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "https://www.linkedin.com/in/dmitriy-lomako-327825363",
    value: "https://www.linkedin.com/in/dmitriy-lomako-327825363",
    href: "",
  },
  {
    key: "telegram",
    label: "Telegram",
    placeholder: "@dymok236",
    value: "https://t.me/dymok236",
    href: "",
  },
];

/** Strips the protocol so links read as clean text: "github.com/name". */
export function displayValue(link: ContactLink) {
  if (!link.value) return link.placeholder;
  return link.value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function hrefFor(link: ContactLink) {
  return link.value ? `${link.href}${link.value}` : null;
}
