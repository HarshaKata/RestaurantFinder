package com.example.RestaurantFinder.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.io.IOException;
import java.net.URL;
import java.time.Duration;
import java.util.Objects;
import java.util.UUID;

// @Service
// public class S3Service {

//     @Autowired
//     private S3Client s3Client;

//     @Value("${aws.s3.bucket}")
//     private String bucketName;

//     public String uploadFile(MultipartFile file, String restaurantName) throws IOException {
//         // Generate unique filename
//         System.out.println("came inside uploadFile");
//         String originalFilename = file.getOriginalFilename();
//         System.out.println(originalFilename);
//         if(Objects.isNull(restaurantName)){
//             restaurantName = "default restaurant";
//         }
//         String fileExtension = originalFilename != null
//                 ? originalFilename.substring(originalFilename.lastIndexOf("."))
//                 : ".jpg";

//         String uniqueFilename = "restaurants/" + restaurantName + "/" +
//                 UUID.randomUUID().toString() + fileExtension;

//         // Create PUT request
//         PutObjectRequest putRequest = PutObjectRequest.builder()
//                 .bucket(bucketName)
//                 .key(uniqueFilename)
//                 .contentType(file.getContentType())
//                 .build();
//         System.out.println(file.getInputStream());
//         // Upload to S3
//         s3Client.putObject(putRequest, RequestBody.fromInputStream(
//                 file.getInputStream(), file.getSize()));

//         return createPresignedGetUrl(bucketName,uniqueFilename);
//     }

//     public String createPresignedGetUrl(String bucketName, String keyName) {
//         S3Presigner presigner = S3Presigner.builder()
//                 .region(Region.US_WEST_1)
//                 .build();

//         try (presigner) {
//             GetObjectRequest objectRequest = GetObjectRequest.builder()
//                     .bucket(bucketName)
//                     .key(keyName)
//                     .build();

//             GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
//                     .signatureDuration(Duration.ofDays(3))
//                     .getObjectRequest(objectRequest)
//                     .build();

//             PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);
//             System.out.println(presignRequest);
//             return presignedRequest.url().toExternalForm();
//         }
//     }

//     public void deleteFile(String fileUrl) {
//         // Extract key from full URL
//         String key = extractKeyFromUrl(fileUrl);

//         s3Client.deleteObject(builder -> builder
//                 .bucket(bucketName)
//                 .key(key)
//                 .build());
//     }

//     private String extractKeyFromUrl(String fileUrl) {
//         // Remove bucket URL to get the key
//         return fileUrl.replace(
//                 s3Client.utilities().getUrl(GetUrlRequest.builder()
//                         .bucket(bucketName)
//                         .build()).toExternalForm(),
//                 ""
//         );
//     }
// }

@Service
public class S3Service {
    private static final Logger logger = LoggerFactory.getLogger(S3Service.class);

    @Autowired
    private S3Client s3Client;

    @Value("${aws.s3.access-key}")
    private String accessKey;

    @Value("${aws.s3.secret-key}")
    private String secretKey;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    public String uploadFile(MultipartFile file, String restaurantName) throws S3ServiceException {
        // System.out.println(aws.s3.access-key);
        try {
            validateFile(file);
            String uniqueFilename = generateUniqueFilename(file, restaurantName);
            uploadToS3(file, uniqueFilename);
            return createPresignedGetUrl(bucketName, uniqueFilename);
        } catch (IOException e) {
            logger.error("Failed to process file upload: {}", e.getMessage());
            throw new S3ServiceException("Failed to upload file", e);
        } catch (Exception e) {
            logger.error("Unexpected error during file upload: {}", e.getMessage());
            throw new S3ServiceException("Unexpected error during file upload", e);
        }
    }

    private void validateFile(MultipartFile file) throws S3ServiceException {
        if (file == null || file.isEmpty()) {
            throw new S3ServiceException("File is empty or null");
        }
        if (file.getSize() > 10_000_000) { // 10MB limit
            throw new S3ServiceException("File size exceeds maximum limit of 10MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new S3ServiceException("Invalid file type. Only images are allowed");
        }
    }

    private String generateUniqueFilename(MultipartFile file, String restaurantName) {
        String originalFilename = file.getOriginalFilename();
        String restaurantPath = Objects.requireNonNullElse(restaurantName, "default-restaurant")
                .replaceAll("[^a-zA-Z0-9-]", "-");

        String fileExtension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";

        return String.format("restaurants/%s/%s%s",
                restaurantPath, UUID.randomUUID(), fileExtension);
    }

    private void uploadToS3(MultipartFile file, String key) throws IOException {
        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            logger.info("Successfully uploaded file to S3: {}", key);
        } catch (Exception e) {
            logger.error("Failed to upload file to S3: {}", e.getMessage());
            throw new S3ServiceException("Failed to upload file to S3", e);
        }
    }

    public String createPresignedGetUrl(String bucketName, String keyName) throws S3ServiceException {
        try (S3Presigner presigner = S3Presigner.builder()
                .region(Region.of("us-west-1")) // Replace with your bucket's region
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .build()) {
            GetObjectRequest objectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(keyName)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(15))
                    .getObjectRequest(objectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);
            return presignedRequest.url().toExternalForm();
        } catch (Exception e) {
            logger.error("Failed to create presigned URL: {}", e.getMessage());
            throw new S3ServiceException("Failed to create presigned URL", e);
        }
    }

    public void deleteFile(String fileUrl) throws S3ServiceException {
        try {
            String key = extractKeyFromUrl(fileUrl);
            s3Client.deleteObject(builder -> builder
                    .bucket(bucketName)
                    .key(key)
                    .build());
            logger.info("Successfully deleted file from S3: {}", key);
        } catch (Exception e) {
            logger.error("Failed to delete file from S3: {}", e.getMessage());
            throw new S3ServiceException("Failed to delete file from S3", e);
        }
    }

    private String extractKeyFromUrl(String fileUrl) throws S3ServiceException {
        try {
            return fileUrl.replace(
                    s3Client.utilities().getUrl(GetUrlRequest.builder()
                            .bucket(bucketName)
                            .build()).toExternalForm(),
                    "");
        } catch (Exception e) {
            throw new S3ServiceException("Failed to extract key from URL", e);
        }
    }
}

// @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
// public class S3ServiceException extends RuntimeException {
// public S3ServiceException(String message) {
// super(message);
// }

// public S3ServiceException(String message, Throwable cause) {
// super(message, cause);
// }
// }