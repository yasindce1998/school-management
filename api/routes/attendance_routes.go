package routes

import (
	"school-management-api/api/controllers"

	"github.com/gin-gonic/gin"
)

// SetupAttendanceRoutes sets up attendance routes
func SetupAttendanceRoutes(router *gin.RouterGroup, attendanceController *controllers.AttendanceController, authMiddleware gin.HandlerFunc, teacherAdminMiddleware gin.HandlerFunc) {
	attendance := router.Group("/attendance")
	{
		// Create and modify attendance
		attendance.POST("", authMiddleware, teacherAdminMiddleware, attendanceController.CreateAttendance)
		attendance.PUT("/:id", authMiddleware, teacherAdminMiddleware, attendanceController.UpdateAttendance)
		attendance.DELETE("/:id", authMiddleware, teacherAdminMiddleware, attendanceController.DeleteAttendance)

		// Get specific attendance by ID
		attendance.GET("/:id", authMiddleware, attendanceController.GetAttendance)

		// Get all attendances (should come after specific routes)
		attendance.GET("", authMiddleware, attendanceController.GetAllAttendances)

		// Student-related routes
		studentRoutes := attendance.Group("/student")
		studentRoutes.GET("/:studentId", authMiddleware, attendanceController.GetAttendancesByStudent)
		studentRoutes.GET("/:studentId/report", authMiddleware, attendanceController.GetStudentAttendanceReport)

		// Course-related routes
		courseRoutes := attendance.Group("/course")
		courseRoutes.GET("/:courseId", authMiddleware, attendanceController.GetAttendancesByCourse)
		courseRoutes.GET("/:courseId/report", authMiddleware, attendanceController.GetCourseAttendanceReport)
		courseRoutes.GET("/:courseId/date/:date", authMiddleware, attendanceController.GetAttendancesByCourseAndDate)

		// Date-related routes
		attendance.GET("/date/:date", authMiddleware, attendanceController.GetAttendancesByDate)
	}
}
