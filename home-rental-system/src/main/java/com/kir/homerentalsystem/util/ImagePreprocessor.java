package com.kir.homerentalsystem.util;

import java.awt.Rectangle;
import java.awt.image.BufferedImage;
import java.awt.image.DataBufferByte;


import jakarta.annotation.PostConstruct;
import org.opencv.core.Mat;
import org.opencv.core.Rect;
import org.opencv.core.CvType;
import org.opencv.core.Scalar;
import org.opencv.imgproc.Imgproc;
import org.opencv.core.Size;
import org.opencv.core.MatOfByte;
import org.opencv.core.Mat;
import org.opencv.core.CvType;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.core.Mat;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.springframework.stereotype.Component;

@Component
public class ImagePreprocessor {

    @PostConstruct
    public void init() {
        // Load OpenCV native library
        nu.pattern.OpenCV.loadLocally();
    }

    public BufferedImage preprocessCitizenID(BufferedImage originalImage) {
        // Convert BufferedImage to Mat
        Mat source = bufferedImageToMat(originalImage);

        // Convert to grayscale
        Mat gray = new Mat();
        Imgproc.cvtColor(source, gray, Imgproc.COLOR_BGR2GRAY);

        // Apply adaptive thresholding
        Mat binary = new Mat();
        Imgproc.adaptiveThreshold(gray, binary, 255,
                Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C,
                Imgproc.THRESH_BINARY, 11, 2);

        // Optional: Noise removal
        Mat processed = new Mat();
        Mat kernel = Imgproc.getStructuringElement(Imgproc.MORPH_RECT, new Size(1, 1));
        Imgproc.morphologyEx(binary, processed, Imgproc.MORPH_CLOSE, kernel);

        // Crop specific area where Citizen ID data is located
        Mat croppedMat = cropMat(processed, new Rect(50, 100, 300, 200)); // Example coordinates

        // Convert back to BufferedImage
        return matToBufferedImage(croppedMat);
    }

    private Mat cropMat(Mat source, Rect roi) {
        return new Mat(source, roi);
    }

    private Mat bufferedImageToMat(BufferedImage image) {
        // Convert BufferedImage to Mat
        Mat mat = new Mat(image.getHeight(), image.getWidth(), CvType.CV_8UC3);
        byte[] data = ((DataBufferByte) image.getRaster().getDataBuffer()).getData();
        mat.put(0, 0, data);
        return mat;
    }

    private BufferedImage matToBufferedImage(Mat matrix) {
        // Convert Mat to BufferedImage
        int type = BufferedImage.TYPE_BYTE_GRAY;
        BufferedImage image = new BufferedImage(matrix.width(), matrix.height(), type);
        byte[] data = ((DataBufferByte) image.getRaster().getDataBuffer()).getData();
        matrix.get(0, 0, data);
        return image;
    }
}
