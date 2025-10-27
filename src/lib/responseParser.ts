// Response parser for Bedrock Agent responses
import { ParsedResponse, Ticket, Contact } from '@/types';

// Utility functions
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'N/A';
  const s = String(dateStr).trim();
  if (!s) return 'N/A';
  
  // Normalize ISO with or without time
  if (s.includes('T')) {
    return s.split('T')[0];
  }
  
  try {
    const dt = new Date(s);
    return dt.toISOString().split('T')[0];
  } catch {
    return String(dateStr);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const safeText = (value: any, defaultText: string = 'N/A'): string => {
  if (value === null || value === undefined) return defaultText;
  const s = String(value).trim();
  if (s.toLowerCase() === '' || s.toLowerCase() === 'n/a' || s.toLowerCase() === 'none' || s.toLowerCase() === 'null') {
    return defaultText;
  }
  return s;
};

// Extract JSON blocks from text
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractFencedJsonBlocks = (text: string): { objects: any[]; spans: [number, number][] } => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const objects: any[] = [];
  const spans: [number, number][] = [];

  // 1) ```json ... ```
  const jsonPattern = /```json\s*([\s\S]*?)```/gi;
  let match;
  while ((match = jsonPattern.exec(text)) !== null) {
    const block = match[1].trim();
    try {
      objects.push(JSON.parse(block));
      spans.push([match.index, match.index + match[0].length]);
    } catch {
      // Ignore invalid JSON
    }
  }

  // 2) If no json blocks, try generic ``` ... ```
  if (objects.length === 0) {
    const genericPattern = /```\s*(\{[\s\S]*?\})\s*```/g;
    while ((match = genericPattern.exec(text)) !== null) {
      const block = match[1].trim();
      try {
        objects.push(JSON.parse(block));
        spans.push([match.index, match.index + match[0].length]);
      } catch {
        // Ignore invalid JSON
      }
    }
  }

  return { objects, spans };
};

// Extract balanced JSON objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractBalancedJsonObjects = (text: string): { objects: any[]; spans: [number, number][] } => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const objects: any[] = [];
  const spans: [number, number][] = [];
  let stack = 0;
  let start: number | null = null;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') {
      if (stack === 0) {
        start = i;
      }
      stack++;
    } else if (ch === '}') {
      if (stack > 0) {
        stack--;
        if (stack === 0 && start !== null) {
          const candidate = text.slice(start, i + 1);
          try {
            const obj = JSON.parse(candidate);
            objects.push(obj);
            spans.push([start, i + 1]);
          } catch {
            // Ignore invalid JSON
          }
          start = null;
        }
      }
    }
  }

  return { objects, spans };
};

// Main parser function
export const parseBedrockResponse = (responseText: string): ParsedResponse => {
  if (!responseText || typeof responseText !== 'string') {
    return {
      conversational: '',
      tickets: [],
      contacts: [],
      additionalText: '',
      chartData: null
    };
  }

  // 1) First try fenced blocks
  let { objects, spans } = extractFencedJsonBlocks(responseText);

  // 2) If nothing found, try balanced extraction
  if (objects.length === 0) {
    const result = extractBalancedJsonObjects(responseText);
    objects = result.objects;
    spans = result.spans;
  }

  // 3) Build text without extracted spans and separate into parts
  let conversational = '';
  let additionalText = '';

  if (spans.length > 0) {
    spans = spans.sort((a, b) => a[0] - b[0]);
    let cursor = 0;
    const parts: string[] = [];

    for (const [s, e] of spans) {
      if (cursor < s) {
        parts.push(responseText.slice(cursor, s));
      }
      cursor = e;
    }
    if (cursor < responseText.length) {
      parts.push(responseText.slice(cursor));
    }

    const fullText = parts.join('').trim();

    // If there's extracted JSON, find where the last JSON block ends
    if (spans.length > 0) {
      const lastJsonEnd = Math.max(...spans.map(s => s[1]));
      
      // Extract only conversational text (without JSON)
      const conversationalParts: string[] = [];
      cursor = 0;
      for (const [s, e] of spans) {
        if (cursor < s) {
          conversationalParts.push(responseText.slice(cursor, s));
        }
        cursor = e;
      }
      conversational = conversationalParts.join('').trim();
      
      // Additional text is everything after the last JSON
      additionalText = responseText.slice(lastJsonEnd).trim();
    } else {
      conversational = fullText;
      additionalText = '';
    }
  } else {
    conversational = responseText.trim();
    additionalText = '';
  }

  // 4) Process JSON objects
  const allTickets: Ticket[] = [];
  const allContacts: Contact[] = [];

  for (const parsedData of objects) {
    if (typeof parsedData !== 'object' || parsedData === null) continue;

    // Collections
    if (parsedData.tickets && Array.isArray(parsedData.tickets)) {
      allTickets.push(...parsedData.tickets);
    }

    if (parsedData.contacts && Array.isArray(parsedData.contacts)) {
      allContacts.push(...parsedData.contacts);
    }

    // Individual objects (ticket)
    if (
      (parsedData.id && parsedData.subject) ||
      (parsedData.hubspot_ticket_id && parsedData.asunto)
    ) {
      allTickets.push(parsedData);
    }

    // Individual objects (contact)
    if (
      (parsedData.id && parsedData.name) ||
      (parsedData.hubspot_contact_id && parsedData.nombre)
    ) {
      allContacts.push(parsedData);
    }
  }

  // Check for chart data in the extracted JSON objects
  let chartData = null;
  for (const parsedData of objects) {
    if (parsedData?.chartSpec) {
      chartData = parsedData;
      break;
    }
  }

  return {
    conversational,
    tickets: allTickets,
    contacts: allContacts,
    additionalText,
    chartData
  };
};



