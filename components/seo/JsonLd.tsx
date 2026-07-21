/**
 * Renders a <script type="application/ld+json"> block. Server component only
 * — never mark a file that imports this "use client".
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
