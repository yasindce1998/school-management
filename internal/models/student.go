package models

import (
	"time"

	"github.com/google/uuid"
)

// Student represents a student in the school
type Student struct {
	Base
	FirstName      string      `json:"first_name"`
	LastName       string      `json:"last_name"`
	Email          string      `json:"email" gorm:"uniqueIndex"`
	DateOfBirth    time.Time   `json:"date_of_birth"`
	Gender         string      `json:"gender"`
	Address        string      `json:"address"`
	Phone          string      `json:"phone"`
	EnrollmentDate time.Time   `json:"enrollment_date"`
	GradeLevel     string      `json:"grade_level"`
	CourseIDs      []uuid.UUID `json:"course_ids" gorm:"-"`
	Courses        []Course    `json:"courses" gorm:"many2many:student_courses;"`
}

// StudentResponse is the API response structure for students
type StudentResponse struct {
	ID             uuid.UUID `json:"id"`
	FirstName      string    `json:"first_name"`
	LastName       string    `json:"last_name"`
	Email          string    `json:"email"`
	DateOfBirth    time.Time `json:"date_of_birth"`
	Gender         string    `json:"gender"`
	Address        string    `json:"address"`
	Phone          string    `json:"phone"`
	EnrollmentDate time.Time `json:"enrollment_date"`
	GradeLevel     string    `json:"grade_level"`
	Courses        []Course  `json:"courses,omitempty"`
}
