import type { Element } from '../../types';

interface Props {
  element: Element;
  size?: number;
}

export default function ElementIcon({ element, size = 14 }: Props) {
  return (
    <span
      className={`element-icon element-icon--${element}`}
      style={{ width: size, height: size }}
      aria-label={element}
      role="img"
    />
  );
}
