import PropTypes from 'prop-types'; // Import PropTypes
import { useCallback } from 'react';

import { useDropzone } from 'react-dropzone';

function PdfUploader({ onUpload }) {
  const onDrop = useCallback((acceptedFiles) => {
    const pdfFile = acceptedFiles[0]; // Only accept the first file
    if (pdfFile) {
      onUpload(pdfFile);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: '.pdf',
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <p>Drag & drop a PDF file here, or click to select one</p>
    </div>
  );
}

// Define the prop type for onUpload
PdfUploader.propTypes = {
  onUpload: PropTypes.func.isRequired, // Specify the prop type and that it is required
};

export default PdfUploader;
