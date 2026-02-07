export interface ReadingItem {
  id: string;                // 唯一 ID
  title: string;             // 文章标题
  assetPath?: string;        // 可选：assets 文件路径，旧版兼容
  content?: string;          // 可选：文章文本内容，本地上传或已加载
  wordTableId?: string;      // 可选：对应词表 ID
}
