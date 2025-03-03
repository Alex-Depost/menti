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

// Keeping the existing interfaces for backward compatibility
export interface MentorshipRequest {
  id: number;
  mentor_id: number;
  mentor_name: string;
  mentor_email: string;
  mentor_avatar?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  message?: string;
  specialization?: string;
  rating?: number;
}

export interface IncomingMentorshipRequest {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  message?: string;
  interests?: string[];
  experience_level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface MentorStudent {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  status: 'pending' | 'active' | 'inactive';
  started_at: string;
  last_activity?: string;
  interests?: string[];
  experience_level?: 'beginner' | 'intermediate' | 'advanced';
  // Для отслеживания прогресса студента
  progress?: {
    completed_sessions: number;
    total_sessions: number;
    next_session_date?: string;
  };
  // Информация о запросе, который привел к связи
  request_type: 'incoming' | 'outgoing'; // входящий или исходящий запрос
  request_id: number;
}

export interface MentorDashboardStats {
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  recentActivity: {
    date: string;
    action: string;
    user: string;
  }[];
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

// Adapter functions to convert API response to UI component format

/**
 * Adapter functions to convert API response to UI component format
 */

// Convert API response to MentorshipRequest format for outgoing requests
export function apiToMentorshipRequest(apiResponse: MentorshipRequestResponse): MentorshipRequest {
  return {
    id: apiResponse.id,
    mentor_id: apiResponse.receiver_id,
    mentor_name: `Mentor ${apiResponse.receiver_id}`, // Default name if not provided
    mentor_email: `mentor${apiResponse.receiver_id}@example.com`, // Default email if not provided
    mentor_avatar: undefined,
    status: apiResponse.status,
    created_at: apiResponse.created_at,
    message: apiResponse.message,
    specialization: "General Mentoring", // Default specialization
    rating: 5 // Default rating
  };
}

// Convert API response to IncomingMentorshipRequest format for incoming requests
export function apiToIncomingMentorshipRequest(apiResponse: MentorshipRequestResponse): IncomingMentorshipRequest {
  return {
    id: apiResponse.id,
    user_id: apiResponse.sender_id,
    user_name: `User ${apiResponse.sender_id}`, // Default name if not provided
    user_email: `user${apiResponse.sender_id}@example.com`, // Default email if not provided
    user_avatar: undefined,
    status: apiResponse.status,
    created_at: apiResponse.created_at,
    message: apiResponse.message,
    interests: [], // Default empty array for interests
    experience_level: "beginner" // Default experience level
  };
}

/**
 * Wrapper functions to maintain backward compatibility with UI components
 */

// Get outgoing requests in the format expected by UI components
export async function getOutgoingMentorshipRequestsForUI(): Promise<MentorshipRequest[]> {
  try {
    const apiResponses = await getOutgoingMentorshipRequests();
    
    // Convert API responses to UI format
    return apiResponses.map(apiResponse => {
      return apiToMentorshipRequest(apiResponse);
    });
  } catch (error) {
    console.error('Failed to fetch outgoing mentorship requests for UI:', error);
    return [];
  }
}

// Get incoming requests in the format expected by UI components
export async function getIncomingMentorshipRequestsForUI(): Promise<IncomingMentorshipRequest[]> {
  try {
    const apiResponses = await getIncomingMentorshipRequests();
    
    // Convert API responses to UI format
    return apiResponses.map(apiResponse => {
      return apiToIncomingMentorshipRequest(apiResponse);
    });
  } catch (error) {
    console.error('Failed to fetch incoming mentorship requests for UI:', error);
    return [];
  }
}

/**
 * Получение списка студентов ментора
 * Студенты - это пользователи, чьи запросы на менторство были приняты
 */
export async function getMentorStudents(): Promise<MentorStudent[]> {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    // Получаем входящие запросы
    const incomingRequests = await getIncomingMentorshipRequests();
    
    // Фильтруем только принятые запросы
    const acceptedRequests = incomingRequests.filter(req => req.status === 'accepted');
    
    // Преобразуем запросы в формат MentorStudent
    const students = acceptedRequests.map(req => {
      // Получаем текущую дату для last_activity
      const now = new Date();
      const lastActivity = req.updated_at || req.created_at;
      
      return {
        id: req.id,
        user_id: req.sender_id,
        user_name: `User ${req.sender_id}`, // Используем ID как имя
        user_email: `user${req.sender_id}@example.com`, // Генерируем email
        user_avatar: undefined,
        status: 'active' as 'pending' | 'active' | 'inactive', // Все принятые запросы считаем активными
        started_at: req.created_at,
        last_activity: lastActivity,
        interests: [], // У нас нет данных об интересах
        experience_level: 'beginner' as 'beginner' | 'intermediate' | 'advanced', // По умолчанию начинающий
        progress: {
          completed_sessions: 1, // По умолчанию 1 сессия
          total_sessions: 10,
          next_session_date: new Date(now.setDate(now.getDate() + 7)).toISOString() // Следующая сессия через неделю
        },
        request_type: 'incoming' as 'incoming' | 'outgoing',
        request_id: req.id
      };
    });
    
    return students;
  } catch (error) {
    console.error('Failed to fetch mentor students:', error);
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

/**
 * Приостановка взаимодействия со студентом
 * Примечание: В текущем API нет прямого эндпоинта для приостановки менторства,
 * поэтому это временная реализация
 */
export async function pauseStudentMentorship(studentId: number): Promise<boolean> {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    // Поскольку нет реального API, просто возвращаем успешный результат
    // В реальной реализации здесь будет запрос к API
    console.log(`Pausing mentorship for student ${studentId}`);
    return true;
  } catch (error) {
    console.error('Failed to pause student mentorship:', error);
    return false;
  }
}

/**
 * Завершение менторства студента
 * Примечание: В текущем API нет прямого эндпоинта для завершения менторства,
 * поэтому это временная реализация
 */
export async function endStudentMentorship(studentId: number, reason?: string): Promise<boolean> {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    // Поскольку нет реального API, просто возвращаем успешный результат
    // В реальной реализации здесь будет запрос к API
    console.log(`Ending mentorship for student ${studentId}${reason ? ` with reason: ${reason}` : ''}`);
    return true;
  } catch (error) {
    console.error('Failed to end student mentorship:', error);
    return false;
  }
}

/**
 * Получение статистики для панели управления ментора
 */
export async function getMentorDashboardStats(): Promise<MentorDashboardStats> {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    // Получаем входящие и исходящие запросы
    const [incomingRequests, outgoingRequests] = await Promise.all([
      getIncomingMentorshipRequests(),
      getOutgoingMentorshipRequests()
    ]);

    // Считаем статистику по запросам
    const pendingIncoming = incomingRequests.filter(req => req.status === 'pending').length;
    const acceptedIncoming = incomingRequests.filter(req => req.status === 'accepted').length;
    const rejectedIncoming = incomingRequests.filter(req => req.status === 'rejected').length;
    
    const pendingOutgoing = outgoingRequests.filter(req => req.status === 'pending').length;
    const acceptedOutgoing = outgoingRequests.filter(req => req.status === 'accepted').length;
    const rejectedOutgoing = outgoingRequests.filter(req => req.status === 'rejected').length;

    // Общее количество запросов
    const totalRequests = incomingRequests.length + outgoingRequests.length;
    const pendingRequests = pendingIncoming + pendingOutgoing;
    const acceptedRequests = acceptedIncoming + acceptedOutgoing;
    const rejectedRequests = rejectedIncoming + rejectedOutgoing;

    // Считаем активных студентов (принятые входящие запросы от пользователей)
    const activeStudents = acceptedIncoming;
    
    // Формируем список последних активностей на основе запросов
    const recentActivity = [
      ...incomingRequests.map(req => ({
        date: req.created_at,
        action: `Новый запрос на менторство (${req.status})`,
        user: `User ${req.sender_id}`
      })),
      ...outgoingRequests.map(req => ({
        date: req.created_at,
        action: `Запрос отправлен (${req.status})`,
        user: `Mentor ${req.receiver_id}`
      }))
    ]
    // Сортируем по дате (от новых к старым)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    // Берем только 5 последних активностей
    .slice(0, 5);

    return {
      totalRequests,
      pendingRequests,
      acceptedRequests,
      rejectedRequests,
      totalStudents: activeStudents, // Используем активных студентов как общее количество
      activeStudents,
      inactiveStudents: 0, // У нас нет данных о неактивных студентах
      recentActivity
    };
  } catch (error) {
    console.error('Failed to fetch mentor dashboard stats:', error);
    return {
      totalRequests: 0,
      pendingRequests: 0,
      acceptedRequests: 0,
      rejectedRequests: 0,
      totalStudents: 0,
      activeStudents: 0,
      inactiveStudents: 0,
      recentActivity: []
    };
  }
}

// End of file