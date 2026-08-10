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

    // ============================================
    // VIDEO
    // ============================================
console.log("Image in VBArray",backgroundImage.current);

    const video = document.createElement("video");

    video.srcObject = cameraStream;
    video.muted = true;
    video.playsInline = true;

    await video.play();


    // ============================================
    // MAIN CANVAS
    // ============================================

    const canvas = document.createElement("canvas");

    canvas.width = 1280;
    canvas.height = 720;

    const ctx = canvas.getContext("2d");


    // ============================================
    // PERSON CANVAS
    // ============================================

    const personCanvas = document.createElement("canvas");

    personCanvas.width = canvas.width;
    personCanvas.height = canvas.height;

    const personCtx = personCanvas.getContext("2d");


    // ============================================
    // MASK CANVAS
    // ============================================

    const maskCanvas = document.createElement("canvas");

    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;

    const maskCtx = maskCanvas.getContext(
        "2d",
        {
            willReadFrequently: true
        }
    );


    // ============================================
    // MEDIAPIPE
    // ============================================
    
    const mediapipe = await getSegmenter();
    

    let running = true;
    let timeoutId = null;

//Background Image

    const bgImage=new Image();
    bgImage.src=backgroundImage.current
    await new Promise((resolve,reject)=>{
      bgImage.onload=resolve
      bgImage.onerror=reject
    })

    // ============================================
    // PROCESS FRAME
    // ============================================
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

        // ==========================================
        // 1. GET MEDIAPIPE MASK
        // ==========================================

        const maskData =
            confidenceMask.getAsFloat32Array();

        const maskWidth =
            confidenceMask.width;

        const maskHeight =
            confidenceMask.height;


        // ==========================================
        // 2. CREATE TEMPORARY MASK CANVAS
        //    AT MEDIAPIPE'S ORIGINAL SIZE
        // ==========================================


        smallMaskCanvas.width = maskWidth;
        smallMaskCanvas.height = maskHeight;

        const imageData =
            smallMaskCtx.createImageData(
                maskWidth,
                maskHeight
            );


        // ==========================================
        // 3. FLOAT MASK -> ALPHA MASK
        // ==========================================

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


        // ==========================================
        // 4. SCALE MASK TO FULL VIDEO SIZE
        // ==========================================

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


        // ==========================================
        // 5. CLEAR FINAL CANVAS
        // ==========================================

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // ==========================================
        // 6. DRAW BLURRED CAMERA
        // ==========================================

// ==========================================
// 6. DRAW BLACK BACKGROUND
// ==========================================

ctx.save();

ctx.drawImage(
    bgImage,
    0,
    0,
    canvas.width,
    canvas.height
);

  
ctx.restore();


        // ==========================================
        // 7. DRAW ORIGINAL VIDEO
        //    TO PERSON CANVAS
        // ==========================================

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


        // ==========================================
        // 8. APPLY PERSON MASK
        // ==========================================

        personCtx.globalCompositeOperation =
            "destination-in";

        personCtx.drawImage(
            maskCanvas,
            0,
            0,
            canvas.width,
            canvas.height
        );


        // ==========================================
        // 9. RESET
        // ==========================================

        personCtx.globalCompositeOperation =
            "source-over";


        // ==========================================
        // 10. PUT PERSON OVER BLURRED BACKGROUND
        // ==========================================

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


    // ============================================
    // START
    // ============================================

    processFrame();


    // ============================================
    // CANVAS -> MEDIA STREAM
    // ============================================

    const processedStream =
        canvas.captureStream(30);


    // ============================================
    // KEEP MICROPHONE
    // ============================================

    const audioTrack =
        cameraStream.getAudioTracks()[0];


    if (audioTrack) {

        processedStream.addTrack(
            audioTrack
        );
    }


    // ============================================
    // CLEANUP
    // ============================================

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
