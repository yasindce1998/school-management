package routes

import (
	"school-management-api/api/controllers"

	"github.com/gin-gonic/gin"
)

// SetupGradeRoutes sets up grade routes
func SetupGradeRoutes(router *gin.RouterGroup, gradeController *controllers.GradeController, authMiddleware gin.HandlerFunc, teacherAdminMiddleware gin.HandlerFunc) {
	grades := router.Group("/grades")
	{
		grades.POST("", authMiddleware, teacherAdminMiddleware, gradeController.CreateGrade)
		grades.PUT("/:id", authMiddleware, teacherAdminMiddleware, gradeController.UpdateGrade)
		grades.DELETE("/:id", authMiddleware, teacherAdminMiddleware, gradeController.DeleteGrade)
		grades.GET("/:id", authMiddleware, gradeController.GetGrade)
		grades.GET("", authMiddleware, gradeController.GetAllGrades)
		grades.GET("/student/:studentId", authMiddleware, gradeController.GetGradesByStudent)
		grades.GET("/course/:courseId", authMiddleware, gradeController.GetGradesByCourse)
		grades.GET("/student/:studentId/gpa", authMiddleware, gradeController.GetStudentGPA)
		grades.GET("/course/:courseId/distribution", authMiddleware, gradeController.GetCourseGradeDistribution)
	}
}
