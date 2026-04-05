"use client";

import { trackLineAddClick, trackPhoneClick } from "@/lib/analytics";

type LineLinkProps = {
  href: string;
  staffSlug: string;
  className?: string;
  children: React.ReactNode;
};

export function TrackedLineLink({ href, staffSlug, className, children }: LineLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackLineAddClick(staffSlug)}
    >
      {children}
    </a>
  );
}

type PhoneLinkProps = {
  href: string;
  staffSlug: string;
  phone: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

export function TrackedPhoneLink({ href, staffSlug, phone, className, style, children }: PhoneLinkProps) {
  return (
    <a
      href={href}
      className={className}
      style={style}
      onClick={() => trackPhoneClick(staffSlug, phone)}
    >
      {children}
    </a>
  );
}
