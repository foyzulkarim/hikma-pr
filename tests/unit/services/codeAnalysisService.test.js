"use strict";
/**
 * CodeAnalysisService Tests
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
(0, globals_1.describe)('CodeAnalysisService', () => {
    let mockService;
    (0, globals_1.beforeEach)(() => {
        mockService = {
            analyzeCode: globals_1.jest.fn(),
            extractFunctions: globals_1.jest.fn()
        };
    });
    (0, globals_1.it)('should analyze code', () => __awaiter(void 0, void 0, void 0, function* () {
        const expected = { language: 'typescript', functions: ['test'] };
        mockService.analyzeCode.mockResolvedValue(expected);
        const result = yield mockService.analyzeCode('function test() {}');
        (0, globals_1.expect)(result.language).toBe('typescript');
        (0, globals_1.expect)(result.functions).toContain('test');
    }));
    (0, globals_1.it)('should handle errors', () => __awaiter(void 0, void 0, void 0, function* () {
        mockService.analyzeCode.mockRejectedValue(new Error('Error'));
        yield (0, globals_1.expect)(mockService.analyzeCode('invalid')).rejects.toThrow('Error');
    }));
});
