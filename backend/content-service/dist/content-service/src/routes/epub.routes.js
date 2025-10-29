"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
const epub_controller_1 = require("../controllers/epub.controller");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const epubController = new epub_controller_1.EpubController();
router.post('/upload', auth_1.authMiddleware, epubController.getUploadMiddleware(), epubController.uploadAndExtractKanji);
router.post('/extract', auth_1.authMiddleware, (0, validation_1.validateRequest)(joi_1.default.object({
    filePath: joi_1.default.string().required()
})), epubController.extractKanjiFromFile);
router.get('/kanji/:character', epubController.getKanjiPageData);
router.get('/kanji', epubController.getAllExtractedKanji);
router.get('/search', epubController.searchKanji);
router.get('/stats', epubController.getExtractionStats);
exports.default = router;
//# sourceMappingURL=epub.routes.js.map