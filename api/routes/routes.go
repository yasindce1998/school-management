package routes

import (
	"school-management-api/api/controllers"
	"school-management-api/api/middlewares"

	"github.com/gin-gonic/gin"
)

// SetupRouter sets up all routes
func SetupRouter(
	studentController *controllers.StudentController,
	teacherController *controllers.TeacherController,
	courseController *controllers.CourseController,
	userController *controllers.UserController,
	gradeController *controllers.GradeController,
	attendanceController *controllers.AttendanceController,
	jwtSecret string,
) *gin.Engine {
	// Create a new Gin router
	router := gin.Default()

	// Apply global middlewares
	router.Use(middlewares.CORSMiddleware())
	router.Use(middlewares.LoggerMiddleware())

	// Create JWT auth middleware
	authMiddleware := middlewares.JWTAuthMiddleware(jwtSecret)

	// Create role-based middlewares
	adminMiddleware := middlewares.RoleAuthMiddleware("Admin")
	teacherAdminMiddleware := middlewares.RoleAuthMiddleware([]string{"Admin", "Teacher"})

	// Create API route group
	api := router.Group("/api/v1")
	// Set up routes
	SetupUserRoutes(api, userController, authMiddleware, adminMiddleware)
	SetupStudentRoutes(api, studentController, authMiddleware)
	SetupTeacherRoutes(api, teacherController, authMiddleware)
	SetupCourseRoutes(api, courseController, authMiddleware)
	SetupGradeRoutes(api, gradeController, authMiddleware, teacherAdminMiddleware)
	SetupAttendanceRoutes(api, attendanceController, authMiddleware, teacherAdminMiddleware)
	// Health check
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Service is healthy",
		})
	})

	return router
}
