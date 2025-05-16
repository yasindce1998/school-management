package middlewares

import (
	"bytes"
	"io"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// LoggerMiddleware logs each request
func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Start time
		startTime := time.Now()

		// Request ID
		requestID := uuid.New().String()
		c.Set("requestID", requestID)
		c.Header("X-Request-ID", requestID)

		// Read request body
		var requestBody []byte
		if c.Request.Body != nil {
			requestBody, _ = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))
		}

		// Process request
		c.Next()

		// End time
		endTime := time.Now()
		latency := endTime.Sub(startTime)

		// Log request information
		status := c.Writer.Status()
		method := c.Request.Method
		path := c.Request.URL.Path
		ip := c.ClientIP()
		userAgent := c.Request.UserAgent()

		// Format log message
		logMessage := gin.H{
			"status":     status,
			"latency":    latency.String(),
			"client_ip":  ip,
			"method":     method,
			"path":       path,
			"user_agent": userAgent,
			"request_id": requestID,
		}
		// Log based on status code
		if status >= 400 {
			// Log error
			logMessage["error"] = c.Errors.String()
		}

		// Use structured logging for all requests
		gin.DefaultWriter.Write([]byte(logMessage["method"].(string) + " " +
			logMessage["path"].(string) + " " +
			"Status: " + strconv.Itoa(logMessage["status"].(int)) + " " +
			"Latency: " + logMessage["latency"].(string) + "\n"))
	}
}
