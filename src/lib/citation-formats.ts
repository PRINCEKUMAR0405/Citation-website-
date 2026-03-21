export interface CitationData {
  title: string;
  authors: string;
  year: string;
  source?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publisher?: string;
  type: "article" | "book" | "website" | "conference" | "thesis";
}

function formatAuthorsAPA(authors: string): string {
  return authors
    .split(";")
    .map((a) => {
      const parts = a.trim().split(" ");
      if (parts.length < 2) return a.trim();
      const lastName = parts[parts.length - 1];
      const initials = parts
        .slice(0, -1)
        .map((p) => p[0] + ".")
        .join(" ");
      return `${lastName}, ${initials}`;
    })
    .join(", ");
}

function formatAuthorsMLA(authors: string): string {
  const list = authors.split(";").map((a) => a.trim());
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]}, and ${list[1]}`;
  return `${list[0]}, et al`;
}

function formatAuthorsChicago(authors: string): string {
  return authors
    .split(";")
    .map((a) => a.trim())
    .join(", ");
}

function formatAuthorsHarvard(authors: string): string {
  return authors
    .split(";")
    .map((a) => {
      const parts = a.trim().split(" ");
      if (parts.length < 2) return a.trim();
      const lastName = parts[parts.length - 1];
      const initials = parts
        .slice(0, -1)
        .map((p) => p[0] + ".")
        .join("");
      return `${lastName}, ${initials}`;
    })
    .join(", ");
}

function generateAPA(data: CitationData): string {
  const authors = formatAuthorsAPA(data.authors);
  const year = data.year ? `(${data.year})` : "(n.d.)";
  const title =
    data.type === "book"
      ? `*${data.title}*`
      : data.title;
  let citation = `${authors} ${year}. ${title}.`;

  if (data.type === "article") {
    if (data.source) citation += ` *${data.source}*`;
    if (data.volume) citation += `, *${data.volume}*`;
    if (data.issue) citation += `(${data.issue})`;
    if (data.pages) citation += `, ${data.pages}`;
    citation += ".";
    if (data.doi) citation += ` https://doi.org/${data.doi}`;
  } else if (data.type === "book") {
    if (data.publisher) citation += ` ${data.publisher}.`;
  } else if (data.type === "website") {
    if (data.source) citation += ` ${data.source}.`;
    if (data.url) citation += ` ${data.url}`;
  } else if (data.type === "conference") {
    if (data.source) citation += ` *${data.source}*.`;
    if (data.pages) citation += ` (pp. ${data.pages}).`;
  } else if (data.type === "thesis") {
    citation += ` [Doctoral dissertation`;
    if (data.source) citation += `, ${data.source}`;
    citation += `].`;
  }

  return citation.trim();
}

function generateMLA(data: CitationData): string {
  const authors = formatAuthorsMLA(data.authors);
  const title =
    data.type === "book"
      ? `*${data.title}*`
      : `"${data.title}"`;
  let citation = `${authors}. ${title}.`;

  if (data.type === "article") {
    if (data.source) citation += ` *${data.source}*,`;
    if (data.volume) citation += ` vol. ${data.volume},`;
    if (data.issue) citation += ` no. ${data.issue},`;
    if (data.year) citation += ` ${data.year},`;
    if (data.pages) citation += ` pp. ${data.pages}.`;
    if (data.doi) citation += ` doi:${data.doi}.`;
  } else if (data.type === "book") {
    if (data.publisher) citation += ` ${data.publisher},`;
    if (data.year) citation += ` ${data.year}.`;
  } else if (data.type === "website") {
    if (data.source) citation += ` *${data.source}*,`;
    if (data.year) citation += ` ${data.year},`;
    if (data.url) citation += ` ${data.url}.`;
  }

  return citation.trim();
}

function generateChicago(data: CitationData): string {
  const authors = formatAuthorsChicago(data.authors);
  let citation = `${authors}. "${data.title}."`;

  if (data.type === "article") {
    if (data.source) citation += ` *${data.source}*`;
    if (data.volume) citation += ` ${data.volume}`;
    if (data.issue) citation += `, no. ${data.issue}`;
    if (data.year) citation += ` (${data.year})`;
    if (data.pages) citation += `: ${data.pages}`;
    citation += ".";
    if (data.doi) citation += ` https://doi.org/${data.doi}.`;
  } else if (data.type === "book") {
    if (data.publisher) {
      let pub = ` ${data.publisher}`;
      if (data.year) pub += `, ${data.year}`;
      citation += `${pub}.`;
    }
  } else if (data.type === "website") {
    if (data.source) citation += ` ${data.source}.`;
    if (data.year) citation += ` ${data.year}.`;
    if (data.url) citation += ` ${data.url}.`;
  }

  return citation.trim();
}

function generateHarvard(data: CitationData): string {
  const authors = formatAuthorsHarvard(data.authors);
  const year = data.year ? data.year : "n.d.";
  let citation = `${authors} (${year})`;

  if (data.type === "article") {
    citation += ` '${data.title}',`;
    if (data.source) citation += ` *${data.source}*,`;
    if (data.volume) citation += ` vol. ${data.volume},`;
    if (data.issue) citation += ` no. ${data.issue},`;
    if (data.pages) citation += ` pp. ${data.pages}.`;
    if (data.doi) citation += ` doi: ${data.doi}.`;
  } else if (data.type === "book") {
    citation += ` *${data.title}*.`;
    if (data.publisher) citation += ` ${data.publisher}.`;
  } else if (data.type === "website") {
    citation += ` *${data.title}*.`;
    if (data.source) citation += ` ${data.source}.`;
    if (data.url) citation += ` Available at: ${data.url}.`;
  } else {
    citation += ` *${data.title}*.`;
  }

  return citation.trim();
}

export function generateAllFormats(data: CitationData): Record<string, string> {
  return {
    APA: generateAPA(data),
    MLA: generateMLA(data),
    Chicago: generateChicago(data),
    Harvard: generateHarvard(data),
  };
}
