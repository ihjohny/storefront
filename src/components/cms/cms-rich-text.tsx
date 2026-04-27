"use client";

import type { SerializedEditorState } from "lexical";
import { RichText } from "@payloadcms/richtext-lexical/react";

type CmsRichTextProps = {
  data: unknown;
  className?: string;
};

/** Renders Payload Lexical JSON from the `pages` collection (same editor as the admin). */
export function CmsRichText({ data, className }: CmsRichTextProps) {
  if (!data || typeof data !== "object") {
    return null;
  }

  return (
    <RichText
      data={data as SerializedEditorState}
      className={className}
    />
  );
}
