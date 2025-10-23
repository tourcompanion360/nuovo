// Utility functions for notification system validation and cleanup

/**
 * Validates if a notification is real and meaningful (not test/fake data)
 */
export const isValidNotification = (notification: any): boolean => {
  if (!notification || !notification.data) {
    return false;
  }

  // Check for test/fake keywords
  const testKeywords = ['test', 'fake', 'sample', 'dummy', 'xxxx', 'fdgdg', 'vcxvx'];
  const title = notification.title?.toLowerCase() || '';
  const message = notification.message?.toLowerCase() || '';

  for (const keyword of fakeKeywords) {
    if (title.includes(keyword) || message.includes(keyword)) {
      return false;
    }
  }

  // Check for repeated characters (like "xxxx", "aaaa", etc.)
  const repeatedCharPattern = /^([a-z])\1{2,}$/i;
  if (repeatedCharPattern.test(title) || repeatedCharPattern.test(message)) {
    return false;
  }

  // Check minimum length requirements
  if (title.length < 3 || message.length < 10) {
    return false;
  }

  // Check for valid data structure
  if (!notification.data.requestId && !notification.data.leadId && !notification.data.chatbotRequestId) {
    return false;
  }

  return true;
};

/**
 * Clears all notification data from localStorage
 */
export const clearAllNotificationData = (): void => {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('notifications_')) {
      localStorage.removeItem(key);
    }
  });
};

/**
 * Validates request data before creating notification
 */
export const isValidRequest = (requestData: any): boolean => {
  if (!requestData || !requestData.title || !requestData.description) {
    return false;
  }

  // Check minimum length
  if (requestData.title.length < 3 || requestData.description.length < 10) {
    return false;
  }

  // Check for obvious fake keywords (but allow legitimate "test" usage)
  const fakeKeywords = ['fake', 'sample', 'dummy', 'xxxx', 'aaaa', 'bbbb'];
  const title = requestData.title.toLowerCase();
  const description = requestData.description.toLowerCase();

  for (const keyword of fakeKeywords) {
    if (title.includes(keyword) || description.includes(keyword)) {
      return false;
    }
  }

  // Check for repeated characters
  const repeatedCharPattern = /^([a-z])\1{2,}$/i;
  if (repeatedCharPattern.test(requestData.title) || repeatedCharPattern.test(requestData.description)) {
    return false;
  }

  return true;
};

/**
 * Validates chatbot request data before creating notification
 */
export const isValidChatbotRequest = (requestData: any): boolean => {
  if (!requestData || !requestData.title || !requestData.description) {
    return false;
  }

  // Check minimum length
  if (requestData.title.length < 3 || requestData.description.length < 10) {
    return false;
  }

  // Check for obvious fake keywords (but allow legitimate "test" usage)
  const fakeKeywords = ['fake', 'sample', 'dummy', 'xxxx', 'aaaa', 'bbbb'];
  const title = requestData.title.toLowerCase();
  const description = requestData.description.toLowerCase();

  for (const keyword of fakeKeywords) {
    if (title.includes(keyword) || description.includes(keyword)) {
      return false;
    }
  }

  // Check for repeated characters
  const repeatedCharPattern = /^([a-z])\1{2,}$/i;
  if (repeatedCharPattern.test(requestData.title) || repeatedCharPattern.test(requestData.description)) {
    return false;
  }

  return true;
};

/**
 * Validates lead data before creating notification
 */
export const isValidLead = (leadData: any): boolean => {
  if (!leadData || !leadData.question_asked) {
    return false;
  }

  // Check minimum length
  if (leadData.question_asked.length < 5) {
    return false;
  }

  // Check for obvious fake keywords (but allow legitimate "test" usage)
  const fakeKeywords = ['fake', 'sample', 'dummy', 'xxxx', 'aaaa', 'bbbb'];
  const question = leadData.question_asked.toLowerCase();

  for (const keyword of fakeKeywords) {
    if (question.includes(keyword)) {
      return false;
    }
  }

  // Check for repeated characters
  const repeatedCharPattern = /^([a-z])\1{2,}$/i;
  if (repeatedCharPattern.test(leadData.question_asked)) {
    return false;
  }

  return true;
};


