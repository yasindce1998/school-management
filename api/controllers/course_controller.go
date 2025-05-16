package controllers

import (
	"net/http"
	"strconv"

	"school-management-api/internal/models"
	"school-management-api/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CourseController handles course-related HTTP requests
type CourseController struct {
	courseService services.CourseService
}

// NewCourseController creates a new instance of CourseController
func NewCourseController(courseService services.CourseService) *CourseController {
	return &CourseController{
		courseService: courseService,
	}
}

// GetCourses retrieves all courses with pagination
func (c *CourseController) GetCourses(ctx *gin.Context) {
	// Parse pagination parameters
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("pageSize", "10"))

	// Get courses from service
	courses, total, err := c.courseService.GetAllCourses(ctx, page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, gin.H{
		"data": courses,
		"meta": gin.H{
			"page":      page,
			"pageSize":  pageSize,
			"total":     total,
			"totalPage": (total + int64(pageSize) - 1) / int64(pageSize),
		},
	})
}

// GetCourse retrieves a course by ID
func (c *CourseController) GetCourse(ctx *gin.Context) {
	// Parse ID
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	// Get course from service
	course, err := c.courseService.GetCourseByID(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "course not found"})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, course)
}

// CreateCourse creates a new course
func (c *CourseController) CreateCourse(ctx *gin.Context) {
	// Parse request body
	var course models.Course
	if err := ctx.ShouldBindJSON(&course); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create course
	err := c.courseService.CreateCourse(ctx, &course)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusCreated, gin.H{"message": "course created successfully", "id": course.ID})
}

// UpdateCourse updates a course
func (c *CourseController) UpdateCourse(ctx *gin.Context) {
	// Parse ID
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	// Parse request body
	var course models.Course
	if err := ctx.ShouldBindJSON(&course); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set ID
	course.ID = id

	// Update course
	err = c.courseService.UpdateCourse(ctx, &course)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, gin.H{"message": "course updated successfully"})
}

// DeleteCourse deletes a course
func (c *CourseController) DeleteCourse(ctx *gin.Context) {
	// Parse ID
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	// Delete course
	err = c.courseService.DeleteCourse(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, gin.H{"message": "course deleted successfully"})
}

// GetCourseStudents retrieves all students for a course
func (c *CourseController) GetCourseStudents(ctx *gin.Context) {
	// Parse ID
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	// Get students
	students, err := c.courseService.GetCourseStudents(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, students)
}

// GetCourseTeachers retrieves all teachers for a course
func (c *CourseController) GetCourseTeachers(ctx *gin.Context) {
	// Parse ID
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	// Get teachers
	teachers, err := c.courseService.GetCourseTeachers(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, teachers)
}
