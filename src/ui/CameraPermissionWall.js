import { useEffect, useState } from 'react';

import './CameraPermissionWall.css';

const CameraPermissionWall = ({ children }) => {
  const [permitted, setPermitted] = useState();

  useEffect(() => {
    const abortController = new AbortController();

    (async function () {
      const devices = await navigator.mediaDevices.enumerateDevices();

      if (abortController.signal.aborted) {
        return;
      }

      const videoInputPlaceholderDevice = devices.find(({ kind, label }) => kind === 'videoinput' && !label);

      if (videoInputPlaceholderDevice) {
        setPermitted(false);

        await navigator.mediaDevices.getUserMedia({ video: { deviceId: videoInputPlaceholderDevice.deviceId } });

        if (abortController.signal.aborted) {
          return;
        }
      }

      setPermitted(true);
    })();

    return () => abortController.abort();
  }, [setPermitted]);

  return typeof permitted !== 'boolean' ? (
    <div className="camera-permission-wall camera-permission-wall--checking">Checking camera access&hellip;</div>
  ) : permitted ? (
    children
  ) : (
    <div className="camera-permission-wall camera-permission-wall--asking">Please allow camera access to continue.</div>
  );
};

export default CameraPermissionWall;
