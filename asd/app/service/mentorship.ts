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
  // UI display properties (populated from other API calls or context)
  sender_name?: string;
  sender_email?: string;
  sender_avatar?: string;
  receiver_name?: string;
  receiver_email?: string;
  receiver_avatar?: string;
}

/**
 * Отправка запроса на менторство
 * @param receiverId ID получателя запроса
 * @param message Сообщение для получателя
 * @param receiverType Тип получателя (user или mentor)
 */
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
      throw new Error(errorData.detail || 'Failed to send mentorship request');
    }

    return await response.json();
  } catch (error) {
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
    
    // Return the API responses directly, UI can handle display
    return apiResponses.map(response => ({
      ...response,
      // Add placeholder display properties that UI can override
      sender_name: `Sender ${response.sender_id}`,
      receiver_name: `Receiver ${response.receiver_id}`
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
    
    // Return the API responses directly, UI can handle display
    return apiResponses.map(response => ({
      ...response,
      // Add placeholder display properties that UI can override
      sender_name: `Sender ${response.sender_id}`,
      receiver_name: `Receiver ${response.receiver_id}`
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