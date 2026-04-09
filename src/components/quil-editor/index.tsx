import React, { useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // 引入样式
import './index.css';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  style?: React.CSSProperties;
}

const QuillEditor: React.FC<QuillEditorProps> = ({ 
  value = '', 
  onChange, 
  placeholder = '请输入内容...',
  readOnly = false,
  style = {}
}) => {
  const quillRef = useRef<ReactQuill>(null);

  // 配置工具栏
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }], // 标题
      ['bold', 'italic', 'underline', 'strike'], // 加粗 斜体 下划线 删除线
      [{ 'color': [] }, { 'background': [] }], // 字体颜色、背景色
      [{ 'list': 'ordered'}, { 'list': 'bullet' }], // 有序列表、无序列表
      [{ 'indent': '-1'}, { 'indent': '+1' }], // 缩进
      ['link', 'image'], // 链接、图片
      ['clean'] // 清除格式
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  return (
    <div className="quill-editor-wrapper" style={{ ...style, borderRadius: '4px' }}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{ minHeight: style.height || style.minHeight ? undefined : '600px' }}
      />
    </div>
  );
};

export default QuillEditor;