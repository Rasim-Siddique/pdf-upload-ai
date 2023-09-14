import { Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { Worker } from '@react-pdf-viewer/core';
import { zoomPlugin } from '@react-pdf-viewer/zoom';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { useState } from 'react';

const App = () => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const zoomPluginInstance = zoomPlugin({ defaultPlugin: { handTool: true } }); // Enable hand scrolling by default

  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileError, setPdfFileError] = useState('');
  const [viewPdf, setViewPdf] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const fileType = ['application/pdf'];

  const handlePdfFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile && fileType.includes(selectedFile.type)) {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onloadend = (e) => {
          setPdfFile(e.target.result);
          setPdfFileError('');
        };
      } else {
        setPdfFile(null);
        setPdfFileError('Please select a valid PDF file');
      }
    } else {
      console.log('Select your file');
    }
  };

  const handlePdfFileSubmit = (e) => {
    e.preventDefault();
    if (pdfFile !== null) {
      setViewPdf(pdfFile);
    } else {
      setViewPdf(null);
    }
  };

  return (
    <div className='container'>
      <br />
      <form className='form-group' onSubmit={handlePdfFileSubmit}>
        <input
          type='file'
          className='form-control'
          required
          onChange={handlePdfFileChange}
        />
        {pdfFileError && <div className='error-msg'>{pdfFileError}</div>}
        <br />
        <button type='submit' className='btn btn-success btn-lg'>
          UPLOAD
        </button>
      </form>
      <br />
      <h4>View PDF</h4>
      <div className='pdf-container'>
        {viewPdf && (
          <>
            <Worker
              workerUrl='https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js'
            >
              <Viewer
                fileUrl={viewPdf}
                plugins={[
                  defaultLayoutPluginInstance,
                  
                  zoomPluginInstance,
                  {
                    
                    scale: zoomLevel, // Apply the zoom level to the viewer
                  },
                ]}
                onItemClick={(event) => {
                  if (
                    event.target.nodeName === 'svg' ||
                    event.target.nodeName === 'canvas'
                  ) {
                    // Zoom in when the PDF content is clicked
                    setZoomLevel((prevZoom) => prevZoom + 0.1);
                  }
                }}
              >
                {/* <div className='custom-toolbar'>
                  <div className='custom-toolbar-item'>
                    <ZoomOutButton />
                  </div>
                  <div className='custom-toolbar-item'>
                    <ZoomInButton />
                  </div>
                </div> */}
              </Viewer>
            </Worker>
          </>
        )}
        {!viewPdf && <>No PDF file selected</>}
      </div>
    </div>
  );
};

export default App;
