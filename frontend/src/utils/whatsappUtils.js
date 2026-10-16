import SOCIETY_CONFIG from '../config/societyConfig';

/**
 * Normalizes phone numbers to standard Indian format for WhatsApp (wa.me)
 */
export function formatWhatsAppPhone(phone) {
  if (!phone) return '';
  // Remove spaces, dashes, parentheses
  let cleaned = String(phone).replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  // If 10 digits without country code, prefix with 91
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

/**
 * Generates a pre-filled WhatsApp message for maintenance dues
 */
export function getDuesReminderMessage({ unitNumber, ownerName, month, year, amount, isPartial = false, amountPaid = 0 }) {
  const societyName = SOCIETY_CONFIG.name || 'Parthbhoomi CHS';
  const nameGreeting = ownerName ? `Dear ${ownerName}` : `Dear Resident (Unit ${unitNumber})`;
  
  if (isPartial) {
    const pendingAmount = Math.max(0, amount - amountPaid);
    return `Namaste! ${nameGreeting},

This is a gentle reminder from *${societyName}*.
For *Unit ${unitNumber}*, a partial payment of ₹${amountPaid.toLocaleString('en-IN')} has been received for *${month} ${year}*.
The remaining balance of *₹${pendingAmount.toLocaleString('en-IN')}* is pending.

Kindly arrange to clear the balance at your earliest convenience. Thank you!`;
  }

  return `Namaste! ${nameGreeting},

This is a friendly reminder from *${societyName}*.
The society maintenance dues of *₹${amount.toLocaleString('en-IN')}* for *Unit ${unitNumber}* (${month} ${year}) are currently pending.

Kindly clear the dues at your earliest convenience. If you have already paid, please share the transaction reference. Thank you!`;
}

/**
 * Generates a pre-filled WhatsApp message acknowledging receipt
 */
export function getReceiptReadyMessage({ unitNumber, ownerName, month, year, amount, receiptNumber }) {
  const societyName = SOCIETY_CONFIG.name || 'Parthbhoomi CHS';
  const nameGreeting = ownerName ? `Dear ${ownerName}` : `Dear Resident (Unit ${unitNumber})`;
  
  return `Namaste! ${nameGreeting},

Thank you for your payment of *₹${amount.toLocaleString('en-IN')}* towards *${societyName}* maintenance for *${month} ${year}* (Unit ${unitNumber}).
${receiptNumber ? `Receipt Number: *${receiptNumber}*\n` : ''}Your payment has been successfully recorded in the society ledger.`;
}

/**
 * Opens WhatsApp directly in web or mobile app
 */
export function openWhatsAppReminder({ phone, unitNumber, ownerName, month, year, amount, isPartial = false, amountPaid = 0 }) {
  const formattedPhone = formatWhatsAppPhone(phone);
  const text = getDuesReminderMessage({ unitNumber, ownerName, month, year, amount, isPartial, amountPaid });
  const encodedText = encodeURIComponent(text);
  
  if (formattedPhone) {
    window.open(`https://wa.me/${formattedPhone}?text=${encodedText}`, '_blank');
  } else {
    // Open WhatsApp Web with text if no phone number is recorded
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  }
}
