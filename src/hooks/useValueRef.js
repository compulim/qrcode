import { useRef } from 'react';

export default function useValueRef(value) {
  const ref = useRef();

  ref.current = value;

  return ref;
}
