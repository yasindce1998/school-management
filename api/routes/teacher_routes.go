package routes

import (
	"school-management-api/api/controllers"

	"github.com/gin-gonic/gin"
)

// SetupTeacherRoutes sets up teacher-related routes
func SetupTeacherRoutes(router *gin.RouterGroup, controller *controllers.TeacherController, authMiddleware gin.HandlerFunc) {
	teachers := router.Group("/teachers")
	{
		teachers.GET("", controller.GetTeachers)
		teachers.GET("/:id", controller.GetTeacher)
		teachers.POST("", authMiddleware, controller.CreateTeacher)
		teachers.PUT("/:id", authMiddleware, controller.UpdateTeacher)
		teachers.DELETE("/:id", authMiddleware, controller.DeleteTeacher)
		teachers.GET("/:id/courses", controller.GetTeacherCourses)
		teachers.POST("/:id/courses", authMiddleware, controller.AssignCourse)
		teachers.DELETE("/:id/courses/:courseId", authMiddleware, controller.RemoveCourse)
	}
}
