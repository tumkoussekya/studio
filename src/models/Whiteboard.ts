
export type Tool = 'pen' | 'rectangle';

export interface BaseDrawingData {
  tool: Tool;
  color: string;
  brushSize: number;
}
export interface PenData extends BaseDrawingData {
  tool: 'pen';
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export interface RectangleData extends BaseDrawingData {
  tool: 'rectangle';
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export interface ClearData {}

export type DrawingData = PenData | RectangleData;
