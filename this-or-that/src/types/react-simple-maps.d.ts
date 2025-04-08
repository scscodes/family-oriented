declare module 'react-simple-maps' {
  import { FC, ReactNode } from 'react';

  export interface Geography {
    rsmKey: string;
    properties: {
      name: string;
      [key: string]: string | number | boolean | null;
    };
    [key: string]: string | number | boolean | null | object;
  }

  export interface ComposableMapProps {
    projection?: string;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    children?: ReactNode;
  }

  export interface GeographiesProps {
    geography: string | object;
    children: (props: { geographies: Geography[] }) => ReactNode;
  }

  export interface GeographyProps {
    geography: Geography;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    onClick?: (event: React.MouseEvent) => void;
  }

  export interface ZoomableGroupProps {
    children: ReactNode;
  }

  export const ComposableMap: FC<ComposableMapProps>;
  export const Geographies: FC<GeographiesProps>;
  export const Geography: FC<GeographyProps>;
  export const ZoomableGroup: FC<ZoomableGroupProps>;
} 