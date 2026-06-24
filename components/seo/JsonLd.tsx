// Tiny server-rendered <script type="application/ld+json"> wrapper.
// Used by every page that wants to ship structured data to Google.
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Schema.org JSON-LD is serialised inline; React's auto-escaping would
      // break the JSON so we use dangerouslySetInnerHTML deliberately.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
