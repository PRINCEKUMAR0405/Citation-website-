export interface CitationData {
  type: "article" | "book" | "website" | "conference" | "thesis";
  title: string;
  authors: string | string[];
  year?: string;
  publisher?: string;
  source?: string; // Journal name for articles, or general source
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  accessDate?: string;
}

export interface GeneratedCitation {
  apa: string;
  mla: string;
  chicago: string;
  harvard: string;
}

function formatAuthors(authors: string | string[], format: "apa" | "mla" | "chicago" | "harvard"): string {
  // Convert string to array if needed (split by commas or "and")
  const authorArray = typeof authors === "string"
    ? authors.split(/[,;]|(?:\s+and\s+)/i).map(a => a.trim()).filter(Boolean)
    : authors;

  if (!authorArray || authorArray.length === 0) return "";

  const formatName = (name: string, format: string) => {
    const parts = name.trim().split(" ");
    if (parts.length < 2) return name;

    const lastName = parts[parts.length - 1];
    const firstNames = parts.slice(0, -1).join(" ");

    if (format === "apa" || format === "chicago" || format === "harvard") {
      const initials = firstNames.split(" ").map(n => n[0] + ".").join(" ");
      return `${lastName}, ${initials}`;
    } else if (format === "mla") {
      return authorArray.indexOf(name) === 0
        ? `${lastName}, ${firstNames}`
        : `${firstNames} ${lastName}`;
    }
    return name;
  };

  if (authorArray.length === 1) {
    return formatName(authorArray[0], format);
  } else if (authorArray.length === 2) {
    return `${formatName(authorArray[0], format)} & ${formatName(authorArray[1], format)}`;
  } else if (authorArray.length <= 7 || format === "mla") {
    const formattedAuthors = authorArray.map(a => formatName(a, format));
    return formattedAuthors.slice(0, -1).join(", ") + ", & " + formattedAuthors[formattedAuthors.length - 1];
  } else {
    return `${formatName(authorArray[0], format)} et al.`;
  }
}

function formatAPA(data: CitationData): string {
  let citation = "";

  if (data.authors) {
    citation += formatAuthors(data.authors, "apa");
  }

  if (data.year) {
    citation += ` (${data.year}).`;
  } else {
    citation += " (n.d.).";
  }

  citation += ` ${data.title}.`;

  if (data.type === "book" && data.publisher) {
    citation += ` ${data.publisher}.`;
  } else if (data.type === "article") {
    if (data.source) {
      citation += ` ${data.source}`;
      if (data.volume) citation += `, ${data.volume}`;
      if (data.issue) citation += `(${data.issue})`;
      if (data.pages) citation += `, ${data.pages}`;
      citation += ".";
    }
    if (data.doi) {
      citation += ` https://doi.org/${data.doi}`;
    }
  } else if (data.type === "website" && data.url) {
    citation += ` Retrieved from ${data.url}`;
  }

  return citation;
}

function formatMLA(data: CitationData): string {
  let citation = "";

  if (data.authors) {
    citation += formatAuthors(data.authors, "mla");
    citation += ".";
  }

  if (data.type === "book") {
    citation += ` ${data.title}.`;
    if (data.publisher) citation += ` ${data.publisher},`;
    if (data.year) citation += ` ${data.year}.`;
  } else if (data.type === "article") {
    citation += ` "${data.title}."`;
    if (data.source) {
      citation += ` ${data.source}`;
      if (data.volume) citation += `, vol. ${data.volume}`;
      if (data.issue) citation += `, no. ${data.issue}`;
      if (data.year) citation += `, ${data.year}`;
      if (data.pages) citation += `, pp. ${data.pages}`;
      citation += ".";
    }
  } else if (data.type === "website") {
    citation += ` "${data.title}."`;
    if (data.url) citation += ` ${data.url}.`;
    if (data.accessDate) citation += ` Accessed ${data.accessDate}.`;
  }

  return citation;
}

function formatChicago(data: CitationData): string {
  let citation = "";

  if (data.authors) {
    citation += formatAuthors(data.authors, "chicago");
  }

  if (data.type === "book") {
    citation += ` ${data.title}.`;
    if (data.publisher) {
      citation += ` ${data.publisher}`;
      if (data.year) citation += `, ${data.year}`;
      citation += ".";
    }
  } else if (data.type === "article") {
    citation += ` "${data.title}."`;
    if (data.source) {
      citation += ` ${data.source}`;
      if (data.volume) citation += ` ${data.volume}`;
      if (data.issue) citation += `, no. ${data.issue}`;
      if (data.year) citation += ` (${data.year})`;
      if (data.pages) citation += `: ${data.pages}`;
      citation += ".";
    }
  } else if (data.type === "website") {
    citation += ` "${data.title}."`;
    if (data.url) {
      citation += ` Accessed ${data.accessDate || "date"}.`;
      citation += ` ${data.url}.`;
    }
  }

  return citation;
}

function formatHarvard(data: CitationData): string {
  let citation = "";

  if (data.authors) {
    citation += formatAuthors(data.authors, "harvard");
  }

  if (data.year) {
    citation += ` (${data.year})`;
  } else {
    citation += " (n.d.)";
  }

  citation += ` ${data.title}.`;

  if (data.type === "book" && data.publisher) {
    citation += ` ${data.publisher}.`;
  } else if (data.type === "article") {
    if (data.source) {
      citation += ` ${data.source}`;
      if (data.volume) citation += `, ${data.volume}`;
      if (data.issue) citation += `(${data.issue})`;
      if (data.pages) citation += `, pp. ${data.pages}`;
      citation += ".";
    }
  } else if (data.type === "website" && data.url) {
    citation += ` Available at: ${data.url}`;
    if (data.accessDate) citation += ` (Accessed: ${data.accessDate})`;
    citation += ".";
  }

  return citation;
}

export function generateAllFormats(data: CitationData): GeneratedCitation {
  return {
    apa: formatAPA(data),
    mla: formatMLA(data),
    chicago: formatChicago(data),
    harvard: formatHarvard(data),
  };
}
