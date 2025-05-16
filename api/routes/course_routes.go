package routes

import (
	"school-management-api/api/controllers"

	"github.com/gin-gonic/gin"
)

// SetupCourseRoutes sets up course-related routes
func SetupCourseRoutes(router *gin.RouterGroup, controller *controllers.CourseController, authMiddleware gin.HandlerFunc) {
	courses := router.Group("/courses")
	{
		courses.GET("", controller.GetCourses)
		courses.GET("/:id", controller.GetCourse)
		courses.POST("", authMiddleware, controller.CreateCourse)
		courses.PUT("/:id", authMiddleware, controller.UpdateCourse)
		courses.DELETE("/:id", authMiddleware, controller.DeleteCourse)
		courses.GET("/:id/students", controller.GetCourseStudents)
		courses.GET("/:id/teachers", controller.GetCourseTeachers)
	}
}
