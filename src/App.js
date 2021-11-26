import { Fragment, useCallback, useRef, useState } from 'react';
import classNames from 'classnames';

import './App.css';
import Camera from './ui/Camera';
import CameraPermissionWall from './ui/CameraPermissionWall';
import CameraSelector from './ui/CameraSelector';

const HYPERLINK_PATTERN = /^https?:\/\//u;

const App = () => {
  const [cameraDeviceId, setCameraDeviceId] = useState();
  const [qrCode, setQRCode] = useState();
  const [started, setStarted] = useState();
  const canvasRef = useRef();

  const handleClick = useCallback(() => {
    setStarted(true);
  }, [setStarted]);

  const handleQRCode = useCallback(
    ({ imageSource, qrCode }) => {
      if (qrCode) {
        const { height, width } = imageSource.srcObject.getVideoTracks()[0].getSettings();
        const { current: canvas } = canvasRef;

        if (canvas) {
          canvas.setAttribute('height', height);
          canvas.setAttribute('width', width);
          canvas.getContext('2d')?.drawImage(imageSource, 0, 0);
        }

        setQRCode(qrCode);
      }
    },
    [setQRCode]
  );

  const handleQRCodeClose = useCallback(() => {
    setQRCode('');
  }, [setQRCode]);

  return (
    <div className="app">
      <CameraPermissionWall>
        {started ? (
          <Fragment>
            <Camera
              className={classNames({ 'app__camera-blur': qrCode })}
              deviceId={cameraDeviceId}
              onQRCode={handleQRCode}
            />
            <canvas className="app__qr-code-snapshot" hidden={!qrCode} ref={canvasRef} />
            {!!qrCode && (
              <Fragment>
                <div className="app__qr-code-box">
                  <div className="app__qr-code-body">
                    {HYPERLINK_PATTERN.test(qrCode) ? (
                      <a
                        className="app__qr-code app__qr-code--link"
                        href={qrCode}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {qrCode}
                      </a>
                    ) : (
                      <span className="app__qr-code">{qrCode}</span>
                    )}
                  </div>
                </div>
                <button className="app__qr-code-close-button" onClick={handleQRCodeClose} type="button">
                  &times;
                </button>
              </Fragment>
            )}
          </Fragment>
        ) : (
          <div>
            <CameraSelector onChange={setCameraDeviceId} value={cameraDeviceId} />
            <button autoFocus={true} onClick={handleClick} type="button">
              Click here to start
            </button>
          </div>
        )}
      </CameraPermissionWall>
    </div>
  );
};

export default App;
