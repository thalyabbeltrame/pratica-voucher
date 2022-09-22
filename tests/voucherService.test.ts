import { faker } from '@faker-js/faker';
import { jest } from '@jest/globals';

import voucherRepository from '../src/repositories/voucherRepository';
import voucherService from '../src/services/voucherService';

describe('voucherService', () => {
  const voucher = {
    code: faker.random.alphaNumeric(20),
    discount: 70,
    used: false,
  };

  describe('createVoucher', () => {
    it('should create a voucher', async () => {
      jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementationOnce(() => null);
      const result = await voucherService.createVoucher(voucher.code, voucher.discount);

      expect(result).toBeUndefined();
      expect(voucherRepository.getVoucherByCode).toBeCalled();
    });

    it('should return conflict error if voucher already exists', async () => {
      jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementationOnce((): any => voucher);

      try {
        await voucherService.createVoucher(voucher.code, voucher.discount);
        fail();
      } catch (e) {
        expect(e.type).toBe('conflict');
        expect(e.message).toBe('Voucher already exist.');
      }
    });
  });

  describe('apply', () => {
    it('should return conflict error if voucher does not exist', async () => {
      jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementationOnce(() => null);

      try {
        await voucherService.applyVoucher('1212', 65);
        fail();
      } catch (err) {
        expect(err.type).toBe('conflict');
        expect(err.message).toBe('Voucher does not exist.');
      }
    });

    it('shouldnt apply discount if amount is less than 100', async () => {
      const amount = 50;

      jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementationOnce((): any => voucher);
      const result = await voucherService.applyVoucher(voucher.code, amount);

      expect(result).toEqual({
        amount,
        discount: voucher.discount,
        finalAmount: amount,
        applied: false,
      });
      expect(voucherRepository.getVoucherByCode).toBeCalled();
    });

    it('should return voucher data with applied true if amount is greater than 100', async () => {
      const amount = 110;

      jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementationOnce((): any => voucher);
      jest.spyOn(voucherRepository, 'useVoucher').mockImplementationOnce((): any => {});
      const result = await voucherService.applyVoucher(voucher.code, amount);

      expect(result).toEqual({
        amount,
        discount: voucher.discount,
        finalAmount: amount - amount * (voucher.discount / 100),
        applied: true,
      });
      expect(voucherRepository.getVoucherByCode).toBeCalled();
      expect(voucherRepository.useVoucher).toBeCalled();
    });

    it('should return voucher data with applied false if voucher is already used', async () => {
      const amount = 110;

      jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementationOnce((): any => ({
        ...voucher,
        used: true,
      }));
      const result = await voucherService.applyVoucher(voucher.code, amount);

      expect(result).toEqual({
        amount,
        discount: voucher.discount,
        finalAmount: amount,
        applied: false,
      });
      expect(voucherRepository.getVoucherByCode).toBeCalled();
    });
  });
});
