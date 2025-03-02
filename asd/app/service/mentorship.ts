import { API_URL } from "./config";

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
 * Получение списка исходящих запросов на менторство
 */
export async function getOutgoingMentorshipRequests(): Promise<MentorshipRequest[]> {
  try {
    // В будущем этот код будет заменен реальным API запросом
    // const response = await fetch(`${API_URL}/mentorship/outgoing`, {
    //   headers: {
    //     Authorization: `Bearer ${localStorage.getItem('token')}`,
    //   },
    // });
    // return await response.json();
    
    // Возвращаем моковые данные для прототипа
    return getMockOutgoingRequests();
  } catch (error) {
    console.error('Failed to fetch outgoing mentorship requests:', error);
    return [];
  }
}

/**
 * Получение списка входящих запросов на менторство
 */
export async function getIncomingMentorshipRequests(): Promise<IncomingMentorshipRequest[]> {
  try {
    // В будущем этот код будет заменен реальным API запросом
    // const response = await fetch(`${API_URL}/mentorship/incoming`, {
    //   headers: {
    //     Authorization: `Bearer ${localStorage.getItem('token')}`,
    //   },
    // });
    // return await response.json();
    
    // Возвращаем моковые данные для прототипа
    return getMockIncomingRequests();
  } catch (error) {
    console.error('Failed to fetch incoming mentorship requests:', error);
    return [];
  }
}

/**
 * Получение списка студентов ментора
 */
export async function getMentorStudents(): Promise<MentorStudent[]> {
  try {
    // В будущем этот код будет заменен реальным API запросом
    // const response = await fetch(`${API_URL}/mentor/students`, {
    //   headers: {
    //     Authorization: `Bearer ${localStorage.getItem('token')}`,
    //   },
    // });
    // return await response.json();
    
    // Возвращаем моковые данные для прототипа
    return getMockMentorStudents();
  } catch (error) {
    console.error('Failed to fetch mentor students:', error);
    return [];
  }
}

/**
 * Отмена запроса на менторство
 */
export async function cancelMentorshipRequest(requestId: number): Promise<boolean> {
  try {
    // В будущем этот код будет заменен реальным API запросом
    // const response = await fetch(`${API_URL}/mentorship/${requestId}`, {
    //   method: 'DELETE',
    //   headers: {
    //     Authorization: `Bearer ${localStorage.getItem('token')}`,
    //   },
    // });
    // return response.ok;
    
    // Возвращаем успешный результат для прототипа
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
    // В будущем этот код будет заменен реальным API запросом
    // const response = await fetch(`${API_URL}/mentorship/${requestId}/accept`, {
    //   method: 'POST',
    //   headers: {
    //     Authorization: `Bearer ${localStorage.getItem('token')}`,
    //     'Content-Type': 'application/json',
    //   },
    // });
    // return response.ok;
    
    // Возвращаем успешный результат для прототипа
    return true;
  } catch (error) {
    console.error('Failed to accept mentorship request:', error);
    return false;
  }
}

/**
 * Отклонение входящего запроса на менторство
 */
export async function rejectMentorshipRequest(requestId: number, reason?: string): Promise<boolean> {
  try {
    // В будущем этот код будет заменен реальным API запросом
    // const response = await fetch(`${API_URL}/mentorship/${requestId}/reject`, {
    //   method: 'POST',
    //   headers: {
    //     Authorization: `Bearer ${localStorage.getItem('token')}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ reason }),
    // });
    // return response.ok;
    
    // Возвращаем успешный результат для прототипа
    return true;
  } catch (error) {
    console.error('Failed to reject mentorship request:', error);
    return false;
  }
}

/**
 * Приостановка взаимодействия со студентом
 */
export async function pauseStudentMentorship(studentId: number): Promise<boolean> {
  try {
    // В будущем этот код будет заменен реальным API запросом
    // const response = await fetch(`${API_URL}/mentor/students/${studentId}/pause`, {
    //   method: 'POST',
    //   headers: {
    //     Authorization: `Bearer ${localStorage.getItem('token')}`,
    //   },
    // });
    // return response.ok;
    
    // Возвращаем успешный результат для прототипа
    return true;
  } catch (error) {
    console.error('Failed to pause student mentorship:', error);
    return false;
  }
}

/**
 * Завершение менторства студента
 */
