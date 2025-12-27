package com.example.featureselection.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<Object> handleMissingPart(MissingServletRequestPartException ex) {
        System.out.println("DEBUG: MissingServletRequestPartException: " + ex.getMessage());
        log.warn("Missing Request Part: {}", ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Object> handleMissingParam(MissingServletRequestParameterException ex) {
        System.out.println("DEBUG: MissingServletRequestParameterException: " + ex.getMessage());
        log.warn("Missing Request Parameter: {}", ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Object> handleIllegalArgumentException(IllegalArgumentException ex) {
        System.out.println("DEBUG: IllegalArgumentException: " + ex.getMessage());
        log.warn("Bad Request: {}", ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Object> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        log.warn("File too large: {}", exc.getMessage());
        return buildResponse(HttpStatus.EXPECTATION_FAILED, "File too large!");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleAllExceptions(Exception ex) {
        // Unwrap RuntimeException if it wraps an IllegalArgumentException
        if (ex instanceof RuntimeException && ex.getCause() instanceof IllegalArgumentException) {
            System.out.println("DEBUG: Wrapped IllegalArgumentException: " + ex.getCause().getMessage());
            log.warn("Bad Request (Wrapped): {}", ex.getCause().getMessage());
            return buildResponse(HttpStatus.BAD_REQUEST, ex.getCause().getMessage());
        }

        System.out.println("DEBUG: Internal Server Error: " + ex.getClass().getName() + " - " + ex.getMessage());
        // Print stack trace to stderr to ensure it appears in Jenkins logs
        ex.printStackTrace(); 
        log.error("Internal Server Error", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An internal error occurred: " + ex.getMessage());
    }

    private ResponseEntity<Object> buildResponse(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return new ResponseEntity<>(body, status);
    }
}
