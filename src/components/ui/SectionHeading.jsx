export function SectionHeading({ kicker, title, titleId }) {
  return (
    <div className="section-heading">
      <p className="section-kicker">{kicker}</p>
      <h2 id={titleId} className="section-title">
        {title}
      </h2>
    </div>
  )
}
