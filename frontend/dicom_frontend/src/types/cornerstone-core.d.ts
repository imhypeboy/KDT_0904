function handleImage(image: unknown) {
    if (typeof image === "object" && image !== null) {
        console.log(image);
    }
}

declare module "cornerstone-tools" {
    const cornerstoneTools: any;
    export = cornerstoneTools;
}

declare module "cornerstone-wado-image-loader" {
    const cornerstoneWADOImageLoader: any;
    export = cornerstoneWADOImageLoader;
}