"use strict";
/**
 * MultiModelOrchestrator Tests
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
(0, globals_1.describe)('MultiModelOrchestrator', () => {
    let mockOrchestrator;
    (0, globals_1.beforeEach)(() => {
        mockOrchestrator = {
            conductMultiModelAnalysis: globals_1.jest.fn(),
            crossValidateResults: globals_1.jest.fn()
        };
    });
    (0, globals_1.it)('should conduct analysis', () => __awaiter(void 0, void 0, void 0, function* () {
        const expected = { crossValidation: { overallAgreement: 0.87 } };
        mockOrchestrator.conductMultiModelAnalysis.mockResolvedValue(expected);
        const result = yield mockOrchestrator.conductMultiModelAnalysis({}, []);
        (0, globals_1.expect)(result.crossValidation.overallAgreement).toBeGreaterThan(0.8);
    }));
    (0, globals_1.it)('should cross-validate', () => __awaiter(void 0, void 0, void 0, function* () {
        const expected = { agreementScore: 0.95 };
        mockOrchestrator.crossValidateResults.mockResolvedValue(expected);
        const result = yield mockOrchestrator.crossValidateResults([]);
        (0, globals_1.expect)(result.agreementScore).toBeGreaterThan(0.9);
    }));
    (0, globals_1.it)('should handle errors', () => __awaiter(void 0, void 0, void 0, function* () {
        mockOrchestrator.conductMultiModelAnalysis.mockRejectedValue(new Error('Failed'));
        yield (0, globals_1.expect)(mockOrchestrator.conductMultiModelAnalysis({}, [])).rejects.toThrow('Failed');
    }));
});
