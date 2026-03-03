import { XMLParser } from "fast-xml-parser";

export async function makeArxivRequest<T>(url: string): Promise<T | null> {
  const headers = {
    Accept: "applicaton/json"
  }

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlData = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: true,
      removeNSPrefix: true,
      parseTagValue: false,
    });

    const parsedResponse = await parser.parse(xmlData)
    
    return parsedResponse as T;
  } catch (error) {
    console.error("Error making Arxiv request:", error);
    return null;
  }
}

export const formatPapers = (props: ArxivSearchResponse): string[] => {
  const paperData = props.feed.entry;

  const paperDetails = paperData.map((entry) => {
    return [
      `Paper Title: ${entry.title}`,
      `Paper Author(s): ${Array.isArray(entry.author) ? entry.author.map(author => author.name) : entry.author.name}`,
      `Paper Id: ${entry.id}`,
      `Paper Abstract: ${entry.summary}`,
      `Paper Published: ${entry.published}`
    ].join("\n")

  });
  
  return paperDetails;
}

interface Name {
  name: string[] | string
}



interface Entry {
  title: string;
  id: string;
  author: Name;
  summary: string;
  published: string;
}

interface ArxivEntry {
  entry: Entry[];
}

export interface ArxivSearchResponse {
  feed: ArxivEntry;
}
