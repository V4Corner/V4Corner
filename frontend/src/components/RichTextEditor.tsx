import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { Node, mergeAttributes } from '@tiptap/core';
import imageCompression from 'browser-image-compression';
import { useEffect } from 'react';

interface Props {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

// 自定义 Video 扩展
const Video = Node.create({
  name: 'video',

  group: 'block',

  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
      },
      style: {
        default: 'max-width: 100%; height: auto;',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes)];
  },
});

function RichTextEditor({ content, onChange, placeholder = '开始写作...', editable = true }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
      Video,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rich-text-editor',
      },
    },
  });

  // 当 content prop 变化时更新编辑器内容
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  // 上传图片
  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          alert('请先登录');
          return;
        }

        // 显示压缩中提示
        const compressMsg = document.createElement('div');
        compressMsg.textContent = `图片压缩中... (${(file.size / 1024).toFixed(0)}KB)`;
        compressMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #0f172a; color: white; padding: 1rem 1.5rem; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
        document.body.appendChild(compressMsg);

        // 图片压缩配置
        const options = {
          maxSizeMB: 1, // 最大1MB
          maxWidthOrHeight: 1920, // 最大宽/高
          useWebWorker: true,
          initialQuality: 0.8, // 初始质量
        };

        // 压缩图片
        const compressedFile = await imageCompression(file, options);

        compressMsg.textContent = `压缩后: ${(compressedFile.size / 1024).toFixed(0)}KB (节省 ${((1 - compressedFile.size / file.size) * 100).toFixed(0)}%)`;

        setTimeout(() => compressMsg.remove(), 2000);

        // 显示上传中提示
        const uploadMsg = document.createElement('div');
        uploadMsg.textContent = `图片上传中... (${(compressedFile.size / 1024).toFixed(0)}KB)`;
        uploadMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #0f172a; color: white; padding: 1rem 1.5rem; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
        document.body.appendChild(uploadMsg);

        const formData = new FormData();
        formData.append('file', compressedFile, file.name);

        const response = await fetch('http://localhost:8000/api/uploads/image', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        uploadMsg.remove();

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || '上传失败');
        }

        const data = await response.json();
        const imageUrl = `http://localhost:8000${data.url}`;

        // 插入图片到编辑器
        editor.chain().focus().setImage({ src: imageUrl }).run();

        // 显示成功提示
        const successMsg = document.createElement('div');
        successMsg.textContent = `✅ 图片上传成功 (已压缩 ${((1 - compressedFile.size / file.size) * 100).toFixed(0)}%)`;
        successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #22c55e; color: white; padding: 1rem 1.5rem; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
      } catch (error) {
        console.error('上传图片失败:', error);
        alert(error instanceof Error ? error.message : '上传图片失败，请重试');
      }
    };
    input.click();
  };

  // 上传视频
  const handleVideoUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/mp4,video/webm,video/quicktime';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // 预检查文件大小
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB

      if (file.size > maxSize) {
        alert(`视频文件过大 (${(file.size / 1024 / 1024 / 1024).toFixed(1)}GB)，请选择小于 2GB 的视频`);
        return;
      }

      const sizeMB = (file.size / 1024 / 1024).toFixed(1);

      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          alert('请先登录');
          return;
        }

        // 显示上传和压缩中提示
        const uploadMsg = document.createElement('div');
        uploadMsg.innerHTML = `📤 视频上传中... (${sizeMB}MB)<br><small>服务器将自动压缩大于 20MB 的视频</small>`;
        uploadMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #0f172a; color: white; padding: 1rem 1.5rem; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 300px;';
        document.body.appendChild(uploadMsg);

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:8000/api/uploads/video', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || '上传失败');
        }

        const data = await response.json();
        const videoUrl = `http://localhost:8000${data.url}`;

        // 移除上传提示
        uploadMsg.remove();

        // 显示结果提示
        const resultMsg = document.createElement('div');
        if (data.compressed) {
          resultMsg.innerHTML = `✅ 视频上传成功<br><small>${data.message}</small>`;
          resultMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #22c55e; color: white; padding: 1rem 1.5rem; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 300px;';
        } else {
          resultMsg.innerHTML = `✅ 视频上传成功<br><small>${data.message}</small>`;
          resultMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #22c55e; color: white; padding: 1rem 1.5rem; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 300px;';
        }
        document.body.appendChild(resultMsg);
        setTimeout(() => resultMsg.remove(), 5000);

        // 插入视频到编辑器
        editor.commands.insertContent({
          type: 'video',
          attrs: {
            src: videoUrl,
            controls: true,
            style: 'max-width: 100%; height: auto;',
          },
        });
      } catch (error) {
        console.error('上传视频失败:', error);
        alert(error instanceof Error ? error.message : '上传视频失败，请重试');
      }
    };
    input.click();
  };

  // 添加链接
  const handleAddLink = () => {
    const url = prompt('请输入链接地址:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const MenuBar = () => {
    if (!editable) return null;

    return (
      <div className="editor-toolbar">
        {/* 标题 */}
        <select
          value={editor.isActive('heading') ? editor.getAttributes('heading').level : 'p'}
          onChange={(e) => {
            const level = parseInt(e.target.value);
            if (level === 0) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level }).run();
            }
          }}
          className="toolbar-select"
        >
          <option value="0">正文</option>
          <option value="1">标题 1</option>
          <option value="2">标题 2</option>
          <option value="3">标题 3</option>
          <option value="4">标题 4</option>
          <option value="5">标题 5</option>
          <option value="6">标题 6</option>
        </select>

        <div className="toolbar-divider"></div>

        {/* 文本格式 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
          title="粗体"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
          title="斜体"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`toolbar-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
          title="删除线"
        >
          <s>S</s>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`toolbar-btn ${editor.isActive('code') ? 'is-active' : ''}`}
          title="代码"
        >
          {'<>'}
        </button>

        <div className="toolbar-divider"></div>

        {/* 列表 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
          title="无序列表"
        >
          • 列表
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
          title="有序列表"
        >
          1. 列表
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`toolbar-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
          title="引用"
        >
          " 引用
        </button>

        <div className="toolbar-divider"></div>

        {/* 对齐 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
          title="左对齐"
        >
          ⇤
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
          title="居中"
        >
          ⇔
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
          title="右对齐"
        >
          ⇥
        </button>

        <div className="toolbar-divider"></div>

        {/* 媒体 */}
        <button
          type="button"
          onClick={handleImageUpload}
          className="toolbar-btn"
          title="插入图片"
        >
          🖼 图片
        </button>
        <button
          type="button"
          onClick={handleVideoUpload}
          className="toolbar-btn"
          title="插入视频"
        >
          🎬 视频
        </button>
        <button
          type="button"
          onClick={handleAddLink}
          className={`toolbar-btn ${editor.isActive('link') ? 'is-active' : ''}`}
          title="添加链接"
        >
          🔗 链接
        </button>
        {editor.isActive('link') && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="toolbar-btn"
            title="取消链接"
          >
            ❌
          </button>
        )}

        <div className="toolbar-divider"></div>

        {/* 其他 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="toolbar-btn"
          title="分割线"
        >
          ―
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="toolbar-btn"
          title="撤销"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="toolbar-btn"
          title="重做"
        >
          ↷
        </button>
      </div>
    );
  };

  return (
    <div className="rich-text-editor-wrapper">
      <MenuBar />
      <EditorContent editor={editor} />
      <style>{`
        .rich-text-editor-wrapper {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .editor-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          padding: 0.5rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          align-items: center;
        }

        .toolbar-select {
          padding: 0.4rem 0.6rem;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          background: white;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: #cbd5e1;
          margin: 0 0.25rem;
        }

        .toolbar-btn {
          padding: 0.4rem 0.6rem;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .toolbar-btn:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .toolbar-btn.is-active {
          background: #0f172a;
          color: white;
          border-color: #0f172a;
        }

        .toolbar-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .rich-text-editor {
          padding: 1rem;
          min-height: 400px;
          max-height: 600px;
          overflow-y: auto;
          font-size: 1rem;
          line-height: 1.6;
        }

        .rich-text-editor:focus {
          outline: none;
        }

        .rich-text-editor p.is-editor-empty:first-child::before {
          color: #94a3b8;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        /* 编辑器内容样式 */
        .rich-text-editor h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 1rem 0 0.5rem;
          line-height: 1.2;
        }

        .rich-text-editor h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0.875rem 0 0.5rem;
          line-height: 1.3;
        }

        .rich-text-editor h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.75rem 0 0.5rem;
          line-height: 1.4;
        }

        .rich-text-editor h4,
        .rich-text-editor h5,
        .rich-text-editor h6 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0.5rem 0;
        }

        .rich-text-editor p {
          margin: 0.5rem 0;
        }

        .rich-text-editor ul,
        .rich-text-editor ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .rich-text-editor li {
          margin: 0.25rem 0;
        }

        .rich-text-editor blockquote {
          border-left: 4px solid #0f172a;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #475569;
          font-style: italic;
        }

        .rich-text-editor code {
          background: #f1f5f9;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 0.9em;
        }

        .rich-text-editor pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .rich-text-editor pre code {
          background: transparent;
          padding: 0;
          color: inherit;
        }

        .rich-text-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
        }

        .rich-text-editor video {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
        }

        .rich-text-editor a {
          color: #2563eb;
          text-decoration: underline;
        }

        .rich-text-editor hr {
          border: none;
          border-top: 2px solid #e2e8f0;
          margin: 1.5rem 0;
        }

        .rich-text-editor text-align:left {
          text-align: left;
        }

        .rich-text-editor text-align:center {
          text-align: center;
        }

        .rich-text-editor text-align:right {
          text-align: right;
        }
      `}</style>
    </div>
  );
}

export default RichTextEditor;
