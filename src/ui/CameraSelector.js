import { useCallback, useEffect, useState } from 'react';

import useValueRef from '../hooks/useValueRef';

const CameraSelector = ({ className, onChange, value }) => {
  const onChangeRef = useValueRef(onChange);
  const [devices, setDevices] = useState([]);

  const handleChange = useCallback(
    ({ target: { value } }) => {
      onChangeRef.current?.(value);
    },
    [onChangeRef]
  );

  useEffect(() => {
    const abortController = new AbortController();

    (async function () {
      const devices = await navigator.mediaDevices.enumerateDevices();

      if (abortController.signal.aborted) {
        return;
      }

      const videoInputDevices = devices.filter(({ kind }) => kind === 'videoinput');

      setDevices(videoInputDevices);
      onChangeRef.current?.(videoInputDevices[0]?.deviceId);
    })();

    return () => abortController.abort();
  }, [onChangeRef, setDevices]);

  return (
    <select className={className} onChange={handleChange} value={value}>
      {devices.map(({ deviceId, label }) => (
        <option key={deviceId} value={deviceId}>
          {label}
        </option>
      ))}
    </select>
  );
};

export default CameraSelector;
