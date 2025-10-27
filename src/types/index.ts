// Types for the Customer Service Chat Application

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  session_id?: string;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trace?: any[];
}

export interface AgentInfo {
  agent_id: string;
  agent_alias_id: string;
  region: string;
  arn?: string;
}

export interface ConnectionTest {
  success: boolean;
  message: string;
  error?: string;
  agent_info?: AgentInfo;
}

export interface DatabaseStats {
  success: boolean;
  total_tickets?: number;
  categories?: Array<{
    category: string;
    count: number;
  }>;
  error?: string;
}

export interface Ticket {
  id?: string;
  hubspot_ticket_id?: string;
  subject?: string;
  asunto?: string;
  content?: string;
  descripcion?: string;
  created_at?: string;
  creado?: string;
  closed_at?: string;
  cerrado?: string;
  itinerary_number?: string;
  itinerario?: string;
  source?: string;
  origen?: string;
  category?: string;
  categoria?: string;
  subcategory?: string;
  subcategoria?: string;
  resolution?: string;
  resolucion?: string;
  priority?: string;
  prioridad?: string;
  status?: string;
  estado?: string;
  owner?: string;
  propietario?: string;
  owner_name?: string;
  case_key?: string;
  ticket_url?: string;
}

export interface Contact {
  id?: string;
  hubspot_contact_id?: string;
  name?: string;
  nombre?: string;
  email?: string;
  phone?: string;
  telefono?: string;
  created_at?: string;
  creado?: string;
  owner?: string;
  propietario?: string;
  owner_name?: string;
}

export interface ParsedResponse {
  conversational: string;
  tickets: Ticket[];
  contacts: Contact[];
  additionalText: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartData?: any; // For storing any chart-related JSON data
}



