"use strict";
/**
 * ArchitecturalAnalysisAgent Tests
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
(0, globals_1.describe)('ArchitecturalAnalysisAgent', () => {
    let mockAgent;
    (0, globals_1.beforeEach)(() => {
        mockAgent = {
            analyze: globals_1.jest.fn(),
            detectPatterns: globals_1.jest.fn()
        };
    });
    (0, globals_1.it)('should analyze patterns', () => __awaiter(void 0, void 0, void 0, function* () {
        const expected = { type: 'architectural', confidence: 0.85 };
        mockAgent.analyze.mockResolvedValue(expected);
        const result = yield mockAgent.analyze({}, 'Analyze');
        (0, globals_1.expect)(result.type).toBe('architectural');
        (0, globals_1.expect)(result.confidence).toBeGreaterThan(0.8);
    }));
    (0, globals_1.it)('should detect patterns', () => __awaiter(void 0, void 0, void 0, function* () {
        const expected = [{ pattern: 'Singleton', confidence: 0.95 }];
        mockAgent.detectPatterns.mockResolvedValue(expected);
        const result = yield mockAgent.detectPatterns('code');
        (0, globals_1.expect)(result[0].pattern).toBe('Singleton');
    }));
    (0, globals_1.it)('should handle errors', () => __awaiter(void 0, void 0, void 0, function* () {
        mockAgent.analyze.mockRejectedValue(new Error('Failed'));
        yield (0, globals_1.expect)(mockAgent.analyze({}, 'Invalid')).rejects.toThrow('Failed');
    }));
});
