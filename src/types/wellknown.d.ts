declare module "wellknown" {
  export function parse(wkt: string): any;
  export function stringify(geometry: any): string;
}
