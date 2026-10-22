import {
    FilesetResolver,
    ImageSegmenter
} from "@mediapipe/tasks-vision";

let segmenter = null;

async function getSegmenter() {
    if (segmenter) {
        return segmenter;
    }

    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

    segmenter = await ImageSegmenter.createFromOptions(
        vision,
        {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",

                delegate: "GPU",
            },

            runningMode: "VIDEO",

            outputCategoryMask: false,
            outputConfidenceMasks: true,
        }
    );

    return segmenter;
}


export async function createBackgroundStream(
    cameraStream,
    backgroundImage
) {

console.log("Image in VBArray",backgroundImage.current);

    const video = document.createElement("video");

    video.srcObject = cameraStream;
    video.muted = true;
    video.playsInline = true;

    await video.play();


    const canvas = document.createElement("canvas");

    canvas.width = 1280;
    canvas.height = 720;

    const ctx = canvas.getContext("2d");

    const personCanvas = document.createElement("canvas");

    personCanvas.width = canvas.width;
    personCanvas.height = canvas.height;

    const personCtx = personCanvas.getContext("2d");


    const maskCanvas = document.createElement("canvas");

    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;

    const maskCtx = maskCanvas.getContext(
        "2d",
        {
            willReadFrequently: true
        }
    );

    
    const mediapipe = await getSegmenter();
    

    let running = true;
    let timeoutId = null;


    const bgImage=new Image();
    bgImage.src=backgroundImage.current
    await new Promise((resolve,reject)=>{
      bgImage.onload=resolve
      bgImage.onerror=reject
    })
const smallMaskCanvas = document.createElement("canvas");
const smallMaskCtx = smallMaskCanvas.getContext("2d");

function processFrame() {
    if (!running) return;

    if (
        video.readyState >= 2 &&
        video.videoWidth > 0
    ) {
        const result = mediapipe.segmentForVideo(
            video,
            performance.now()
        );

        const confidenceMask =
            result.confidenceMasks?.[0];

        if (!confidenceMask) {
            timeoutId = setTimeout(processFrame, 33);
            return;
        }

        const maskData =
            confidenceMask.getAsFloat32Array();

        const maskWidth =
            confidenceMask.width;

        const maskHeight =
            confidenceMask.height;



        smallMaskCanvas.width = maskWidth;
        smallMaskCanvas.height = maskHeight;

        const imageData =
            smallMaskCtx.createImageData(
                maskWidth,
                maskHeight
            );


        for (
            let i = 0;
            i < maskData.length;
            i++
        ) {

            const confidence =
                maskData[i];

            imageData.data[i * 4] = 255;
            imageData.data[i * 4 + 1] = 255;
            imageData.data[i * 4 + 2] = 255;

            imageData.data[i * 4 + 3] =
                Math.round(
                    confidence * 255
                );
        }


        smallMaskCtx.putImageData(
            imageData,
            0,
            0
        );

        maskCtx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        maskCtx.drawImage(
            smallMaskCanvas,

            0,
            0,
            maskWidth,
            maskHeight,

            0,
            0,
            canvas.width,
            canvas.height
        );


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

ctx.save();

ctx.drawImage(
    bgImage,
    0,
    0,
    canvas.width,
    canvas.height
);

  
ctx.restore();


        personCtx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        personCtx.globalCompositeOperation =
            "source-over";

        personCtx.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );


        personCtx.globalCompositeOperation =
            "destination-in";

        personCtx.drawImage(
            maskCanvas,
            0,
            0,
            canvas.width,
            canvas.height
        );



        personCtx.globalCompositeOperation =
            "source-over";



        ctx.drawImage(
            personCanvas,
            0,
            0,
            canvas.width,
            canvas.height
        );
    }
 if (running) {
        timeoutId = setTimeout(processFrame, 33);
    }
}

    processFrame();



    const processedStream =
        canvas.captureStream(30);


    const audioTrack =
        cameraStream.getAudioTracks()[0];


    if (audioTrack) {

        processedStream.addTrack(
            audioTrack
        );
    }


processedStream.stopProcessing = () => {
    running = false;

    if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }

    video.pause();
    video.srcObject = null;

    processedStream
        .getVideoTracks()
        .forEach(track => track.stop());
};

    return processedStream;
}
