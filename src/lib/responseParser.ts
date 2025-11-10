// Response parser for Bedrock Agent responses
import { ParsedResponse, Ticket, Contact, OrderedElement } from '@/types';

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
      chartData: undefined,
      bigNumberData: undefined
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

  // Extract ALL chart data from the JSON objects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartData: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bigNumberData: any[] = [];
  
  // Map to quickly identify what type each object is
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const objectTypeMap = new Map<any, 'chart' | 'bigNumber' | 'ticket' | 'contact'>();
  
  for (const parsedData of objects) {
    if (parsedData?.chartSpec || parsedData?.chartType) {
      // Detect big number visualizations:
      // 1. New format: chartType === "bigNumber"
      // 2. Old format: chartSpec?.mark?.type === "text"
      // 3. Also check for explicit big number fields (total_closed, avg_hours_business)
      if (
        parsedData.chartType === "bigNumber" ||
        parsedData.chartSpec?.mark?.type === "text" ||
        (parsedData.total_closed !== undefined && !parsedData.data && !parsedData.chartType) ||
        (parsedData.avg_hours_business !== undefined && !parsedData.data && !parsedData.chartType)
      ) {
        bigNumberData.push(parsedData);
        objectTypeMap.set(parsedData, 'bigNumber');
      } else {
        // Regular charts: bar, line, pie, etc.
        // Include both chartSpec (old) and chartType (new) formats
        chartData.push(parsedData);
        objectTypeMap.set(parsedData, 'chart');
      }
    } else if (
      (parsedData.id && parsedData.subject) ||
      (parsedData.hubspot_ticket_id && parsedData.asunto) ||
      (parsedData.tickets && Array.isArray(parsedData.tickets))
    ) {
      objectTypeMap.set(parsedData, 'ticket');
    } else if (
      (parsedData.id && parsedData.name) ||
      (parsedData.hubspot_contact_id && parsedData.nombre) ||
      (parsedData.contacts && Array.isArray(parsedData.contacts))
    ) {
      objectTypeMap.set(parsedData, 'contact');
    }
  }

  // Create ordered elements array preserving original order
  const orderedElements: OrderedElement[] = [];
  
  if (spans.length > 0) {
    // Sort spans and objects by position
    const sortedPairs = spans
      .map((span, index) => ({ span, object: objects[index], index }))
      .sort((a, b) => a.span[0] - b.span[0]);
    
    let cursor = 0;
    for (const { span, object } of sortedPairs) {
      // Add text before this JSON block
      if (cursor < span[0]) {
        const text = responseText.slice(cursor, span[0]).trim();
        if (text) {
          orderedElements.push({ type: 'text', content: text });
        }
      }
      
      // Add the JSON element based on its type
      const elementType = objectTypeMap.get(object);
      if (elementType === 'bigNumber') {
        orderedElements.push({ type: 'bigNumber', data: object });
      } else if (elementType === 'chart') {
        orderedElements.push({ type: 'chart', data: object });
      } else if (elementType === 'ticket') {
        if (object.tickets && Array.isArray(object.tickets)) {
          // Collection of tickets
          object.tickets.forEach((ticket: Ticket) => {
            orderedElements.push({ type: 'ticket', data: ticket });
          });
        } else {
          // Single ticket
          orderedElements.push({ type: 'ticket', data: object });
        }
      } else if (elementType === 'contact') {
        if (object.contacts && Array.isArray(object.contacts)) {
          // Collection of contacts
          object.contacts.forEach((contact: Contact) => {
            orderedElements.push({ type: 'contact', data: contact });
          });
        } else {
          // Single contact
          orderedElements.push({ type: 'contact', data: object });
        }
      }
      
      cursor = span[1];
    }
    
    // Add remaining text after last JSON block
    if (cursor < responseText.length) {
      const text = responseText.slice(cursor).trim();
      if (text) {
        orderedElements.push({ type: 'text', content: text });
      }
    }
  } else {
    // No JSON found, just return the text
    if (responseText.trim()) {
      orderedElements.push({ type: 'text', content: responseText.trim() });
    }
  }

  return {
    conversational,
    tickets: allTickets,
    contacts: allContacts,
    additionalText,
    chartData: chartData.length > 0 ? chartData : undefined,
    bigNumberData: bigNumberData.length > 0 ? bigNumberData : undefined,
    orderedElements: orderedElements.length > 0 ? orderedElements : undefined
  };
};



