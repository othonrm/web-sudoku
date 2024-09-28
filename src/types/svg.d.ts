declare module "*.svg?react" {
    import { FunctionalComponent, SVGAttributes } from "preact";
    const content: FunctionalComponent<SVGAttributes<SVGSVGElement>>;
    export default content;
}
