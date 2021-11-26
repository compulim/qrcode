import { useEffect, useRef, useState } from 'react';
import { BarcodeFormat, BrowserMultiFormatReader, DecodeHintType } from '@zxing/library';
import classNames from 'classnames';

import './Camera.css';
import useValueRef from '../hooks/useValueRef';

const GET_USER_MEDIA_VIDEO_PREFERENCES = {
  height: 1080,
  width: 1920
};

const Camera = ({ className, deviceId, onQRCode }) => {
  const onQRCodeRef = useValueRef(onQRCode);
  const videoRef = useRef();

  const [reader] = useState(() => {
    const hints = new Map();

    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);

    return new BrowserMultiFormatReader(hints);
  });

  useEffect(() => {
    const abortController = new AbortController();

    reader.stopContinuousDecode();

    (async function () {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId, ...GET_USER_MEDIA_VIDEO_PREFERENCES } : GET_USER_MEDIA_VIDEO_PREFERENCES
      });

      if (abortController.signal.aborted) {
        return;
      }

      videoRef.current.srcObject = mediaStream;

      videoRef.current.addEventListener(
        'loadedmetadata',
        ({ target }) => {
          abortController.signal.aborted || target.play();
        },
        { once: true }
      );
    })();

    return () => {
      reader.stopContinuousDecode();
      abortController.abort();
    };
  }, [deviceId, onQRCodeRef, reader]);

  useEffect(() => {
    const abortController = new AbortController();

    reader.decodeFromVideoElementContinuously(videoRef.current, event => {
      if (abortController.signal.aborted || !event) {
        return;
      }

      onQRCodeRef.current?.({ imageSource: videoRef.current, qrCode: event?.getText() });
    });

    videoRef.current?.play();

    return () => {
      reader.stopContinuousDecode();
      abortController.abort();
    };
  }, [onQRCodeRef, reader, videoRef]);

  return (
    <div className={classNames('camera', className)}>
      <video className="camera__video" ref={videoRef} />
    </div>
  );
};

export default Camera;
