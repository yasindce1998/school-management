package middlewares

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// JWTAuthMiddleware is a middleware that checks for a valid JWT token
func JWTAuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization header is required"})
			return
		}

		// Check if the Authorization header has the correct format
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization header format must be Bearer {token}"})
			return
		}

		// Parse the JWT token
		tokenString := parts[1]
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validate the signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(jwtSecret), nil
		})

		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		// Check if the token is valid
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			// Store user info in the context
			userID, err := uuid.Parse(claims["sub"].(string))
			if err != nil {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
				return
			}

			c.Set("userID", userID)
			c.Set("username", claims["name"])
			c.Set("role", claims["role"])
			c.Next()
		} else {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
		}
	}
}

// RoleAuthMiddleware is a middleware that checks if the user has the required role
func RoleAuthMiddleware(requiredRoles interface{}) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		// Convert requiredRoles to slice of strings regardless of input type
		var roles []string
		switch v := requiredRoles.(type) {
		case string:
			roles = []string{v}
		case []string:
			roles = v
		default:
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "invalid role configuration"})
			return
		}

		hasRole := false
		for _, role := range roles {
			if userRole == role {
				hasRole = true
				break
			}
		}

		if !hasRole {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}

		c.Next()
	}
}

// CORSMiddleware is a middleware that handles CORS
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
