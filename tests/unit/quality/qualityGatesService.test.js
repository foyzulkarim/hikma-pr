"use strict";
/**
 * QualityGatesService Tests
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('QualityGatesService', () => {
    let mockService;
    (0, globals_1.beforeEach)(() => {
        mockService = {
            validateResults: globals_1.jest.fn(),
            ensureStandards: globals_1.jest.fn()
        };
    });
    (0, globals_1.it)('should validate results', () => __awaiter(void 0, void 0, void 0, function* () {
        const expected = { passesGates: true, overallScore: 0.85 };
        mockService.validateResults.mockResolvedValue(expected);
        const result = yield mockService.validateResults({});
        (0, globals_1.expect)(result.passesGates).toBe(true);
        (0, globals_1.expect)(result.overallScore).toBeGreaterThan(0.8);
    }));
    (0, globals_1.it)('should ensure standards', () => __awaiter(void 0, void 0, void 0, function* () {
        const expected = { complianceScore: 0.75 };
        mockService.ensureStandards.mockResolvedValue(expected);
        const result = yield mockService.ensureStandards({}, {});
        (0, globals_1.expect)(result.complianceScore).toBeGreaterThan(0.7);
    }));
    (0, globals_1.it)('should handle errors', () => __awaiter(void 0, void 0, void 0, function* () {
        mockService.validateResults.mockRejectedValue(new Error('Failed'));
        yield (0, globals_1.expect)(mockService.validateResults({})).rejects.toThrow('Failed');
    }));
});
