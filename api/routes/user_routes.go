package routes

import (
	"school-management-api/api/controllers"

	"github.com/gin-gonic/gin"
)

// SetupUserRoutes sets up user-related routes
func SetupUserRoutes(router *gin.RouterGroup, controller *controllers.UserController, authMiddleware gin.HandlerFunc, adminMiddleware gin.HandlerFunc) {
	// Public routes
	router.POST("/login", controller.Login)

	// Protected routes
	users := router.Group("/users")
	{
		users.GET("", authMiddleware, adminMiddleware, controller.GetUsers)
		users.GET("/:id", authMiddleware, controller.GetUser)
		users.POST("", authMiddleware, adminMiddleware, controller.CreateUser)
		users.PUT("/:id", authMiddleware, controller.UpdateUser)
		users.DELETE("/:id", authMiddleware, adminMiddleware, controller.DeleteUser)
	}
}
