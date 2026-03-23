import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Angular build 输出目录
const DIST_FOLDER = path.join(__dirname, 'dist/flow-reading-tracker');

// Serve 静态文件
app.use(express.static(DIST_FOLDER));

// 所有前端路由 fallback 到 index.html
app.get(/.*/, (req, res) => {
    console.log(`[FALLBACK] ${req.method} ${req.url}`);
    res.sendFile(path.join(DIST_FOLDER, 'index.html'));
});

// 端口
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Angular SPA server running on port ${PORT}`);
});