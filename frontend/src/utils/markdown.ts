// 简单的 Markdown 转 HTML 工具函数
// TODO: 后续可以替换为 react-markdown 或 marked 库
export function formatMarkdown(content: string): string {
  let html = content;

  // 转义 HTML 标签
  html = html.replace(/&/g, '&amp;');
  html = html.replace(/</g, '&lt;');
  html = html.replace(/>/g, '&gt;');

  // 代码块（先处理，避免被其他规则干扰）
  html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
  html = html.replace(/`(.*?)`/gim, '<code style="background: #f1f5f9; padding: 0.1rem 0.3rem; border-radius: 4px;">$1</code>');

  // 标题
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // 粗体和斜体
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // 图片
  html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 8px; margin: 1rem 0;" />');

  // 无序列表
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');

  // 段落
  const lines = html.split('\n');
  const result: string[] = [];
  let inParagraph = false;

  for (let line of lines) {
    // 跳过 HTML 标签行
    if (line.match(/^<(h|p|l|u|o|pre|code)/)) {
      if (inParagraph) {
        result.push('</p>');
        inParagraph = false;
      }
      result.push(line);
    } else if (line.trim() === '') {
      if (inParagraph) {
        result.push('</p>');
        inParagraph = false;
      }
    } else {
      if (!inParagraph) {
        result.push('<p>');
        inParagraph = true;
      }
      result.push(line + '<br />');
    }
  }

  if (inParagraph) {
    result.push('</p>');
  }

  return result.join('\n');
}
