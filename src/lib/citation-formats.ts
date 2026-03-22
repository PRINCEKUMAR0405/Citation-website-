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
  type: string;
}

export function generateAllFormats(data: CitationData) {
  const authorList = data.authors.split(";").map((a) => a.trim());

  // APA Format
  const apaAuthors = authorList
    .map((author, i) => {
      const parts = author.split(" ");
      const lastName = parts[parts.length - 1];
      const initials = parts
        .slice(0, -1)
        .map((n) => n[0] + ".")
        .join(" ");
      return i === authorList.length - 1 && authorList.length > 1
        ? `& ${initials} ${lastName}`
        : `${initials} ${lastName}`;
    })
    .join(", ");

  let apa = `${apaAuthors} (${data.year}). ${data.title}.`;
  if (data.source) apa += ` ${data.source}`;
  if (data.volume) apa += `, ${data.volume}`;
  if (data.issue) apa += `(${data.issue})`;
  if (data.pages) apa += `, ${data.pages}`;
  if (data.doi) apa += `. https://doi.org/${data.doi}`;

  // MLA Format
  const mlaAuthor = authorList[0];
  const parts = mlaAuthor.split(" ");
  const lastName = parts[parts.length - 1];
  const firstName = parts.slice(0, -1).join(" ");
  let mla = `${lastName}, ${firstName}`;
  if (authorList.length > 1) mla += ", et al";
  mla += `. "${data.title}."`;
  if (data.source) mla += ` ${data.source}`;
  if (data.volume) mla += `, vol. ${data.volume}`;
  if (data.issue) mla += `, no. ${data.issue}`;
  mla += `, ${data.year}`;
  if (data.pages) mla += `, pp. ${data.pages}`;
  mla += ".";

  // Chicago Format
  const chicagoAuthor = authorList[0];
  const chicagoParts = chicagoAuthor.split(" ");
  const chicagoLast = chicagoParts[chicagoParts.length - 1];
  const chicagoFirst = chicagoParts.slice(0, -1).join(" ");
  let chicago = `${chicagoLast}, ${chicagoFirst}`;
  if (authorList.length > 1) chicago += ", et al";
  chicago += `. "${data.title}."`;
  if (data.source) chicago += ` ${data.source}`;
  if (data.volume) chicago += ` ${data.volume}`;
  if (data.issue) chicago += `, no. ${data.issue}`;
  chicago += ` (${data.year})`;
  if (data.pages) chicago += `: ${data.pages}`;
  chicago += ".";

  // Harvard Format
  const harvardAuthors = authorList
    .map((author) => {
      const parts = author.split(" ");
      const lastName = parts[parts.length - 1];
      const initials = parts
        .slice(0, -1)
        .map((n) => n[0] + ".")
        .join("");
      return `${lastName}, ${initials}`;
    })
    .join(", ");

  let harvard = `${harvardAuthors} ${data.year}, '${data.title}'`;
  if (data.source) harvard += `, ${data.source}`;
  if (data.volume) harvard += `, vol. ${data.volume}`;
  if (data.issue) harvard += `, no. ${data.issue}`;
  if (data.pages) harvard += `, pp. ${data.pages}`;
  harvard += ".";

  return { apa, mla, chicago, harvard };
}
