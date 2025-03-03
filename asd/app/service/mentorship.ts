import { API_URL } from "./config";
import { authService } from "./auth";

// API Request model based on the documentation
export interface MentorshipRequestPayload {
  receiver_id: number;
  message: string;
  receiver_type: 'user' | 'mentor';
}

// API Response model based on the documentation
export interface MentorshipRequestResponse {
  id: number;
  sender_id: number;
  sender_type: 'user' | 'mentor';
  receiver_id: number;
  receiver_type: 'user' | 'mentor';
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  sender?: {
    id: number;
    login: string;
    name: string;
    description: string;
    target_universities?: string[];
    admission_type?: string;
    email: string;
    avatar_url?: string;
  };
  receiver?: {
    id: number;
    login: string;
    name: string;
    description: string;
    target_universities?: string[];
    admission_type?: string | null;
    email: string | null;
    avatar_url?: string | null;
  };
}

// Interface for displaying mentorship requests in the UI
export interface MentorshipRequestDisplay {
  id: number;
  sender_id: number;
  sender_type: 'user' | 'mentor';
  receiver_id: number;
  receiver_type: 'user' | 'mentor';
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  // Sender properties (populated directly from API response)
  sender_name?: string;  // From sender.name
  sender_email?: string; // From sender.email
  sender_avatar?: string; // From sender.avatar_url
  // Receiver properties (now populated directly from API response)
  receiver_name?: string; // From receiver.name
  receiver_email?: string | null; // From receiver.email
  receiver_avatar?: string | null; // From receiver.avatar_url
  receiver_university?: string; // For backward compatibility
  receiver_title?: string | null; // For backward compatibility
  receiver_description?: string; // From receiver.description
  // Original objects from API (for advanced usage if needed)
  sender?: MentorshipRequestResponse['sender'];
  receiver?: MentorshipRequestResponse['receiver'];
}

/**
 * Отправка запроса на менторство
 * @param receiverId ID получателя запроса
 * @param message Сообщение для получателя
 * @param receiverType Тип получателя (user или mentor)
 */
// Custom error type for mentorship request errors
export class MentorshipRequestError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'MentorshipRequestError';
  }
}

export async function sendMentorshipRequest(
  receiverId: number,
  message: string,
  receiverType: 'user' | 'mentor' = 'user'
): Promise<MentorshipRequestResponse | null> {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    const payload: MentorshipRequestPayload = {
      receiver_id: receiverId,
      message,
      receiver_type: receiverType
    };

    const response = await fetch(`${API_URL}/requests/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorDetail = errorData.detail || 'Failed to send mentorship request';
      
      // Check for the specific error about existing active request
      if (errorDetail === 'У вас уже есть активная заявка к этому получателю') {
        throw new MentorshipRequestError(
          'У вас уже есть активная заявка к этому получателю',
          'EXISTING_REQUEST'
        );
      }
      
      throw new Error(errorDetail);
    }

    return await response.json();
  } catch (error) {
    // Re-throw MentorshipRequestError so it can be handled by the components
    if (error instanceof MentorshipRequestError) {
      throw error;
    }
    
    console.error('Failed to send mentorship request:', error);
    return null;
  }
}

/**
 * Получение списка отправленных запросов на менторство
 */
export async function getOutgoingMentorshipRequests(): Promise<MentorshipRequestResponse[]> {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_URL}/requests/sent`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sent mentorship requests');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch outgoing mentorship requests:', error);
    return [];
  }
}

/**
 * Получение списка входящих запросов на менторство
 */
export async function getIncomingMentorshipRequests(): Promise<MentorshipRequestResponse[]> {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_URL}/requests/got`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch received mentorship requests');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch incoming mentorship requests:', error);
    return [];
  }
}

/**
 * Helper functions to enhance API responses with display information
 */

// Get outgoing requests with enhanced display information
export async function getOutgoingMentorshipRequestsForUI(): Promise<MentorshipRequestDisplay[]> {
  try {
    const apiResponses = await getOutgoingMentorshipRequests();
    
    // Map API responses to display format
    return apiResponses.map(response => ({
      ...response,
      // Use sender information from the API response if available
      sender_name: response.sender?.name || `Sender ${response.sender_id}`,
      sender_email: response.sender?.email,
      sender_avatar: response.sender?.avatar_url,
      // Use receiver information from the API response if available
      receiver_name: response.receiver?.name || `Receiver ${response.receiver_id}`,
      receiver_email: response.receiver?.email,
      receiver_avatar: response.receiver?.avatar_url,
      // For backward compatibility, set these to null/undefined
      receiver_university: undefined,
      receiver_title: response.receiver?.description || null,
      // Add the description from the receiver
      receiver_description: response.receiver?.description,
      // Pass the original objects for advanced usage if needed
      sender: response.sender,
      receiver: response.receiver
    }));
  } catch (error) {
    console.error('Failed to fetch outgoing mentorship requests for UI:', error);
    return [];
  }
}

// Get incoming requests with enhanced display information
export async function getIncomingMentorshipRequestsForUI(): Promise<MentorshipRequestDisplay[]> {
  try {
    const apiResponses = await getIncomingMentorshipRequests();
    
    // Map API responses to display format, using sender information from the API
        return apiResponses.map(response => ({
          ...response,
          // Use sender information from the API response if available
          sender_name: response.sender?.name || `Sender ${response.sender_id}`,
          sender_email: response.sender?.email,
          sender_avatar: response.sender?.avatar_url,
          // Still use placeholder for receiver as it's not included in the API response
          receiver_name: `Receiver ${response.receiver_id}`,
          // Pass the original sender object for advanced usage if needed
          sender: response.sender
        }));
  } catch (error) {
    console.error('Failed to fetch incoming mentorship requests for UI:', error);
    return [];
  }
}

/**
 * Получение списка принятых запросов (активных менторских отношений)
 */
export async function getAcceptedRequests(): Promise<MentorshipRequestResponse[]> {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    // Получаем входящие запросы
    const incomingRequests = await getIncomingMentorshipRequests();
    
    // Фильтруем только принятые запросы
    const acceptedRequests = incomingRequests.filter(req => req.status === 'accepted');
    
    return acceptedRequests;
  } catch (error) {
    console.error('Failed to fetch accepted requests:', error);
    return [];
  }
}

/**
 * Отмена запроса на менторство
 * Примечание: В текущем API нет прямого эндпоинта для отмены запроса,
 * поэтому используем reject как эквивалент отмены для отправителя
 */
export async function cancelMentorshipRequest(requestId: number): Promise<boolean> {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_URL}/requests/reject/${requestId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to cancel mentorship request');
    }

    return true;
  } catch (error) {
    console.error('Failed to cancel mentorship request:', error);
    return false;
  }
}

/**
 * Принятие входящего запроса на менторство
 */
export async function acceptMentorshipRequest(requestId: number): Promise<boolean> {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_URL}/requests/approve/${requestId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to approve mentorship request');
    }

    return true;
  } catch (error) {
    console.error('Failed to accept mentorship request:', error);
    return false;
  }
}

/**
 * Отклонение входящего запроса на менторство
 */
export async function rejectMentorshipRequest(requestId: number): Promise<boolean> {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_URL}/requests/reject/${requestId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to reject mentorship request');
    }

    return true;
  } catch (error) {
    console.error('Failed to reject mentorship request:', error);
    return false;
  }
}

// End of file