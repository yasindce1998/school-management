package routes

import (
	"school-management-api/api/controllers"

	"github.com/gin-gonic/gin"
)

// SetupStudentRoutes sets up student-related routes
func SetupStudentRoutes(router *gin.RouterGroup, controller *controllers.StudentController, authMiddleware gin.HandlerFunc) {
	students := router.Group("/students")
	{
		students.GET("", controller.GetStudents)
		students.GET("/:id", controller.GetStudent)
		students.POST("", authMiddleware, controller.CreateStudent)
		students.PUT("/:id", authMiddleware, controller.UpdateStudent)
		students.DELETE("/:id", authMiddleware, controller.DeleteStudent)
		students.GET("/:id/courses", controller.GetStudentCourses)
		students.POST("/:id/courses", authMiddleware, controller.EnrollCourse)
		students.DELETE("/:id/courses/:courseId", authMiddleware, controller.DropCourse)
	}
}
