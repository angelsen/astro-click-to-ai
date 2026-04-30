export type CapturedClick = {
  timestamp: string;
  url: string;
  pathname: string;
  tag: string;
  id: string;
  classes: string[];
  selector: string;
  text: string;
  outerHtml: string;
  rect: { x: number; y: number; width: number; height: number };
  note: string;
};

export type ClickList = CapturedClick[];
