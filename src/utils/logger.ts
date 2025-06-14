export function sendEmail(notification: any): void {
  console.log(
    `Sending email to user ${notification.userId} about ${notification.title}`
  );
  // In a real implementation, this would send an actual email
}

export function sendSMS(notification: any): void {
  console.log(
    `Sending SMS to user ${notification.userId} about ${notification.title}`
  );
  // In a real implementation, this would send an actual SMS
}

export function sendInAppNotification(notification: any): void {
  console.log(
    `Sending in-app notification to user ${notification.userId} about ${notification.title}`
  );
  // In a real implementation, this would create an in-app notification
}