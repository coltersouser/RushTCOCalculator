export type Mode = "sales" | "engineer";
export type FieldType = "currency" | "number" | "percent" | "toggle" | "text" ;

export type ShowWhenRule = { key: string; equals: boolean | number | string | null; };

export type FieldSchema = {
  key: string;
  label: string;
  group: string;
  type: FieldType;
  default: number | boolean | null | string;
  min?: number;
  max?: number;
  step?: number;
  advanced?: boolean;
  help?: string;
  showWhen?: ShowWhenRule[];
};

export type GroupSchema = { id: string; label: string; order: number; description?: string; };

export type InputSchema = { groups: GroupSchema[]; fields: FieldSchema[]; };

export type Inputs = Record<string, number | boolean | string | null>;

export type InputType =
  | "number"
  | "currency"
  | "percent"
  | "toggle"
  | "select"
  | "text";