export async function endStudentMentorship(studentId: number, reason?: string): Promise<boolean> {
  try {
    // В будущем этот код будет заменен реальным API запросом
    // const response = await fetch(`${API_URL}/mentor/students/${studentId}/end`, {
    //   method: 'POST',
    //   headers: {
    //     Authorization: `Bearer ${localStorage.getItem('token')}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ reason }),
    // });
    // return response.ok;
    
    // Возвращаем успешный результат для прототипа
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
    // В будущем этот код будет заменен реальным API запросом
    // const response = await fetch(`${API_URL}/mentor/dashboard/stats`, {
    //   headers: {
    //     Authorization: `Bearer ${localStorage.getItem('token')}`,
    //   },
    // });
    // return await response.json();
    
    // Возвращаем моковые данные для прототипа
    return getMockMentorDashboardStats();
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

/**
 * Моковые данные для прототипа исходящих запросов
 */
function getMockOutgoingRequests(): MentorshipRequest[] {
  return [
    {
      id: 1,
      mentor_id: 101,
      mentor_name: "Иван Петров",
      mentor_email: "ivan@example.com",
      mentor_avatar: "https://ui-avatars.com/api/?name=Иван+Петров&background=random",
      status: "pending",
      created_at: "2023-10-15T14:30:00Z",
      specialization: "Разработка веб-приложений",
      rating: 4.8
    },
    {
      id: 2,
      mentor_id: 102,
      mentor_name: "Анна Сидорова",
      mentor_email: "anna@example.com",
      mentor_avatar: "https://ui-avatars.com/api/?name=Анна+Сидорова&background=random",
      status: "accepted",
      created_at: "2023-10-10T09:15:00Z",
      specialization: "UI/UX дизайн",
      rating: 4.5
    },
    {
      id: 3,
      mentor_id: 103,
      mentor_name: "Алексей Иванов",
      mentor_email: "alex@example.com",
      mentor_avatar: "https://ui-avatars.com/api/?name=Алексей+Иванов&background=random",
      status: "rejected",
      created_at: "2023-09-28T11:20:00Z",
      message: "К сожалению, сейчас не могу взять новых менти из-за большой загрузки",
      specialization: "Мобильная разработка",
      rating: 4.9
    },
    {
      id: 4,
      mentor_id: 104,
      mentor_name: "Екатерина Смирнова",
      mentor_email: "kate@example.com",
      mentor_avatar: "https://ui-avatars.com/api/?name=Екатерина+Смирнова&background=random",
      status: "pending",
      created_at: "2023-10-18T16:45:00Z",
      specialization: "Анализ данных",
      rating: 4.7
    },
    {
      id: 5,
      mentor_id: 105,
      mentor_name: "Дмитрий Соколов",
      mentor_email: "dmitry@example.com",
      mentor_avatar: "https://ui-avatars.com/api/?name=Дмитрий+Соколов&background=random",
      status: "pending",
      created_at: "2023-10-20T10:30:00Z",
      specialization: "DevOps",
      rating: 4.6
    }
  ];
}

/**
 * Моковые данные для прототипа входящих запросов
 */
function getMockIncomingRequests(): IncomingMentorshipRequest[] {
  return [
    {
      id: 101,
      user_id: 201,
      user_name: "Михаил Козлов",
      user_email: "mikhail@example.com",
      user_avatar: "https://ui-avatars.com/api/?name=Михаил+Козлов&background=random",
      status: "pending",
      created_at: "2023-10-19T13:45:00Z",
      message: "Здравствуйте! Я заинтересован в изучении React и хотел бы стать вашим менти. У меня есть базовые знания HTML, CSS и JavaScript.",
      interests: ["React", "Frontend", "JavaScript"],
      experience_level: "beginner"
    },
    {
      id: 102,
      user_id: 202,
      user_name: "Ольга Новикова",
      user_email: "olga@example.com",
      user_avatar: "https://ui-avatars.com/api/?name=Ольга+Новикова&background=random",
      status: "pending",
      created_at: "2023-10-17T10:20:00Z",
      message: "Добрый день! Я хотела бы улучшить навыки в Python и машинном обучении. Ищу наставника, который поможет с реальными проектами.",
      interests: ["Python", "Machine Learning", "Data Science"],
      experience_level: "intermediate"
    },
    {
      id: 103,
      user_id: 203,
      user_name: "Сергей Волков",
      user_email: "sergey@example.com",
      user_avatar: "https://ui-avatars.com/api/?name=Сергей+Волков&background=random",
      status: "accepted",
      created_at: "2023-10-05T09:30:00Z",
      interests: ["Java", "Spring", "Backend"],
      experience_level: "intermediate"
    },
    {
      id: 104,
      user_id: 204,
      user_name: "Мария Кузнецова",
      user_email: "maria@example.com",
      user_avatar: "https://ui-avatars.com/api/?name=Мария+Кузнецова&background=random",
      status: "rejected",
      created_at: "2023-09-25T15:15:00Z",
      message: "Ищу наставника по UX дизайну.",
      interests: ["UI/UX", "Figma", "Design"],
      experience_level: "beginner"
    },
    {
      id: 105,
      user_id: 205,
      user_name: "Андрей Соколов",
      user_email: "andrey@example.com",
      user_avatar: "https://ui-avatars.com/api/?name=Андрей+Соколов&background=random",
      status: "pending",
      created_at: "2023-10-22T11:00:00Z",
      message: "Хочу освоить DevOps практики и Docker. Буду благодарен за наставничество в этой области.",
      interests: ["DevOps", "Docker", "CI/CD"],
      experience_level: "advanced"
    }
  ];
}

/**
 * Моковые данные для прототипа студентов ментора
 */
function getMockMentorStudents(): MentorStudent[] {
  return [
    {
      id: 1,
      user_id: 201,
      user_name: "Михаил Козлов",
      user_email: "mikhail@example.com",
      user_avatar: "https://ui-avatars.com/api/?name=Михаил+Козлов&background=random",
      status: "active",
      started_at: "2023-10-25T14:30:00Z",
      last_activity: "2023-11-10T09:15:00Z",
      interests: ["React", "Frontend", "JavaScript"],
      experience_level: "beginner",
      progress: {
        completed_sessions: 3,
        total_sessions: 12,
        next_session_date: "2023-11-15T15:00:00Z"
      },
      request_type: "incoming",
      request_id: 101
    },
    {
      id: 2,
      user_id: 202,
      user_name: "Ольга Новикова",
      user_email: "olga@example.com",
      user_avatar: "https://ui-avatars.com/api/?name=Ольга+Новикова&background=random",
      status: "active",
      started_at: "2023-10-20T10:30:00Z",
      last_activity: "2023-11-08T16:45:00Z",
      interests: ["Python", "Machine Learning", "Data Science"],
      experience_level: "intermediate",
      progress: {
        completed_sessions: 4,
        total_sessions: 10,
        next_session_date: "2023-11-12T11:00:00Z"
      },
      request_type: "incoming",
      request_id: 102
    },
    {
      id: 3,
      user_id: 203,
      user_name: "Сергей Волков",
      user_email: "sergey@example.com",
      user_avatar: "https://ui-avatars.com/api/?name=Сергей+Волков&background=random",
      status: "inactive",
      started_at: "2023-09-10T13:00:00Z",
      last_activity: "2023-10-05T14:30:00Z",
      interests: ["Java", "Spring", "Backend"],
      experience_level: "intermediate",
      progress: {
        completed_sessions: 6,
        total_sessions: 8,
        next_session_date: undefined
      },
      request_type: "outgoing",
      request_id: 205
    },
    {
      id: 4,
      user_id: 204,
      user_name: "Мария Кузнецова",
      user_email: "maria@example.com",
      user_avatar: "https://ui-avatars.com/api/?name=Мария+Кузнецова&background=random",
      status: "pending",
      started_at: "2023-11-01T09:00:00Z",
      interests: ["UI/UX", "Figma", "Design"],
      experience_level: "beginner",
      request_type: "outgoing",
      request_id: 207
    },
    {
      id: 5,
      user_id: 205,
      user_name: "Андрей Соколов",
      user_email: "andrey@example.com",
      user_avatar: "https://ui-avatars.com/api/?name=Андрей+Соколов&background=random",
      status: "active",
      started_at: "2023-10-28T15:45:00Z",
      last_activity: "2023-11-09T17:30:00Z",
      interests: ["DevOps", "Docker", "CI/CD"],
      experience_level: "advanced",
      progress: {
        completed_sessions: 2,
        total_sessions: 8,
        next_session_date: "2023-11-16T14:00:00Z"
      },
      request_type: "incoming",
      request_id: 105
    }
  ];
}

/**
 * Моковые данные для статистики панели управления ментора
 */
function getMockMentorDashboardStats(): MentorDashboardStats {
  return {
    totalRequests: 15,
    pendingRequests: 3,
    acceptedRequests: 10,
    rejectedRequests: 2,
    totalStudents: 8,
    activeStudents: 6,
    inactiveStudents: 2,
    recentActivity: [
      {
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 часа назад
        action: "Новый запрос на менторство",
        user: "Андрей Козлов"
      },
      {
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 часов назад
        action: "Запрос принят",
        user: "Мария Иванова"
      },
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 день назад
        action: "Сессия завершена",
        user: "Алексей Смирнов"
      },
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 дня назад
        action: "Запрос отклонен",
        user: "Екатерина Петрова"
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 дня назад
        action: "Менторство приостановлено",
        user: "Дмитрий Васильев"
      }
    ]
  };
} 