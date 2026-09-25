/**
 * Notification Service
 * Handles sending emails and SMS messages.
 * Note: This is currently a mock implementation. 
 * Replace console.logs with actual integrations (e.g., Nodemailer, Twilio) when API keys are available.
 */

const sendEmail = async (to, subject, body) => {
  console.log(`[Mock Email] To: ${to}`);
  console.log(`[Mock Email] Subject: ${subject}`);
  console.log(`[Mock Email] Body:\n${body}`);
  return true;
};

const sendSMS = async (phone, message) => {
  console.log(`[Mock SMS] To: ${phone}`);
  console.log(`[Mock SMS] Message: ${message}`);
  return true;
};

exports.sendOrderStatusEmail = async (customerName, userEmail, orderNo, status) => {
  const subject = `Order Update: ${orderNo} - ${status}`;
  const body = `Hello ${customerName},\n\nYour order (${orderNo}) is now marked as: ${status}.\n\nThank you for using DyeTech Pro!`;
  
  if (userEmail) {
    return await sendEmail(userEmail, subject, body);
  }
  return false;
};

exports.sendBatchStatusNotification = async (batchNo, status, operatorName) => {
  const subject = `Production Batch Alert: ${batchNo}`;
  const body = `Batch ${batchNo} has been updated to status: ${status} by operator ${operatorName}.`;
  
  // In a real scenario, this might go to an admin email or a factory manager SMS
  console.log(`[System Alert] ${subject} - ${body}`);
  return true;
};
