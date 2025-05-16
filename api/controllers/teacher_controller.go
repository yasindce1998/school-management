package controllers

import (
	"net/http"
	"strconv"

	"school-management-api/internal/models"
	"school-management-api/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// TeacherController handles teacher-related HTTP requests
type TeacherController struct {
	teacherService services.TeacherService
}

// NewTeacherController creates a new instance of TeacherController
func NewTeacherController(teacherService services.TeacherService) *TeacherController {
	return &TeacherController{
		teacherService: teacherService,
	}
}

// GetTeachers retrieves all teachers with pagination
func (c *TeacherController) GetTeachers(ctx *gin.Context) {
	// Parse pagination parameters
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("pageSize", "10"))

	// Get teachers from service
	teachers, total, err := c.teacherService.GetAllTeachers(ctx, page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, gin.H{
		"data": teachers,
		"meta": gin.H{
			"page":      page,
			"pageSize":  pageSize,
			"total":     total,
			"totalPage": (total + int64(pageSize) - 1) / int64(pageSize),
		},
	})
}

// GetTeacher retrieves a teacher by ID
func (c *TeacherController) GetTeacher(ctx *gin.Context) {
	// Parse ID
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	// Get teacher from service
	teacher, err := c.teacherService.GetTeacherByID(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "teacher not found"})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, teacher)
}

// CreateTeacher creates a new teacher
func (c *TeacherController) CreateTeacher(ctx *gin.Context) {
	// Parse request body
	var teacher models.Teacher
	if err := ctx.ShouldBindJSON(&teacher); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create teacher
	err := c.teacherService.CreateTeacher(ctx, &teacher)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusCreated, gin.H{"message": "teacher created successfully", "id": teacher.ID})
}

// UpdateTeacher updates a teacher
func (c *TeacherController) UpdateTeacher(ctx *gin.Context) {
	// Parse ID
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	// Parse request body
	var teacher models.Teacher
	if err := ctx.ShouldBindJSON(&teacher); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set ID
	teacher.ID = id

	// Update teacher
	err = c.teacherService.UpdateTeacher(ctx, &teacher)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, gin.H{"message": "teacher updated successfully"})
}

// DeleteTeacher deletes a teacher
func (c *TeacherController) DeleteTeacher(ctx *gin.Context) {
	// Parse ID
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	// Delete teacher
	err = c.teacherService.DeleteTeacher(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, gin.H{"message": "teacher deleted successfully"})
}

// AssignCourse assigns a course to a teacher
func (c *TeacherController) AssignCourse(ctx *gin.Context) {
	// Parse IDs
	teacherID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid teacher ID"})
		return
	}

	// Parse request body
	var req struct {
		CourseID uuid.UUID `json:"course_id" binding:"required"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Assign course to teacher
	err = c.teacherService.AssignCourse(ctx, teacherID, req.CourseID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, gin.H{"message": "course assigned to teacher successfully"})
}

// RemoveCourse removes a course from a teacher
func (c *TeacherController) RemoveCourse(ctx *gin.Context) {
	// Parse IDs
	teacherID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid teacher ID"})
		return
	}

	courseID, err := uuid.Parse(ctx.Param("courseId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid course ID"})
		return
	}

	// Remove course from teacher
	err = c.teacherService.RemoveCourse(ctx, teacherID, courseID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, gin.H{"message": "course removed from teacher successfully"})
}

// GetTeacherCourses retrieves all courses for a teacher
func (c *TeacherController) GetTeacherCourses(ctx *gin.Context) {
	// Parse ID
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	// Get courses
	courses, err := c.teacherService.GetTeacherCourses(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, courses)
}
