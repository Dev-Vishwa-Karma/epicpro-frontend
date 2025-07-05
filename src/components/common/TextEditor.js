import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const TextEditor = ({ name, value, onChange, error }) => {
  return (
    <div className={`ck-editor-wrapper ${error ? 'is-invalid' : ''}`}>
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onReady={(editor) => {
          // Set a fixed height for the editor
          editor.ui.view.editable.element.style.height = '300px';
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
            height: 300px !important;  /* Fix the height */
            overflow: auto; /* Enable scrolling if content exceeds the height */
          }
        `}
      </style>
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
};

export default TextEditor;
