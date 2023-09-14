
import '@react-pdf-viewer/core/lib/styles/index.css';
import { useState } from 'react';

const App = () => {
  const [pdfPage, setPdfPage] = useState(null);
  const [pdfFileError, setPdfFileError] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 });
  const [isHandScrollingDisabled, setIsHandScrollingDisabled] = useState(false);
  const [croppedArea, setCroppedArea] = useState(null); // Store the cropped area coordinates

  console.log(isHandScrollingDisabled);
  const fileType = ['application/pdf'];

  const handlePdfFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile && fileType.includes(selectedFile.type)) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        reader.onloadend = async () => {
          const pdfData = new Uint8Array(reader.result);

          // Import pdfjs library
          const pdfjs = await import('pdfjs-dist');

          // Initialize PDF.js with the worker url
          pdfjs.GlobalWorkerOptions.workerSrc =
            'https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js';

          // Create a PDF document from the loaded data
          const pdfDocument = await pdfjs
            .getDocument({ data: pdfData })
            .promise;

          // Get the first page and convert it to an image
          const page = await pdfDocument.getPage(1);
          const viewport = page.getViewport({ scale: zoomLevel });

          // Increase canvas resolution for better quality
          const resolution = 2; // Adjust this value as needed
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width * resolution;
          canvas.height = viewport.height * resolution;
          context.scale(resolution, resolution);

          // Render the PDF page to the canvas
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          await page.render(renderContext).promise;

          // Convert the canvas to a data URL (image)
          const imageDataUrl = canvas.toDataURL('image/png');

          setPdfPage(imageDataUrl);
          setPdfFileError('');
        };
      } else {
        setPdfPage(null);
        setPdfFileError('Please select a valid PDF file');
      }
    } else {
      console.log('Select your file');
    }
  };

  const handleImageMouseDown = (e) => {
    if (!isCropping) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      setCropStart({ x: e.clientX, y: e.clientY });
      setCropEnd({ x: e.clientX, y: e.clientY });
    }
  };

  const handleImageMouseMove = (e) => {
    if (isDragging && !isCropping) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setDragOffset({ x: deltaX, y: deltaY });
    } else if (isCropping) {
      setCropEnd({ x: e.clientX, y: e.clientY });
    }
  };

  const handleImageMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart({ x: 0, y: 0 });
    } else if (isCropping) {
      setIsCropping(false);
      setCropEnd({ x: 0, y: 0 });
      setIsHandScrollingDisabled(false); // Re-enable hand scrolling
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => prevZoom + 0.1);
  };

  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => (prevZoom > 0.2 ? prevZoom - 0.1 : prevZoom));
  };

  const handleCropClick = () => {
    setIsCropping(true);
    setIsHandScrollingDisabled(true); // Disable hand scrolling during cropping
  };

  const handleCropApply = () => {
    const startX = Math.min(cropStart.x, cropEnd.x);
    const startY = Math.min(cropStart.y, cropEnd.y);
    const width = Math.abs(cropEnd.x - cropStart.x);
    const height = Math.abs(cropEnd.y - cropStart.y);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    const image = new Image();
    image.src = pdfPage;
    image.onload = () => {
      context.drawImage(
        image,
        startX - dragOffset.x,
        startY - dragOffset.y,
        width,
        height,
        0,
        0,
        width,
        height
      );

      const croppedImageDataUrl = canvas.toDataURL('image/png');
      console.log(croppedImageDataUrl)
      setIsCropping(false);
      setIsHandScrollingDisabled(false); // Re-enable hand scrolling
      // Store the cropped area coordinates
      setCroppedArea({
        startX: startX - dragOffset.x,
        startY: startY - dragOffset.y,
        endX: startX - dragOffset.x + width,
        endY: startY - dragOffset.y + height,
      });
    };
  };

  return (
    <div className='container'>
      <br />
      <form className='form-group'>
        <input
          type='file'
          className='form-control'
          required
          onChange={handlePdfFileChange}
        />
        {pdfFileError && <div className='error-msg'>{pdfFileError}</div>}
        <br />
      </form>
      <br />
      <h4>View PDF as an Image</h4>
      <button
        onClick={handleZoomIn}
        style={{
          background: 'lightblue',
          border: '2px solid lightblue',
          padding: 7,
          marginLeft: 10,
          marginBottom: 10,
          borderRadius: 6,
        }}
      >
        Zoom In
      </button>
      <button
        onClick={handleZoomOut}
        style={{
          background: 'lightblue',
          border: '2px solid lightblue',
          padding: 7,
          marginLeft: 10,
          marginBottom: 10,
          borderRadius: 6,
        }}
      >
        Zoom Out
      </button>
      <button
        onClick={handleCropClick}
        style={{
          background: 'lightgreen',
          border: '2px solid lightgreen',
          padding: 7,
          marginLeft: 10,
          marginBottom: 10,
          borderRadius: 6,
        }}
      >
        Crop
      </button>
      {isCropping && (
        <button
          onClick={handleCropApply}
          style={{
            background: 'lightcoral',
            border: '2px solid lightcoral',
            padding: 7,
            marginLeft: 10,
            marginBottom: 10,
            borderRadius: 6,
          }}
        >
          Process
        </button>
      )}

      {/* <button
        style={{
          background: 'lightgreen',
          border: '2px solid lightgreen',
          padding: 7,
          marginLeft: 10,
          marginBottom: 10,
          borderRadius: 6,
        }}
      >
        Process
      </button> */}
      <div
        className='pdf-container'
        onMouseDown={handleImageMouseDown}
        onMouseMove={handleImageMouseMove}
        onMouseUp={handleImageMouseUp}
      >
        {pdfPage ? (
          <div>
            <img
              src={pdfPage}
              alt='Page 1'
              style={{
                maxWidth: '100%',
                transform: `scale(${zoomLevel}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                cursor: isDragging
                  ? 'grabbing'
                  : isCropping
                  ? 'crosshair'
                  : 'grab',
              }}
            />
          </div>
        ) : (
          <>No PDF file selected</>
        )}
      </div>
     
      {croppedArea && (
        <div>
          <h4>Cropped Area Coordinates</h4>
          <p>Start X: {croppedArea.startX}</p>
          <p>Start Y: {croppedArea.startY}</p>
          <p>End X: {croppedArea.endX}</p>
          <p>End Y: {croppedArea.endY}</p>
        </div>
      )}
    </div>
  );
};

export default App;