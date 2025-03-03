import { getIncomingMentorshipRequests, getOutgoingMentorshipRequests, MentorshipRequestResponse } from "./mentorship";
import { toast } from "sonner";

// Store the last known state of requests
let lastIncomingRequestsMap: Record<number, string> = {}; // Map of request ID to status
let lastOutgoingRequestsMap: Record<number, string> = {}; // Map of request ID to status
let isInitialized = false;

// Interval for checking new messages (in milliseconds)
const CHECK_INTERVAL = 5000; // 5 seconds

// Store the interval ID to clear it when needed
let checkIntervalId: NodeJS.Timeout | null = null;

/**
 * Check for new inbox messages and status changes, and notify if there are any
 */
const checkNewMessages = async (): Promise<void> => {
  try {
    // Fetch both incoming and outgoing requests
    const incomingRequests = await getIncomingMentorshipRequests();
    const outgoingRequests = await getOutgoingMentorshipRequests();

    // Create maps of current requests
    const currentIncomingMap: Record<number, string> = {};
    const currentOutgoingMap: Record<number, string> = {};

    incomingRequests.forEach(req => {
      currentIncomingMap[req.id] = req.status;
    });

    outgoingRequests.forEach(req => {
      currentOutgoingMap[req.id] = req.status;
    });

    // If this is the first check, just store the state without notification
    if (!isInitialized) {
      lastIncomingRequestsMap = currentIncomingMap;
      lastOutgoingRequestsMap = currentOutgoingMap;
      isInitialized = true;
      return;
    }

    // Process incoming requests
    const newIncomingRequests: MentorshipRequestResponse[] = [];

    incomingRequests.forEach(request => {
      const requestId = request.id;
      const currentStatus = request.status;
      const previousStatus = lastIncomingRequestsMap[requestId];

      // New request (not in our previous map)
      if (!previousStatus && currentStatus === 'pending') {
        newIncomingRequests.push(request);
      }
    });

    // Process outgoing requests
    const acceptedRequests: MentorshipRequestResponse[] = [];
    const rejectedRequests: MentorshipRequestResponse[] = [];

    outgoingRequests.forEach(request => {
      const requestId = request.id;
      const currentStatus = request.status;
      const previousStatus = lastOutgoingRequestsMap[requestId];

      // Status changed from pending to accepted
      if (previousStatus === 'pending' && currentStatus === 'accepted') {
        acceptedRequests.push(request);
      }
      // Status changed from pending to rejected
      else if (previousStatus === 'pending' && currentStatus === 'rejected') {
        rejectedRequests.push(request);
      }
    });

    // Count of new pending incoming requests for the badge
    const pendingRequests = incomingRequests.filter(req => req.status === 'pending');
    const pendingCount = pendingRequests.length;

    // Show notifications for new incoming requests
    if (newIncomingRequests.length > 0) {
      newIncomingRequests.forEach(request => {
        const senderName = request.sender?.name || `Отправитель ${request.sender_id}`;
        toast.info(`Новая заявка от ${senderName}`, {
          description: "У вас новая входящая заявка",
          action: {
            label: "Просмотреть",
            onClick: () => {
              // Determine the correct inbox URL based on user type
              const inboxUrl = request.receiver_type === 'user'
                ? '/app/user/inbox'
                : '/app/mentor/inbox';

              // Navigate to inbox
              window.location.href = inboxUrl;
            }
          }
        });
      });
    }

    // Show notifications for accepted outgoing requests
    if (acceptedRequests.length > 0) {
      acceptedRequests.forEach(request => {
        const receiverName = request.receiver?.name || `Получатель ${request.receiver_id}`;
        toast.success(`Заявка принята`, {
          description: `${receiverName} принял(а) вашу заявку`,
          action: {
            label: "Просмотреть",
            onClick: () => {
              // Determine the correct outgoing URL based on user type
              const outgoingUrl = request.sender_type === 'user'
                ? '/app/user/outgoing'
                : '/app/mentor/outgoing';

              // Navigate to outgoing requests
              window.location.href = outgoingUrl;
            }
          }
        });
      });
    }

    // Show notifications for rejected outgoing requests
    if (rejectedRequests.length > 0) {
      rejectedRequests.forEach(request => {
        const receiverName = request.receiver?.name || `Получатель ${request.receiver_id}`;
        toast.error(`Заявка отклонена`, {
          description: `${receiverName} отклонил(а) вашу заявку`,
          action: {
            label: "Просмотреть",
            onClick: () => {
              // Determine the correct outgoing URL based on user type
              const outgoingUrl = request.sender_type === 'user'
                ? '/app/user/outgoing'
                : '/app/mentor/outgoing';

              // Navigate to outgoing requests
              window.location.href = outgoingUrl;
            }
          }
        });
      });
    }

    // Update badge count in UI by dispatching a custom event
    if (pendingCount > 0) {
      window.dispatchEvent(new CustomEvent('new-inbox-messages', {
        detail: { count: pendingCount }
      }));
    }

    // Update the last known state
    lastIncomingRequestsMap = currentIncomingMap;
    lastOutgoingRequestsMap = currentOutgoingMap;

  } catch (error) {
    console.error('Failed to check for new messages:', error);
  }
};

/**
 * Start background checking for new messages
 */
const startBackgroundCheck = (): void => {
  // Clear any existing interval
  if (checkIntervalId) {
    clearInterval(checkIntervalId);
  }

  // Initialize with current state
  checkNewMessages();

  // Set up interval for regular checks
  checkIntervalId = setInterval(checkNewMessages, CHECK_INTERVAL);
};

/**
 * Stop background checking
 */
const stopBackgroundCheck = (): void => {
  if (checkIntervalId) {
    clearInterval(checkIntervalId);
    checkIntervalId = null;
  }
};

/**
 * Reset notification state (e.g., when user views the inbox)
 */
const resetNotificationState = (): void => {
  window.dispatchEvent(new CustomEvent('reset-inbox-notifications'));
};

/**
 * Get the current count of new messages
 */
const getNewMessagesCount = (): number => {
  return Object.values(lastIncomingRequestsMap).filter(status => status === 'pending').length;
};

export const notificationService = {
  startBackgroundCheck,
  stopBackgroundCheck,
  checkNewMessages,
  resetNotificationState,
  getNewMessagesCount
};

export default notificationService;