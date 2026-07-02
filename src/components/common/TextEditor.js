import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const TextEditor = ({ name, value, onChange, error, height, minHeight = '50px', maxHeight = '300px' }) => {
  // Use height as minHeight if minHeight is not explicitly provided, default to 50px
  const actualMinHeight = height || minHeight;

  return (
    <div className={`ck-editor-wrapper ${error ? 'is-invalid' : ''}`}>
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onReady={(editor) => {
          // Set min and max height for the editor
          editor.ui.view.editable.element.style.minHeight = actualMinHeight;
          editor.ui.view.editable.element.style.maxHeight = maxHeight;
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
        config={{
          toolbar: [
            'bold', 'italic', '|',
            'bulletedList', 'numberedList', '|',
          ],
        }}
      />
      <style>
        {`
          .ck-editor__editable {
            min-height: ${actualMinHeight} !important;
            max-height: ${maxHeight} !important;  
            overflow: auto; /* Enable scrolling if content exceeds the height */
          }
          .ck-editor__editable p {
            margin-bottom: 0 !important;
            margin-top: 0 !important;
          }
        `}
      </style>
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
};

export default TextEditor;
