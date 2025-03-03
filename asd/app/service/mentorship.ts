import { API_URL } from "./config";
import { authService } from "./auth";


export interface MentorshipRequestPayload {
  receiver_id: number;
  message: string;
  receiver_type: 'user' | 'mentor';
}


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
    telegram_link?: string;
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
    telegram_link?: string;
  };
}


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

  sender_name?: string;
  sender_email?: string;
  sender_avatar?: string;

  receiver_name?: string;
  receiver_email?: string | null;
  receiver_avatar?: string | null;
  receiver_description?: string;

  sender?: MentorshipRequestResponse['sender'];
  receiver?: MentorshipRequestResponse['receiver'];
}

/**
 * Отправка запроса на менторство
 * @param receiverId ID получателя запроса
 * @param message Сообщение для получателя
 * @param receiverType Тип получателя (user или mentor)
 */

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


      if (errorDetail === 'У вас уже есть активная заявка к этому получателю') {
        throw new MentorshipRequestError(
          errorDetail, // Use the exact error message from the server
          'EXISTING_REQUEST'
        );
      }

      throw new Error(errorDetail);
    }

    return await response.json();
  } catch (error) {
    // If it's already a MentorshipRequestError, rethrow it to preserve the type
    if (error instanceof MentorshipRequestError) {
      throw error;
    }
    // Otherwise, throw a generic error
    throw new Error('Ошибка при отправке запроса на менторство');
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
    throw new Error('Ошибка при получении исходящих запросов');
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
    throw new Error('Ошибка при получении входящих запросов');
  }
}

/**
 * Helper functions to enhance API responses with display information
 */


export async function getOutgoingMentorshipRequestsForUI(): Promise<MentorshipRequestDisplay[]> {
  try {
    const apiResponses = await getOutgoingMentorshipRequests();


    return apiResponses.map(response => ({
      ...response,

      sender_name: response.sender?.name || `Sender ${response.sender_id}`,
      sender_email: response.sender?.email,
      sender_avatar: response.sender?.avatar_url,

      receiver_name: response.receiver?.name || `Receiver ${response.receiver_id}`,
      receiver_email: response.receiver?.email,
      receiver_avatar: response.receiver?.avatar_url,

      receiver_university: undefined,
      receiver_title: response.receiver?.description || null,

      receiver_description: response.receiver?.description,

      sender: response.sender,
      receiver: response.receiver
    }));
  } catch (error) {
    throw new Error('Ошибка при получении исходящих запросов');
  }
}


export async function getIncomingMentorshipRequestsForUI(): Promise<MentorshipRequestDisplay[]> {
  try {
    const apiResponses = await getIncomingMentorshipRequests();


    return apiResponses.map(response => ({
      ...response,

      sender_name: response.sender?.name || `Sender ${response.sender_id}`,
      sender_email: response.sender?.email,
      sender_avatar: response.sender?.avatar_url,

      receiver_name: response.receiver?.name || `Receiver ${response.receiver_id}`,
      receiver_email: response.receiver?.email,
      receiver_avatar: response.receiver?.avatar_url,

      sender: response.sender,
      receiver: response.receiver
    }));
  } catch (error) {
    throw new Error('Ошибка при получении входящих запросов');
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


    const incomingRequests = await getIncomingMentorshipRequests();


    const acceptedRequests = incomingRequests.filter(req => req.status === 'accepted');

    return acceptedRequests;
  } catch (error) {
    throw new Error('Ошибка при получении принятых запросов');
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
    throw new Error('Ошибка при отмене запроса');
  }
}

export interface RequestApproveResponse {
  message: string;
  contact_info: {
    email: string;
    telegram_link?: string;
  };
}

/**
 * Принятие входящего запроса на менторство
 * @returns Объект с сообщением об успешном подтверждении и контактной информацией отправителя
 */
export async function acceptMentorshipRequest(requestId: number): Promise<RequestApproveResponse | false> {
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

    const data: RequestApproveResponse = await response.json();
    return data;
  } catch (error) {
    throw new Error('Ошибка при принятии запроса');
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
    throw new Error('Ошибка при отклонении запроса');
  }
}

