package models

import (
	"github.com/google/uuid"
)

// Course represents an academic course in the school
type Course struct {
	Base
	Code        string    `json:"code" gorm:"uniqueIndex"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Credits     int       `json:"credits"`
	Department  string    `json:"department"`
	Students    []Student `json:"students,omitempty" gorm:"many2many:student_courses;"`
	Teachers    []Teacher `json:"teachers,omitempty" gorm:"many2many:teacher_courses;"`
}

// CourseResponse is the API response structure for courses
type CourseResponse struct {
	ID          uuid.UUID        `json:"id"`
	Code        string           `json:"code"`
	Name        string           `json:"name"`
	Description string           `json:"description"`
	Credits     int              `json:"credits"`
	Department  string           `json:"department"`
	Students    []StudentSummary `json:"students,omitempty"`
	Teachers    []TeacherSummary `json:"teachers,omitempty"`
}

// StudentSummary is a simplified student representation for course responses
type StudentSummary struct {
	ID        uuid.UUID `json:"id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Email     string    `json:"email"`
}

// TeacherSummary is a simplified teacher representation for course responses
type TeacherSummary struct {
	ID        uuid.UUID `json:"id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Email     string    `json:"email"`
}
