package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"school-management-api/api/controllers"
	"school-management-api/api/routes"
	"school-management-api/config"
	"school-management-api/internal/repositories"
	"school-management-api/internal/services"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	appConfig, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Set up database connection
	db, err := config.SetupDatabase(appConfig)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Run database migrations
	if err := config.MigrateDB(db); err != nil {
		log.Fatalf("Failed to run database migrations: %v", err)
	}

	// Seed database with initial data
	if err := config.SeedDB(db); err != nil {
		log.Fatalf("Failed to seed database: %v", err)
	}
	// Set up repositories
	studentRepo := repositories.NewStudentRepository(db)
	teacherRepo := repositories.NewTeacherRepository(db)
	courseRepo := repositories.NewCourseRepository(db)
	userRepo := repositories.NewUserRepository(db)
	gradeRepo := repositories.NewGradeRepository(db)
	attendanceRepo := repositories.NewAttendanceRepository(db)

	// Set up services
	studentService := services.NewStudentService(studentRepo, courseRepo)
	teacherService := services.NewTeacherService(teacherRepo, courseRepo)
	courseService := services.NewCourseService(courseRepo)
	userService := services.NewUserService(userRepo, appConfig.JWTSecret)
	gradeService := services.NewGradeService(gradeRepo)
	attendanceService := services.NewAttendanceService(attendanceRepo)

	// Set up controllers
	studentController := controllers.NewStudentController(studentService)
	teacherController := controllers.NewTeacherController(teacherService)
	courseController := controllers.NewCourseController(courseService)
	userController := controllers.NewUserController(userService)
	gradeController := controllers.NewGradeController(gradeService)
	attendanceController := controllers.NewAttendanceController(attendanceService)

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}
	// Set up router
	router := routes.SetupRouter(
		studentController,
		teacherController,
		courseController,
		userController,
		gradeController,
		attendanceController,
		appConfig.JWTSecret,
	)

	// Create HTTP server
	addr := fmt.Sprintf(":%d", appConfig.Port)
	server := &http.Server{
		Addr:    addr,
		Handler: router,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Server starting on port %d", appConfig.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shut down the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")
	// Create a deadline to wait for current operations to complete
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Shut down the server
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited gracefully")
}
