package controllers

import (
	"net/http"
	"school-management-api/internal/models"
	"school-management-api/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GradeController handles grade-related HTTP requests
type GradeController struct {
	gradeService services.GradeService
}

// NewGradeController creates a new GradeController
func NewGradeController(gradeService services.GradeService) *GradeController {
	return &GradeController{gradeService: gradeService}
}

// CreateGrade creates a new grade
func (c *GradeController) CreateGrade(ctx *gin.Context) {
	var grade models.Grade
	if err := ctx.ShouldBindJSON(&grade); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := ctx.Get("userID")
	if exists {
		grade.CreatedBy = userID.(uuid.UUID)
	}

	if err := c.gradeService.CreateGrade(&grade); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, grade)
}

// UpdateGrade updates a grade
func (c *GradeController) UpdateGrade(ctx *gin.Context) {
	// Convert string ID to UUID instead of uint
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	// Check if grade exists
	existingGrade, err := c.gradeService.GetGradeByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Grade not found"})
		return
	}

	var grade models.Grade
	if err := ctx.ShouldBindJSON(&grade); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set ID from URL parameter
	grade.ID = id

	// Get user ID from context (set by auth middleware)
	userID, exists := ctx.Get("userID")
	if exists {
		grade.UpdatedBy = userID.(uuid.UUID)
	}

	// Preserve fields that shouldn't be updated from client
	grade.CreatedBy = existingGrade.CreatedBy
	grade.CreatedAt = existingGrade.CreatedAt

	if err := c.gradeService.UpdateGrade(&grade); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, grade)
}

// DeleteGrade deletes a grade
func (c *GradeController) DeleteGrade(ctx *gin.Context) {
	// Convert string ID to UUID
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := c.gradeService.DeleteGrade(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Grade deleted successfully"})
}

// GetGrade gets a grade by ID
func (c *GradeController) GetGrade(ctx *gin.Context) {
	// Convert string ID to UUID
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	grade, err := c.gradeService.GetGradeByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Grade not found"})
		return
	}

	ctx.JSON(http.StatusOK, grade)
}

// GetAllGrades gets all grades
func (c *GradeController) GetAllGrades(ctx *gin.Context) {
	grades, err := c.gradeService.GetAllGrades()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, grades)
}

// GetGradesByStudent gets grades by student ID
func (c *GradeController) GetGradesByStudent(ctx *gin.Context) {
	// Convert string ID to UUID
	studentIDStr := ctx.Param("studentId")
	studentID, err := uuid.Parse(studentIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student ID"})
		return
	}

	grades, err := c.gradeService.GetGradesByStudent(studentID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, grades)
}

// GetGradesByCourse gets grades by course ID
func (c *GradeController) GetGradesByCourse(ctx *gin.Context) {
	// Convert string ID to UUID
	courseIDStr := ctx.Param("courseId")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	grades, err := c.gradeService.GetGradesByCourse(courseID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, grades)
}

// GetStudentGPA gets a student's GPA
func (c *GradeController) GetStudentGPA(ctx *gin.Context) {
	// Convert string ID to UUID
	studentIDStr := ctx.Param("studentId")
	studentID, err := uuid.Parse(studentIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student ID"})
		return
	}

	gpa, err := c.gradeService.GetStudentGPA(studentID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"gpa": gpa})
}

// GetCourseGradeDistribution gets the distribution of grades for a course
func (c *GradeController) GetCourseGradeDistribution(ctx *gin.Context) {
	// Convert string ID to UUID
	courseIDStr := ctx.Param("courseId")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	distribution, err := c.gradeService.GetCourseGradeDistribution(courseID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, distribution)
}
