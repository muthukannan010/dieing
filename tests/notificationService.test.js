const notificationService = require('../services/notificationService');

describe('Notification Service', () => {

  // Spy on console.log to verify mocked email/SMS output
  let consoleSpy;
  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('sendOrderStatusEmail', () => {
    it('should return true when email is provided', async () => {
      const result = await notificationService.sendOrderStatusEmail(
        'John Doe',
        'john@texstyle.com',
        'ORD-2026-X101',
        'Completed'
      );
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Mock Email] To: john@texstyle.com'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Subject: Order Update: ORD-2026-X101 - Completed'));
    });

    it('should return false when email is falsy', async () => {
      const result = await notificationService.sendOrderStatusEmail('John', null, 'ORD-001', 'Pending');
      expect(result).toBe(false);
    });

    it('should include customer name in email body', async () => {
      await notificationService.sendOrderStatusEmail('Sarah Smith', 'sarah@apex.com', 'ORD-X102', 'Dyeing');
      const bodyCall = consoleSpy.mock.calls.find(c => c[0].includes('[Mock Email] Body'));
      expect(bodyCall[0]).toContain('Sarah Smith');
      expect(bodyCall[0]).toContain('ORD-X102');
      expect(bodyCall[0]).toContain('Dyeing');
    });

    it('should include status in subject line', async () => {
      await notificationService.sendOrderStatusEmail('Alice', 'alice@co.com', 'ORD-999', 'Quality Check');
      const subjectCall = consoleSpy.mock.calls.find(c => c[0].includes('Subject:'));
      expect(subjectCall[0]).toContain('Quality Check');
    });
  });

  describe('sendBatchStatusNotification', () => {
    it('should return true and log the batch notification', async () => {
      const result = await notificationService.sendBatchStatusNotification(
        'BATCH-X101',
        'Dyeing',
        'Robert Johnson'
      );
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[System Alert]'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('BATCH-X101'));
    });

    it('should include operator name in notification', async () => {
      await notificationService.sendBatchStatusNotification('BATCH-X200', 'Completed', 'Ali Khan');
      const logCall = consoleSpy.mock.calls.find(c => c[0] && c[0].includes('Ali Khan'));
      expect(logCall).toBeDefined();
    });
  });
});
