// CSS module declarations for side-effect imports
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.css" {}
