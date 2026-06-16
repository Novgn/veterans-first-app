type FontSizeTuple = [string, { lineHeight: string; letterSpacing?: string; fontWeight?: string }];

declare const tokens: {
  palette: Record<string, string>;
  colors: Record<string, string | Record<string | number, string>>;
  fontSize: Record<string, FontSizeTuple>;
  fontFamily: Record<string, string[]>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  boxShadow: Record<string, string>;
  motion: { duration: string; ease: string };
};

export = tokens;
