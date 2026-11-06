import { site } from "@/lib/site";

/** Kontaktkarte im Stil der Visitenkarte */
export function ContactPerson() {
  const p = site.sales;
  return (
    <article className="card-person" aria-labelledby="person-name">
      <div className="card-person__shapes" aria-hidden="true">
        <span className="card-person__shape card-person__shape--a" />
        <span className="card-person__shape card-person__shape--b" />
      </div>
      <div className="card-person__body">
        <h3 id="person-name" className="card-person__name">
          {p.name}
        </h3>
        <p className="card-person__role">
          {p.role}
          <br />
          <span lang="en">{p.roleEn}</span>
        </p>
        <ul className="card-person__lines">
          <li>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M6.6 2.8 8.4 6a1 1 0 0 1-.2 1.2L6.8 8.5a10 10 0 0 0 4.7 4.7l1.3-1.4a1 1 0 0 1 1.2-.2l3.2 1.8a1 1 0 0 1 .5 1.1l-.5 2.2a1.6 1.6 0 0 1-1.7 1.2A15.5 15.5 0 0 1 1.1 3.9a1.6 1.6 0 0 1 1.2-1.7l2.2-.5a1 1 0 0 1 1.1.5z" />
            </svg>
            <a href={p.phoneHref}>
              <span className="visually-hidden">Telefon: </span>
              {p.phone}
            </a>
          </li>
          <li>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M2.5 4.5h15v11h-15zM2.8 5l7.2 6 7.2-6" />
            </svg>
            <a href={`mailto:${p.email}`}>
              <span className="visually-hidden">E-Mail: </span>
              {p.email}
            </a>
          </li>
          <li>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 18s6-5.2 6-10a6 6 0 0 0-12 0c0 4.8 6 10 6 10z" />
              <circle cx="10" cy="8" r="2.2" />
            </svg>
            <span>
              {site.address.street}
              <br />
              {site.address.zip} {site.address.city} b. München
            </span>
          </li>
        </ul>
      </div>
    </article>
  );
}
