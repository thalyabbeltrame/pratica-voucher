import { faker } from '@faker-js/faker';
import { jest } from '@jest/globals';

import voucherRepository from '../src/repositories/voucherRepository';
import voucherService from '../src/services/voucherService';

describe('voucherService', () => {
  describe('createVoucher', () => {
    it('should create voucher', async () => {
      jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementationOnce((code): any => null);
      const voucher = {
        code: faker.random.alphaNumeric(20),
        discount: 70,
      };

      const result = await voucherService.createVoucher(voucher.code, voucher.discount);

      expect(result).toBeUndefined();
    });

    it('should return conflict error if voucher already exists', async () => {
      const voucher = {
        code: faker.random.alphaNumeric(20),
        discount: 70,
      };
      jest
        .spyOn(voucherRepository, 'getVoucherByCode')
        .mockImplementationOnce((code): any => voucher);

      try {
        await voucherService.createVoucher(voucher.code, voucher.discount);
        fail();
      } catch (e) {
        expect(e.type).toBe('conflict');
      }
    });
  });

  describe('apply', () => {
    it('should return conflict error if voucher does not exist', async () => {
      jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementationOnce((code): any => null);

      try {
        await voucherService.applyVoucher('1212', 65);
        fail();
      } catch (err) {
        expect(err.type).toBe('conflict');
      }
    });

    it('should return voucher data with applied true if amount is greater than 100', async () => {
      jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementationOnce((code): any => ({
        code: faker.random.alphaNumeric(20),
        discount: 70,
        used: false,
      }));
      jest.spyOn(voucherRepository, 'useVoucher').mockImplementationOnce((code): any => {});

      const result = await voucherService.applyVoucher(faker.random.alphaNumeric(20), 100);

      expect(result).toEqual({
        amount: 100,
        discount: 70,
        finalAmount: 30,
        applied: true,
      });
    });
  });
});
