// Utility function to completely clear all notification data
// Run this in browser console: copy and paste this entire function

function clearAllNotificationData() {
  console.log('🧹 Clearing all notification data...');
  
  // Clear all localStorage notification data
  let clearedCount = 0;
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('notifications_')) {
      localStorage.removeItem(key);
      clearedCount++;
      console.log(`✅ Cleared: ${key}`);
    }
  });
  
  // Clear any other potential notification storage
  const otherKeys = ['notifications', 'notification_data', 'fake_notifications'];
  otherKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      clearedCount++;
      console.log(`✅ Cleared: ${key}`);
    }
  });
  
  console.log(`🎉 Cleared ${clearedCount} notification entries from localStorage`);
  console.log('🔄 Please refresh the page to see the changes');
  
  return clearedCount;
}

// Auto-run the function
clearAllNotificationData();


