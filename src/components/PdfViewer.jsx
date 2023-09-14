import PropTypes from 'prop-types'; // Import PropTypes
import { Document, Page } from 'react-pdf';

function PdfViewer({ pdfFile }) {
  return (
    <div>
      <Document file={pdfFile}>
        <Page pageNumber={1} /> {/* Display the first page of the PDF */}
      </Document>
    </div>
  );
}

// Define the prop type for pdfFile
PdfViewer.propTypes = {
  pdfFile: PropTypes.any.isRequired, // Assuming pdfFile is a URL or a file path
};

export default PdfViewer;
